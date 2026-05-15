/**
 * Analyzes how frequently cron jobs run and detects scheduling irregularities.
 */

/**
 * Groups job entries by job name, returning arrays of timestamps.
 * @param {Object[]} jobs
 * @returns {Object} map of jobName -> sorted timestamp array (ms)
 */
function groupTimestampsByJob(jobs) {
  const map = {};
  for (const job of jobs) {
    if (!map[job.name]) map[job.name] = [];
    map[job.name].push(new Date(job.timestamp).getTime());
  }
  for (const name of Object.keys(map)) {
    map[name].sort((a, b) => a - b);
  }
  return map;
}

/**
 * Computes intervals (ms) between consecutive runs for a sorted timestamp array.
 * @param {number[]} timestamps
 * @returns {number[]}
 */
function computeIntervals(timestamps) {
  if (timestamps.length < 2) return [];
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }
  return intervals;
}

/**
 * Detects irregular runs where an interval deviates > threshold from the mean.
 * @param {number[]} intervals
 * @param {number} thresholdFactor - e.g. 2 means 2x mean deviation
 * @returns {{ index: number, interval: number, mean: number }[]}
 */
function detectIrregularIntervals(intervals, thresholdFactor = 2) {
  if (intervals.length === 0) return [];
  const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
  return intervals
    .map((interval, index) => ({ index, interval, mean }))
    .filter(({ interval }) => Math.abs(interval - mean) > thresholdFactor * mean);
}

/**
 * Builds a frequency report for all jobs.
 * @param {Object[]} jobs
 * @returns {Object[]}
 */
function buildFrequencyReport(jobs) {
  const grouped = groupTimestampsByJob(jobs);
  return Object.entries(grouped).map(([name, timestamps]) => {
    const intervals = computeIntervals(timestamps);
    const mean = intervals.length
      ? intervals.reduce((s, v) => s + v, 0) / intervals.length
      : null;
    const irregular = detectIrregularIntervals(intervals);
    return {
      name,
      runCount: timestamps.length,
      meanIntervalMs: mean ? Math.round(mean) : null,
      irregularCount: irregular.length,
      irregular,
    };
  });
}

module.exports = {
  groupTimestampsByJob,
  computeIntervals,
  detectIrregularIntervals,
  buildFrequencyReport,
};
