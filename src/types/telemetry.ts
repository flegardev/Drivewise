import { z } from "zod";

/**
 * Geo-coordinate schema with strict bounded validation
 */
export const GeoCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitudeMeters: z.number().optional()
});
export type GeoCoordinates = z.infer<typeof GeoCoordinatesSchema>;

/**
 * Telemetry point representing a real-time vehicle metric snapshot
 */
export const TelemetrySampleSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number().int().positive(),
  speedKmh: z.number().min(0).max(350),
  speedLimitKmh: z.number().min(0).max(350),
  accelerationMps2: z.number(), // Longitudinal acceleration (m/s^2)
  lateralGForce: z.number(), // Lateral cornering G-force
  engineRpm: z.number().min(0).max(12000).optional(),
  fuelFlowLitersPerHour: z.number().min(0).optional(),
  coordinates: GeoCoordinatesSchema
});
export type TelemetrySample = z.infer<typeof TelemetrySampleSchema>;

/**
 * Severity level of detected driving infractions
 */
export const InfractionSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type InfractionSeverity = z.infer<typeof InfractionSeveritySchema>;

/**
 * Driving event / infraction schema
 */
export const DrivingEventSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    "HARSH_ACCELERATION",
    "HARSH_BRAKING",
    "SHARP_CORNERING",
    "SPEED_VIOLATION",
    "EXCESSIVE_IDLING",
    "NIGHT_DRIVING_RISK"
  ]),
  severity: InfractionSeveritySchema,
  timestamp: z.number().int().positive(),
  durationSeconds: z.number().min(0),
  peakValue: z.number(),
  penaltyPoints: z.number().min(0).max(100),
  location: GeoCoordinatesSchema
});
export type DrivingEvent = z.infer<typeof DrivingEventSchema>;

/**
 * Overall safety and eco trip score breakdown
 */
export const TripScoreBreakdownSchema = z.object({
  safetyScore: z.number().min(0).max(100),
  ecoScore: z.number().min(0).max(100),
  smoothnessScore: z.number().min(0).max(100),
  speedComplianceScore: z.number().min(0).max(100),
  compositeScore: z.number().min(0).max(100),
  riskCategory: z.enum(["EXEMPLARY", "SAFE", "MODERATE", "HIGH_RISK", "CRITICAL_RISK"])
});
export type TripScoreBreakdown = z.infer<typeof TripScoreBreakdownSchema>;

/**
 * Aggregated trip entity schema
 */
export const TripSummarySchema = z.object({
  tripId: z.string().uuid(),
  driverId: z.string(),
  vehicleId: z.string(),
  startTime: z.number().int().positive(),
  endTime: z.number().int().positive(),
  durationSeconds: z.number().min(0),
  distanceKm: z.number().min(0),
  averageSpeedKmh: z.number().min(0),
  topSpeedKmh: z.number().min(0),
  fuelConsumedLiters: z.number().min(0).optional(),
  averageFuelEconomyL100km: z.number().min(0).optional(),
  events: z.array(DrivingEventSchema),
  scores: TripScoreBreakdownSchema
});
export type TripSummary = z.infer<typeof TripSummarySchema>;

/**
 * Environment configuration schema
 */
export const EnvConfigSchema = z.object({
  VITE_APP_PORT: z.coerce.number().default(3000),
  VITE_APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_TELEMATICS_API_BASE_URL: z.string().url(),
  VITE_TELEMATICS_WS_URL: z.string().url().or(z.string().startsWith("ws")),
  VITE_MAPBOX_ACCESS_TOKEN: z.string().optional(),
  VITE_TELEMETRY_SAMPLING_RATE_MS: z.coerce.number().min(100).default(1000),
  VITE_HARSH_BRAKE_THRESHOLD_G: z.coerce.number().default(0.35),
  VITE_HARSH_ACCEL_THRESHOLD_G: z.coerce.number().default(0.30),
  VITE_CORNERING_THRESHOLD_G: z.coerce.number().default(0.40)
});
export type EnvConfig = z.infer<typeof EnvConfigSchema>;
