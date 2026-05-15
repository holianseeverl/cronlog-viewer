/**
 * Detects anomalous cron job durations using simple statistical thresholds.
 */

/**
 * Compute mean and standard deviation for an array of numbers.
 * @param {number[]} values
 * @returns {{ mean: number, stdDev: number }}
 */
function computeStats(values) {
  if (!values || values.length === 0) return { mean: 0, stdDev: 0 };
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

/**
 * Detect jobs whose latest duration deviates more than `threshold` std devs
 * from their historical mean.
 *
 * @param {Object[]} jobSummaries - Array of job summary objects from aggregateJobs
 * @param {number} [threshold=2] - Number of standard deviations to flag as anomaly
 * @returns {Object[]} Array of anomaly records
 */
function detectDurationAnomalies(jobSummaries, threshold = 2) {
  const anomalies = [];

  for (const job of jobSummaries) {
    const durations = (job.runs || []).map((r) => r.duration).filter((d) => d != null);
    if (durations.length < 3) continue;

    const { mean, stdDev } = computeStats(durations);
    if (stdDev === 0) continue;

    const latest = durations[durations.length - 1];
    const zScore = Math.abs(latest - mean) / stdDev;

    if (zScore >= threshold) {
      anomalies.push({
        jobName: job.name,
        latestDuration: latest,
        mean: parseFloat(mean.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        zScore: parseFloat(zScore.toFixed(2)),
        direction: latest > mean ? 'slower' : 'faster',
      });
    }
  }

  return anomalies;
}

/**
 * Build a full anomaly report.
 *
 * @param {Object[]} jobSummaries
 * @param {number} [threshold=2]
 * @returns {{ anomalyCount: number, anomalies: Object[] }}
 */
function buildAnomalyReport(jobSummaries, threshold = 2) {
  const anomalies = detectDurationAnomalies(jobSummaries, threshold);
  return {
    anomalyCount: anomalies.length,
    anomalies,
  };
}

module.exports = { computeStats, detectDurationAnomalies, buildAnomalyReport };
