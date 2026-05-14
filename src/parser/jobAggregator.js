/**
 * Aggregates parsed log entries into per-job execution history.
 */

/**
 * Groups exec entries by command and attaches status events by PID.
 * @param {object[]} entries - Parsed log entries from logParser
 * @returns {Map<string, object[]>} Map of command -> execution records
 */
function aggregateJobs(entries) {
  const execByPid = new Map();
  const statusByPid = new Map();

  for (const entry of entries) {
    if (entry.type === 'exec') {
      execByPid.set(entry.pid, entry);
    } else if (entry.type === 'status') {
      if (!statusByPid.has(entry.pid)) {
        statusByPid.set(entry.pid, []);
      }
      statusByPid.get(entry.pid).push(entry);
    }
  }

  const jobMap = new Map();

  for (const [pid, exec] of execByPid) {
    const key = exec.command;
    if (!jobMap.has(key)) {
      jobMap.set(key, []);
    }

    const statuses = statusByPid.get(pid) || [];
    const failed = statuses.some(s => s.status === 'error' || s.status === 'failed');

    jobMap.get(key).push({
      pid,
      user: exec.user,
      command: exec.command,
      startedAt: exec.timestamp,
      host: exec.host,
      failed,
      statuses,
    });
  }

  // Sort each job's runs chronologically
  for (const [key, runs] of jobMap) {
    jobMap.set(key, runs.sort((a, b) => a.startedAt - b.startedAt));
  }

  return jobMap;
}

/**
 * Returns summary stats per job command.
 * @param {Map<string, object[]>} jobMap
 * @returns {object[]}
 */
function summarizeJobs(jobMap) {
  const summaries = [];
  for (const [command, runs] of jobMap) {
    const failures = runs.filter(r => r.failed).length;
    summaries.push({
      command,
      totalRuns: runs.length,
      failures,
      successRate: runs.length ? ((runs.length - failures) / runs.length) * 100 : 0,
      lastRun: runs[runs.length - 1]?.startedAt ?? null,
    });
  }
  return summaries.sort((a, b) => b.failures - a.failures);
}

module.exports = { aggregateJobs, summarizeJobs };
