import {
  type DrivingEvent,
  type GeoCoordinates,
  type TelemetrySample,
  type TripScoreBreakdown,
  type TripSummary,
  TripScoreBreakdownSchema
} from "../types/telemetry";

export interface TelematicsEngineOptions {
  harshBrakeThresholdG?: number; // default ~0.35G (-3.43 m/s^2)
  harshAccelThresholdG?: number; // default ~0.30G (2.94 m/s^2)
  sharpCornerThresholdG?: number; // default ~0.40G
  speedOverLimitToleranceKmh?: number; // default 5 km/h
}

const G_FORCE_MPS2 = 9.80665;

/**
 * Calculates distance in kilometers between two geo coordinates using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  coord1: GeoCoordinates,
  coord2: GeoCoordinates
): number {
  const R = 6371.0; // Earth radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(4));
}

/**
 * Detects driving events from a stream of telemetry samples
 */
export function detectDrivingEvents(
  samples: readonly TelemetrySample[],
  options: TelematicsEngineOptions = {}
): DrivingEvent[] {
  const harshBrakeG = options.harshBrakeThresholdG ?? 0.35;
  const harshAccelG = options.harshAccelThresholdG ?? 0.30;
  const sharpCornerG = options.sharpCornerThresholdG ?? 0.40;
  const speedTolerance = options.speedOverLimitToleranceKmh ?? 5;

  const events: DrivingEvent[] = [];

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i]!;
    const accelG = sample.accelerationMps2 / G_FORCE_MPS2;
    const absLateralG = Math.abs(sample.lateralGForce);

    // 1. Harsh Braking Check (negative acceleration)
    if (accelG < -harshBrakeG) {
      const severity =
        accelG < -0.6 ? "CRITICAL" : accelG < -0.45 ? "HIGH" : accelG < -0.38 ? "MEDIUM" : "LOW";
      const penalty = severity === "CRITICAL" ? 15 : severity === "HIGH" ? 10 : severity === "MEDIUM" ? 6 : 3;

      events.push({
        id: `ev-brake-${sample.timestamp}-${i}`,
        type: "HARSH_BRAKING",
        severity,
        timestamp: sample.timestamp,
        durationSeconds: 1,
        peakValue: Number(Math.abs(accelG).toFixed(2)),
        penaltyPoints: penalty,
        location: sample.coordinates
      });
    }

    // 2. Harsh Acceleration Check (positive acceleration)
    if (accelG > harshAccelG) {
      const severity =
        accelG > 0.55 ? "CRITICAL" : accelG > 0.42 ? "HIGH" : accelG > 0.35 ? "MEDIUM" : "LOW";
      const penalty = severity === "CRITICAL" ? 12 : severity === "HIGH" ? 8 : severity === "MEDIUM" ? 5 : 2;

      events.push({
        id: `ev-accel-${sample.timestamp}-${i}`,
        type: "HARSH_ACCELERATION",
        severity,
        timestamp: sample.timestamp,
        durationSeconds: 1,
        peakValue: Number(accelG.toFixed(2)),
        penaltyPoints: penalty,
        location: sample.coordinates
      });
    }

    // 3. Sharp Cornering Check
    if (absLateralG > sharpCornerG) {
      const severity =
        absLateralG > 0.65 ? "CRITICAL" : absLateralG > 0.52 ? "HIGH" : absLateralG > 0.45 ? "MEDIUM" : "LOW";
      const penalty = severity === "CRITICAL" ? 14 : severity === "HIGH" ? 9 : severity === "MEDIUM" ? 5 : 2;

      events.push({
        id: `ev-corner-${sample.timestamp}-${i}`,
        type: "SHARP_CORNERING",
        severity,
        timestamp: sample.timestamp,
        durationSeconds: 1,
        peakValue: Number(absLateralG.toFixed(2)),
        penaltyPoints: penalty,
        location: sample.coordinates
      });
    }

    // 4. Speed Violation Check
    const speedDelta = sample.speedKmh - (sample.speedLimitKmh + speedTolerance);
    if (speedDelta > 0) {
      const severity =
        speedDelta > 30 ? "CRITICAL" : speedDelta > 20 ? "HIGH" : speedDelta > 10 ? "MEDIUM" : "LOW";
      const penalty = severity === "CRITICAL" ? 20 : severity === "HIGH" ? 12 : severity === "MEDIUM" ? 7 : 3;

      events.push({
        id: `ev-speed-${sample.timestamp}-${i}`,
        type: "SPEED_VIOLATION",
        severity,
        timestamp: sample.timestamp,
        durationSeconds: 1,
        peakValue: Number(sample.speedKmh.toFixed(1)),
        penaltyPoints: penalty,
        location: sample.coordinates
      });
    }
  }

  return events;
}

