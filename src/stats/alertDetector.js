/**
 * alertDetector.js
 * Detects alert conditions based on failure rates and consecutive failures.
 */

const DEFAULT_FAILURE_RATE_THRESHOLD = 0.5;
const DEFAULT_CONSECUTIVE_THRESHOLD = 3;

/**
 * @param {Object} jobSummary - { jobName, totalRuns, failures, consecutiveFailures }
 * @param {Object} options
 * @returns {Array} list of alert objects
 */
function detectAlerts(jobSummary, options = {}) {
  const {
    failureRateThreshold = DEFAULT_FAILURE_RATE_THRESHOLD,
    consecutiveThreshold = DEFAULT_CONSECUTIVE_THRESHOLD,
  } = options;

  const alerts = [];

  const { jobName, totalRuns, failures, consecutiveFailures } = jobSummary;

  if (totalRuns === 0) return alerts;

  const failureRate = failures / totalRuns;

  if (failureRate >= failureRateThreshold) {
    alerts.push({
      level: 'warning',
      type: 'high_failure_rate',
      jobName,
      message: `${jobName} has a failure rate of ${(failureRate * 100).toFixed(1)}% (${failures}/${totalRuns} runs)`,
      value: failureRate,
    });
  }

  if (consecutiveFailures >= consecutiveThreshold) {
    alerts.push({
      level: 'critical',
      type: 'consecutive_failures',
      jobName,
      message: `${jobName} has failed ${consecutiveFailures} times in a row`,
      value: consecutiveFailures,
    });
  }

  return alerts;
}

/**
 * @param {Array} jobSummaries - array of job summary objects
 * @param {Object} options
 * @returns {{ alerts: Array, criticalCount: number, warningCount: number }}
 */
function buildAlertReport(jobSummaries, options = {}) {
  const allAlerts = jobSummaries.flatMap((summary) =>
    detectAlerts(summary, options)
  );

  const criticalCount = allAlerts.filter((a) => a.level === 'critical').length;
  const warningCount = allAlerts.filter((a) => a.level === 'warning').length;

  return { alerts: allAlerts, criticalCount, warningCount };
}

module.exports = { detectAlerts, buildAlertReport };
