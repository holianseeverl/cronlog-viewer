/**
 * Detects retry patterns in cron job execution history.
 * A retry is identified when the same job runs multiple times within a short window.
 */

const RETRY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Groups executions of the same job that occur within the retry window.
 * @param {Object[]} entries - Parsed log entries for a single job
 * @returns {Object[][]} Array of retry groups
 */
function groupRetries(entries) {
  if (!entries || entries.length === 0) return [];

  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  const groups = [];
  let current = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const diff = curr.timestamp - prev.timestamp;

    if (diff <= RETRY_WINDOW_MS) {
      current.push(curr);
    } else {
      if (current.length > 1) groups.push(current);
      current = [curr];
    }
  }

  if (current.length > 1) groups.push(current);
  return groups;
}

/**
 * Detects retry bursts across all jobs.
 * @param {Object} jobMap - Map of jobName -> entries[]
 * @returns {Object[]} List of retry incidents
 */
function detectRetries(jobMap) {
  const incidents = [];

  for (const [jobName, entries] of Object.entries(jobMap)) {
    const groups = groupRetries(entries);
    for (const group of groups) {
      const failCount = group.filter(e => e.status === 'failure').length;
      incidents.push({
        jobName,
        retryCount: group.length - 1,
        startTime: group[0].timestamp,
        endTime: group[group.length - 1].timestamp,
        allFailed: failCount === group.length,
        entries: group,
      });
    }
  }

  return incidents.sort((a, b) => b.retryCount - a.retryCount);
}

/**
 * Builds a summary report of retry activity.
 * @param {Object} jobMap
 * @returns {Object}
 */
function buildRetryReport(jobMap) {
  const incidents = detectRetries(jobMap);
  const totalRetries = incidents.reduce((sum, i) => sum + i.retryCount, 0);
  const fullyFailedBursts = incidents.filter(i => i.allFailed).length;

  return {
    totalIncidents: incidents.length,
    totalRetries,
    fullyFailedBursts,
    incidents,
  };
}

module.exports = { groupRetries, detectRetries, buildRetryReport };
