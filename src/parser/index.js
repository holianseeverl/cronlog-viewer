/**
 * Public API for the log parsing module.
 * Accepts raw log content and returns aggregated job data.
 */

const { parseLog } = require('./logParser');
const { aggregateJobs, summarizeJobs } = require('./jobAggregator');

/**
 * Parse raw cron log content into structured job execution data.
 *
 * @param {string} rawLog - Raw syslog content
 * @returns {{ jobMap: Map, summaries: object[] }}
 */
function processLog(rawLog) {
  if (typeof rawLog !== 'string') {
    throw new TypeError('rawLog must be a string');
  }

  const entries = parseLog(rawLog);
  const jobMap = aggregateJobs(entries);
  const summaries = summarizeJobs(jobMap);

  return { jobMap, summaries };
}

module.exports = { processLog };
