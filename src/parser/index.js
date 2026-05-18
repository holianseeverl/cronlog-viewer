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

  if (rawLog.trim().length === 0) {
    return { jobMap: new Map(), summaries: [] };
  }

  const entries = parseLog(rawLog);
  const jobMap = aggregateJobs(entries);
  const summaries = summarizeJobs(jobMap);

  return { jobMap, summaries };
}

/**
 * Parse a log file from disk and return structured job execution data.
 *
 * @param {string} filePath - Absolute or relative path to the log file
 * @returns {{ jobMap: Map, summaries: object[] }}
 */
function processLogFile(filePath) {
  const fs = require('fs');

  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('filePath must be a non-empty string');
  }

  const rawLog = fs.readFileSync(filePath, 'utf8');
  return processLog(rawLog);
}

module.exports = { processLog, processLogFile };
