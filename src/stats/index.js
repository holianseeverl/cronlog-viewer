/**
 * Stats module entry point
 * Combines failure analysis and duration statistics
 */

const { buildFailureReport, findHighFailureJobs } = require('./failureAnalyzer');
const { computeDurationStats } = require('./durationStats');

/**
 * Generate a complete stats summary for all jobs
 * @param {Object} aggregated - output from aggregateJobs
 * @returns {Object} full stats report per job
 */
function generateStatsReport(aggregated) {
  const failureReport = buildFailureReport(aggregated);
  const report = {};

  for (const [jobName, data] of Object.entries(aggregated)) {
    report[jobName] = {
      ...failureReport[jobName],
      duration: computeDurationStats(data.runs),
    };
  }

  return report;
}

/**
 * Get a list of jobs sorted by failure rate descending
 * @param {Object} aggregated
 * @param {number} threshold
 * @returns {Object[]}
 */
function getTopFailingJobs(aggregated, threshold = 0) {
  const summaries = Object.entries(aggregated).map(([name, data]) => ({
    name,
    ...data.summary,
    runs: data.runs,
  }));
  return findHighFailureJobs(summaries, threshold).map(j => j.name);
}

module.exports = { generateStatsReport, getTopFailingJobs };
