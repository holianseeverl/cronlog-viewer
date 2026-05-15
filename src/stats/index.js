/**
 * Central stats aggregator — re-exports all report builders.
 */

const { buildFailureReport, findHighFailureJobs } = require('./failureAnalyzer');
const { computeDurationStats } = require('./durationStats');
const { buildTrendReport } = require('./trendAnalyzer');
const { buildPatternReport } = require('./patternDetector');
const { buildAlertReport } = require('./alertDetector');
const { buildAnomalyReport } = require('./anomalyDetector');
const { buildRetryReport } = require('./retryDetector');
const { buildCorrelationReport } = require('./correlationAnalyzer');
const { buildFrequencyReport } = require('./jobFrequencyAnalyzer');
const { buildDowntimeReport } = require('./downtimeTracker');

/**
 * Generate a full stats report from aggregated job data.
 * @param {object[]} jobs
 * @returns {object}
 */
function generateStatsReport(jobs) {
  return {
    failure: buildFailureReport(jobs),
    duration: computeDurationStats(jobs),
    trend: buildTrendReport(jobs),
    pattern: buildPatternReport(jobs),
    alerts: buildAlertReport(jobs),
    anomalies: buildAnomalyReport(jobs),
    retries: buildRetryReport(jobs),
    correlations: buildCorrelationReport(jobs),
    frequency: buildFrequencyReport(jobs)
  };
}

/**
 * Return top N failing jobs.
 * @param {object[]} jobs
 * @param {number} n
 * @returns {object[]}
 */
function getTopFailingJobs(jobs, n = 5) {
  return findHighFailureJobs(jobs).slice(0, n);
}

/**
 * Generate a downtime report given pre-bucketed timestamps and expected interval.
 * @param {Object.<string, number[]>} jobTimestamps
 * @param {number} expectedIntervalMs
 * @returns {object}
 */
function generateDowntimeReport(jobTimestamps, expectedIntervalMs) {
  return buildDowntimeReport(jobTimestamps, expectedIntervalMs);
}

module.exports = { generateStatsReport, getTopFailingJobs, generateDowntimeReport };
