/**
 * Analyzes failure patterns from aggregated job data
 */

/**
 * Calculate failure rate for a job
 * @param {Object} job - aggregated job summary
 * @returns {number} failure rate between 0 and 1
 */
function getFailureRate(job) {
  if (!job || job.totalRuns === 0) return 0;
  return job.failures / job.totalRuns;
}

/**
 * Identify jobs with failure rate above threshold
 * @param {Object[]} jobs - array of job summaries
 * @param {number} threshold - failure rate threshold (default 0.2)
 * @returns {Object[]} jobs exceeding the threshold
 */
function findHighFailureJobs(jobs, threshold = 0.2) {
  return jobs
    .map(job => ({ ...job, failureRate: getFailureRate(job) }))
    .filter(job => job.failureRate >= threshold)
    .sort((a, b) => b.failureRate - a.failureRate);
}

/**
 * Detect consecutive failure streaks for a job
 * @param {Object[]} runs - chronological run entries for a single job
 * @returns {number} current consecutive failure count
 */
function getConsecutiveFailures(runs) {
  let streak = 0;
  for (let i = runs.length - 1; i >= 0; i--) {
    if (runs[i].status === 'failure') {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Build a full failure report across all jobs
 * @param {Object} aggregated - output from aggregateJobs
 * @returns {Object} failure report
 */
function buildFailureReport(aggregated) {
  const report = {};
  for (const [jobName, data] of Object.entries(aggregated)) {
    const failureRate = getFailureRate(data.summary);
    const streak = getConsecutiveFailures(data.runs);
    report[jobName] = {
      failureRate: parseFloat(failureRate.toFixed(4)),
      consecutiveFailures: streak,
      totalRuns: data.summary.totalRuns,
      totalFailures: data.summary.failures,
      lastRun: data.runs[data.runs.length - 1] || null,
    };
  }
  return report;
}

module.exports = { getFailureRate, findHighFailureJobs, getConsecutiveFailures, buildFailureReport };
