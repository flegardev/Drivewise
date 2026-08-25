/**
 * Format duration in seconds to a human-readable HH:MM:SS or MM:SS string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0 || !Number.isFinite(seconds)) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format distance in kilometers with localized precision
 */
export function formatDistanceKm(distanceKm: number, decimals: number = 1): string {
  if (distanceKm < 0 || !Number.isFinite(distanceKm)) return "0.0 km";
  return `${distanceKm.toFixed(decimals)} km`;
}

/**
 * Map risk score to UI color token
 */
export function getScoreColorClass(score: number): string {
  if (score >= 90) return "text-emerald-500 bg-emerald-50 border-emerald-200";
  if (score >= 80) return "text-blue-500 bg-blue-50 border-blue-200";
  if (score >= 65) return "text-amber-500 bg-amber-50 border-amber-200";
  return "text-rose-500 bg-rose-50 border-rose-200";
}
