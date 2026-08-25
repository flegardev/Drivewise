import React from "react";
import { type TripSummary } from "../types/telemetry";
import { formatDistanceKm, formatDuration, getScoreColorClass } from "../utils/formatters";
import { ScoreGauge } from "./ScoreGauge";

export interface TripSummaryCardProps {
  trip: TripSummary;
}

export const TripSummaryCard: React.FC<TripSummaryCardProps> = ({ trip }) => {
  const { scores } = trip;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trip Telematics Overview</h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${getScoreColorClass(
                scores.compositeScore
              )}`}
            >
              {scores.riskCategory.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Trip ID: {trip.tripId}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {formatDistanceKm(trip.distanceKm)}
          </div>
          <div className="text-xs text-slate-400">Duration: {formatDuration(trip.durationSeconds)}</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ScoreGauge label="Overall Safety" score={scores.safetyScore} subtext="Risk minimization" />
        <ScoreGauge label="Eco Score" score={scores.ecoScore} subtext="Fuel & energy efficiency" />
        <ScoreGauge label="Smoothness" score={scores.smoothnessScore} subtext="G-force control" />
        <ScoreGauge label="Speed Compliance" score={scores.speedComplianceScore} subtext="Within legal limits" />
      </div>

      {/* Events Breakdown */}
      <div className="pt-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
          Telemetry Infractions ({trip.events.length})
        </h3>
        {trip.events.length === 0 ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium text-center">
            Flawless session! Zero harsh braking, aggressive cornering, or speed violations recorded.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {trip.events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {ev.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {ev.severity}
                  </span>
                </div>
                <div className="text-rose-500 font-mono font-semibold">-{ev.penaltyPoints} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
