# 🎓 DriveWise Telematics — Beginner's Learning Guide

## What This Project Does
**drivewise** is an enterprise-grade driving telematics, risk scoring, and eco-efficiency analytics engine built with TypeScript, Haversine geospatial calculations, and kinematic sensor event detection.

---

## 🗺️ Architecture Map

```
CORE GEOSPATIAL & TELEMETRY TYPES
  │  (src/types/telemetry.ts - GPS Samples, Ingestion Schemas, Driving Events)
  ▼
TELEMATICS SCORING & KINEMATIC ENGINE
  │  ├── Haversine Distance & Speed Tracking (src/services/telemetryEngine.ts)
  │  ├── Event Detection (Harsh Accel, Braking, Cornering, Speed Violations)
  │  └── Safety (0-100) & Eco Score Composite Aggregators
  ▼
REACTIVE HOOKS & FORMATTERS
  │  ├── useTelematics (src/hooks/useTelematics.ts)
  │  └── formatters (src/utils/formatters.ts)
  ▼
TEST SUITE & INVARIANT VALIDATION
     (tests/telemetryEngine.test.ts - Vitest Mathematical Precision & Scoring Invariants)
```

---

## 🎯 Core Files to Study First (Recommended Learning Order)

1. [`src/services/telemetryEngine.ts`](file:///C:/Users/tinif/repos/drivewise/src/services/telemetryEngine.ts)
   - **Why study first**: Teaches Haversine mathematical distance calculation, acceleration derivation from timestamps, and multi-factor safety scoring.
2. [`src/types/telemetry.ts`](file:///C:/Users/tinif/repos/drivewise/src/types/telemetry.ts)
   - **Why study next**: Shows how Zod validates streaming IoT GPS coordinates and telemetry payloads.
3. [`tests/telemetryEngine.test.ts`](file:///C:/Users/tinif/repos/drivewise/tests/telemetryEngine.test.ts)
   - **Why study third**: Demonstrates comprehensive test coverage for safety-critical calculation engines.

---

## 🛠️ How to Run & Verify

```bash
npm test
npm run typecheck
npm run build
```
