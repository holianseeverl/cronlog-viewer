/**
 * Computes duration statistics for cron job runs
 */

/**
 * Calculate mean duration from an array of runs
 * @param {Object[]} runs
 * @returns {number|null}
 */
function meanDuration(runs) {
  const valid = runs.filter(r => typeof r.duration === 'number');
  if (valid.length === 0) return null;
  const total = valid.reduce((sum, r) => sum + r.duration, 0);
  return total / valid.length;
}

/**
 * Calculate median duration
 * @param {Object[]} runs
 * @returns {number|null}
 */
function medianDuration(runs) {
  const durations = runs
    .filter(r => typeof r.duration === 'number')
    .map(r => r.duration)
    .sort((a, b) => a - b);
  if (durations.length === 0) return null;
  const mid = Math.floor(durations.length / 2);
  return durations.length % 2 !== 0
    ? durations[mid]
    : (durations[mid - 1] + durations[mid]) / 2;
}

/**
 * Get min and max durations
 * @param {Object[]} runs
 * @returns {{ min: number|null, max: number|null }}
 */
function durationRange(runs) {
  const durations = runs
    .filter(r => typeof r.duration === 'number')
    .map(r => r.duration);
  if (durations.length === 0) return { min: null, max: null };
  return {
    min: Math.min(...durations),
    max: Math.max(...durations),
  };
}

/**
 * Full duration stats for a set of runs
 * @param {Object[]} runs
 * @returns {Object}
 */
function computeDurationStats(runs) {
  return {
    mean: meanDuration(runs),
    median: medianDuration(runs),
    ...durationRange(runs),
    sampleSize: runs.filter(r => typeof r.duration === 'number').length,
  };
}

module.exports = { meanDuration, medianDuration, durationRange, computeDurationStats };