/**
 * Computes deterministic safety and eco driving scores [0-100]
 */
export function computeTripScores(
  samples: readonly TelemetrySample[],
  events: readonly DrivingEvent[],
  distanceKm: number
): TripScoreBreakdown {
  if (samples.length === 0 || distanceKm <= 0) {
    return TripScoreBreakdownSchema.parse({
      safetyScore: 100,
      ecoScore: 100,
      smoothnessScore: 100,
      speedComplianceScore: 100,
      compositeScore: 100,
      riskCategory: "EXEMPLARY"
    });
  }

  // Calculate penalties normalized per 100 km
  const totalPenalties = events.reduce((acc, ev) => acc + ev.penaltyPoints, 0);
  const normalizedPenalty = (totalPenalties / Math.max(distanceKm, 1)) * 10;

  // 1. Safety Score
  const rawSafety = Math.max(0, 100 - normalizedPenalty);
  const safetyScore = Number(rawSafety.toFixed(1));

  // 2. Speed Compliance Score
  const speedViolations = events.filter((e) => e.type === "SPEED_VIOLATION");
  const speedPenalty = (speedViolations.reduce((a, b) => a + b.penaltyPoints, 0) / Math.max(distanceKm, 1)) * 12;
  const speedComplianceScore = Number(Math.max(0, Math.min(100, 100 - speedPenalty)).toFixed(1));

  // 3. Smoothness Score (penalizing sudden jerk/accel/cornering)
  const motionInfractions = events.filter((e) => e.type !== "SPEED_VIOLATION");
  const motionPenalty = (motionInfractions.reduce((a, b) => a + b.penaltyPoints, 0) / Math.max(distanceKm, 1)) * 10;
  const smoothnessScore = Number(Math.max(0, Math.min(100, 100 - motionPenalty)).toFixed(1));

  // 4. Eco Score (based on aggressive accelerations and speed efficiency)
  const accelInfractions = events.filter((e) => e.type === "HARSH_ACCELERATION");
  const ecoPenalty = (accelInfractions.length / Math.max(distanceKm, 1)) * 15;
  const ecoScore = Number(Math.max(0, Math.min(100, 100 - ecoPenalty)).toFixed(1));

  // Composite Weighted Score: 40% Safety, 25% Speed Compliance, 20% Smoothness, 15% Eco
  const compositeScore = Number(
    (safetyScore * 0.4 + speedComplianceScore * 0.25 + smoothnessScore * 0.2 + ecoScore * 0.15).toFixed(1)
  );

  let riskCategory: TripScoreBreakdown["riskCategory"] = "EXEMPLARY";
  if (compositeScore < 50) {
    riskCategory = "CRITICAL_RISK";
  } else if (compositeScore < 65) {
    riskCategory = "HIGH_RISK";
  } else if (compositeScore < 80) {
    riskCategory = "MODERATE";
  } else if (compositeScore < 90) {
    riskCategory = "SAFE";
  } else {
    riskCategory = "EXEMPLARY";
  }

  return {
    safetyScore,
    ecoScore,
    smoothnessScore,
    speedComplianceScore,
    compositeScore,
    riskCategory
  };
}

/**
 * Pure function to aggregate a complete raw telemetry session into a validated TripSummary
 */
export function processTelemetryTrip(
  tripId: string,
  driverId: string,
  vehicleId: string,
  samples: readonly TelemetrySample[],
  options?: TelematicsEngineOptions
): TripSummary {
  if (samples.length === 0) {
    throw new Error("Cannot process an empty telemetry session.");
  }

  const startTime = samples[0]!.timestamp;
  const endTime = samples[samples.length - 1]!.timestamp;
  const durationSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000));

  // Calculate cumulative distance
  let distanceKm = 0;
  let maxSpeed = 0;
  let speedSum = 0;

  for (let i = 0; i < samples.length; i++) {
    const current = samples[i]!;
    if (current.speedKmh > maxSpeed) {
      maxSpeed = current.speedKmh;
    }
    speedSum += current.speedKmh;

    if (i > 0) {
      const prev = samples[i - 1]!;
      distanceKm += calculateHaversineDistanceKm(prev.coordinates, current.coordinates);
    }
  }

  const averageSpeedKmh = Number((speedSum / samples.length).toFixed(1));
  const events = detectDrivingEvents(samples, options);
  const scores = computeTripScores(samples, events, distanceKm);

  return {
    tripId,
    driverId,
    vehicleId,
    startTime,
    endTime,
    durationSeconds,
    distanceKm: Number(distanceKm.toFixed(2)),
    averageSpeedKmh,
    topSpeedKmh: Number(maxSpeed.toFixed(1)),
    events,
    scores
  };
}
