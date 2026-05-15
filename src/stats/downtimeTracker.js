/**
 * Tracks job downtime windows — gaps where a job was expected but didn't run.
 */

/**
 * Given sorted timestamps (ms), find gaps larger than expectedIntervalMs * gapMultiplier.
 * @param {number[]} timestamps
 * @param {number} expectedIntervalMs
 * @param {number} gapMultiplier
 * @returns {{ start: number, end: number, durationMs: number }[]}
 */
function detectDowntimeWindows(timestamps, expectedIntervalMs, gapMultiplier = 2) {
  if (!timestamps || timestamps.length < 2) return [];
  const threshold = expectedIntervalMs * gapMultiplier;
  const windows = [];
  for (let i = 1; i < timestamps.length; i++) {
    const gap = timestamps[i] - timestamps[i - 1];
    if (gap > threshold) {
      windows.push({
        start: timestamps[i - 1],
        end: timestamps[i],
        durationMs: gap
      });
    }
  }
  return windows;
}

/**
 * Summarize total downtime per job.
 * @param {Object.<string, number[]>} jobTimestamps  map of jobName -> sorted timestamps
 * @param {number} expectedIntervalMs
 * @returns {Object.<string, { windowCount: number, totalDowntimeMs: number, windows: object[] }>}
 */
function summarizeDowntime(jobTimestamps, expectedIntervalMs) {
  const result = {};
  for (const [job, timestamps] of Object.entries(jobTimestamps)) {
    const windows = detectDowntimeWindows(timestamps, expectedIntervalMs);
    const totalDowntimeMs = windows.reduce((sum, w) => sum + w.durationMs, 0);
    result[job] = { windowCount: windows.length, totalDowntimeMs, windows };
  }
  return result;
}

/**
 * Build a full downtime report.
 * @param {Object.<string, number[]>} jobTimestamps
 * @param {number} expectedIntervalMs
 * @returns {{ summary: object, mostAffected: string|null }}
 */
function buildDowntimeReport(jobTimestamps, expectedIntervalMs) {
  const summary = summarizeDowntime(jobTimestamps, expectedIntervalMs);
  let mostAffected = null;
  let maxDowntime = 0;
  for (const [job, data] of Object.entries(summary)) {
    if (data.totalDowntimeMs > maxDowntime) {
      maxDowntime = data.totalDowntimeMs;
      mostAffected = job;
    }
  }
  return { summary, mostAffected };
}

module.exports = { detectDowntimeWindows, summarizeDowntime, buildDowntimeReport };
