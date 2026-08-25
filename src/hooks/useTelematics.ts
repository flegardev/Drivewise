import { useState, useCallback } from "react";
import { type TelemetrySample, type TripSummary } from "../types/telemetry";
import { processTelemetryTrip } from "../services/telemetryEngine";

export interface UseTelematicsState {
  samples: TelemetrySample[];
  currentTrip: TripSummary | null;
  isRecording: boolean;
  error: string | null;
}

export function useTelematics(driverId: string, vehicleId: string) {
  const [state, setState] = useState<UseTelematicsState>({
    samples: [],
    currentTrip: null,
    isRecording: false,
    error: null
  });

  const startTrip = useCallback(() => {
    setState({
      samples: [],
      currentTrip: null,
      isRecording: true,
      error: null
    });
  }, []);

  const ingestSample = useCallback((sample: TelemetrySample) => {
    setState((prev) => {
      if (!prev.isRecording) return prev;
      const updatedSamples = [...prev.samples, sample];
      return {
        ...prev,
        samples: updatedSamples
      };
    });
  }, []);

  const finishTrip = useCallback((tripId: string) => {
    setState((prev) => {
      if (prev.samples.length === 0) {
        return {
          ...prev,
          isRecording: false,
          error: "No telemetry data collected."
        };
      }

      try {
        const summary = processTelemetryTrip(tripId, driverId, vehicleId, prev.samples);
        return {
          ...prev,
          isRecording: false,
          currentTrip: summary,
          error: null
        };
      } catch (err) {
        return {
          ...prev,
          isRecording: false,
          error: err instanceof Error ? err.message : "Failed to process telemetry trip."
        };
      }
    });
  }, [driverId, vehicleId]);

  return {
    ...state,
    startTrip,
    ingestSample,
    finishTrip
  };
}
