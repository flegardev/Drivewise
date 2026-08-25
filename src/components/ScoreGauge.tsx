import React from "react";
import { getScoreColorClass } from "../utils/formatters";

export interface ScoreGaugeProps {
  label: string;
  score: number;
  maxScore?: number;
  subtext?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  label,
  score,
  maxScore = 100,
  subtext
}) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const colorBadge = getScoreColorClass(score);

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all hover:shadow-md">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </span>
      <div className={`flex items-center justify-center w-20 h-20 rounded-full border-4 font-mono font-extrabold text-2xl ${colorBadge}`}>
        {score.toFixed(0)}
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {subtext && (
        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center">
          {subtext}
        </span>
      )}
    </div>
  );
};
