/**
 * patternDetector.js
 * Detects recurring failure patterns (e.g. same hour, same weekday)
 * from aggregated job data.
 */

/**
 * Groups failure timestamps by hour of day.
 * @param {Array<{timestamp: Date}>} failures
 * @returns {Object} map of hour -> count
 */
function groupFailuresByHour(failures) {
  return failures.reduce((acc, { timestamp }) => {
    const hour = new Date(timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Groups failure timestamps by day of week (0=Sun ... 6=Sat).
 * @param {Array<{timestamp: Date}>} failures
 * @returns {Object} map of weekday -> count
 */
function groupFailuresByWeekday(failures) {
  return failures.reduce((acc, { timestamp }) => {
    const day = new Date(timestamp).getDay();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Finds the key with the maximum value in a frequency map.
 * @param {Object} freqMap
 * @returns {{ key: string, count: number } | null}
 */
function peakEntry(freqMap) {
  const entries = Object.entries(freqMap);
  if (entries.length === 0) return null;
  const [key, count] = entries.reduce((max, cur) => (cur[1] > max[1] ? cur : max));
  return { key: Number(key), count };
}

/**
 * Builds a pattern report for a single job's failure list.
 * @param {string} jobName
 * @param {Array<{timestamp: Date}>} failures
 * @returns {Object}
 */
function buildPatternReport(jobName, failures) {
  if (!failures || failures.length === 0) {
    return { jobName, peakHour: null, peakWeekday: null, totalFailures: 0 };
  }

  const hourMap = groupFailuresByHour(failures);
  const weekdayMap = groupFailuresByWeekday(failures);

  return {
    jobName,
    totalFailures: failures.length,
    peakHour: peakEntry(hourMap),
    peakWeekday: peakEntry(weekdayMap),
    hourDistribution: hourMap,
    weekdayDistribution: weekdayMap,
  };
}

module.exports = {
  groupFailuresByHour,
  groupFailuresByWeekday,
  buildPatternReport,
};
