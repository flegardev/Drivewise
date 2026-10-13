import { describe, it, expect } from "vitest";
import {
  calculateHaversineDistanceKm,
  detectDrivingEvents,
  computeTripScores,
  processTelemetryTrip
} from "../src/services/telemetryEngine";
import {
  type TelemetrySample,
  TelemetrySampleSchema,
  TripScoreBreakdownSchema
} from "../src/types/telemetry";

describe("DriveWise Telematics Calculation Engine", () => {
  const baseCoords = { latitude: 46.0569, longitude: 14.5058 }; // Ljubljana

  const createSample = (overrides: Partial<TelemetrySample> = {}): TelemetrySample => {
    return {
      id: "00000000-0000-0000-0000-000000000001",
      timestamp: 1700000000000,
      speedKmh: 50,
      speedLimitKmh: 50,
      accelerationMps2: 0,
      lateralGForce: 0,
      coordinates: baseCoords,
      ...overrides
    };
  };

  describe("Haversine Distance Math", () => {
    it.each([
      { latitude: NaN, longitude: 0 },
      { latitude: 0, longitude: Infinity },
      { latitude: 91, longitude: 0 },
      { latitude: 0, longitude: 181 }
    ])("rejects invalid coordinates %j", (coordinate) => {
      expect(() => calculateHaversineDistanceKm(coordinate, baseCoords)).toThrow();
      expect(() => calculateHaversineDistanceKm(baseCoords, coordinate)).toThrow();
    });

    it("keeps antipodal distance finite and symmetric", () => {
      const start = { latitude: 46.0569, longitude: 14.5058 };
      const end = { latitude: -46.0569, longitude: -165.4942 };
      const distance = calculateHaversineDistanceKm(start, end);
      expect(Number.isFinite(distance)).toBe(true);
      expect(distance).toBeCloseTo(Math.PI * 6371, 3);
      expect(calculateHaversineDistanceKm(end, start)).toBe(distance);
    });
    it("should accurately compute zero distance between identical points", () => {
      const dist = calculateHaversineDistanceKm(baseCoords, baseCoords);
      expect(dist).toBe(0);
    });

    it("should compute distance between two known geographic points", () => {
      const ljubljana = { latitude: 46.0569, longitude: 14.5058 };
      const maribor = { latitude: 46.5547, longitude: 15.6459 };
      const dist = calculateHaversineDistanceKm(ljubljana, maribor);

      // Distance between Ljubljana and Maribor is approx 103-104 km
      expect(dist).toBeGreaterThan(100);
      expect(dist).toBeLessThan(110);
    });
  });

  describe("Driving Event Detection", () => {
    it("should detect harsh braking when deceleration exceeds threshold", () => {
      // -4.5 m/s^2 is approx -0.46G (above 0.35G threshold)
      const samples: TelemetrySample[] = [
        createSample({
          timestamp: 1700000001000,
          accelerationMps2: -4.5
        })
      ];

      const events = detectDrivingEvents(samples);
      expect(events.length).toBe(1);
      expect(events[0]?.type).toBe("HARSH_BRAKING");
      expect(events[0]?.severity).toBe("HIGH");
    });

    it("should detect harsh acceleration when positive accel exceeds threshold", () => {
      // 4.0 m/s^2 is approx 0.41G (above 0.30G threshold)
      const samples: TelemetrySample[] = [
        createSample({
          timestamp: 1700000001000,
          accelerationMps2: 4.0
        })
      ];

      const events = detectDrivingEvents(samples);
      expect(events.length).toBe(1);
      expect(events[0]?.type).toBe("HARSH_ACCELERATION");
    });

    it("should detect sharp cornering when lateral G exceeds threshold", () => {
      const samples: TelemetrySample[] = [
        createSample({
          timestamp: 1700000001000,
          lateralGForce: 0.55
        })
      ];

      const events = detectDrivingEvents(samples);
      expect(events.length).toBe(1);
      expect(events[0]?.type).toBe("SHARP_CORNERING");
      expect(events[0]?.severity).toBe("HIGH");
    });

    it("should detect speed violations beyond limit + tolerance", () => {
      const samples: TelemetrySample[] = [
        createSample({
          speedKmh: 85,
          speedLimitKmh: 50
        })
      ];

      const events = detectDrivingEvents(samples, { speedOverLimitToleranceKmh: 5 });
      expect(events.length).toBe(1);
      expect(events[0]?.type).toBe("SPEED_VIOLATION");
      expect(events[0]?.severity).toBe("CRITICAL");
    });
  });

  describe("Scoring Algorithms & Risk Classification", () => {
    it("should assign perfect 100 scores and 'EXEMPLARY' rating to smooth driving", () => {
      const samples = [createSample()];
      const scores = computeTripScores(samples, [], 10);

      expect(scores.safetyScore).toBe(100);
      expect(scores.ecoScore).toBe(100);
      expect(scores.compositeScore).toBe(100);
      expect(scores.riskCategory).toBe("EXEMPLARY");
      expect(() => TripScoreBreakdownSchema.parse(scores)).not.toThrow();
    });

    it("should degrade composite score and risk rating for frequent infractions", () => {
      const samples = [createSample()];
      const mockEvents = [
        {
          id: "ev-1",
          type: "HARSH_BRAKING" as const,
          severity: "CRITICAL" as const,
          timestamp: 1700000001000,
          durationSeconds: 1,
          peakValue: 0.7,
          penaltyPoints: 30,
          location: baseCoords
        },
        {
          id: "ev-2",
          type: "SPEED_VIOLATION" as const,
          severity: "CRITICAL" as const,
          timestamp: 1700000002000,
          durationSeconds: 1,
          peakValue: 120,
          penaltyPoints: 40,
          location: baseCoords
        }
      ];

      const scores = computeTripScores(samples, mockEvents, 5); // 5km trip with 70 penalty points
      expect(scores.compositeScore).toBeLessThan(70);
      expect(["MODERATE", "HIGH_RISK", "CRITICAL_RISK"]).toContain(scores.riskCategory);
    });
  });

  describe("End-to-End Trip Processor", () => {
    it("should process a full telemetry stream deterministically", () => {
      const samples: TelemetrySample[] = [
        createSample({
          timestamp: 1700000000000,
          speedKmh: 40,
          coordinates: { latitude: 46.0569, longitude: 14.5058 }
        }),
        createSample({
          timestamp: 1700000010000,
          speedKmh: 60,
          accelerationMps2: 1.5,
          coordinates: { latitude: 46.0600, longitude: 14.5100 }
        })
      ];

      const trip = processTelemetryTrip(
        "11111111-1111-1111-1111-111111111111",
        "driver-001",
        "vehicle-audi-a4",
        samples
      );

      expect(trip.tripId).toBe("11111111-1111-1111-1111-111111111111");
      expect(trip.durationSeconds).toBe(10);
      expect(trip.averageSpeedKmh).toBe(50);
      expect(trip.topSpeedKmh).toBe(60);
      expect(trip.distanceKm).toBeGreaterThan(0);
      expect(trip.scores.compositeScore).toBeGreaterThanOrEqual(0);
    });

    it("should throw error when processing empty telemetry stream", () => {
      expect(() => processTelemetryTrip("id", "d1", "v1", [])).toThrow("Cannot process an empty telemetry session.");
    });
  });

  describe("Zod Schema Ingestion Validation", () => {
    it("should reject invalid coordinates outside bounding box", () => {
      const invalidSample = {
        id: "00000000-0000-0000-0000-000000000001",
        timestamp: 1700000000000,
        speedKmh: 50,
        speedLimitKmh: 50,
        accelerationMps2: 0,
        lateralGForce: 0,
        coordinates: { latitude: 120.5, longitude: 14.5 } // Invalid latitude > 90
      };

      const result = TelemetrySampleSchema.safeParse(invalidSample);
      expect(result.success).toBe(false);
    });
  });
});
