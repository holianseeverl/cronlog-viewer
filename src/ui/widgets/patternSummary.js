/**
 * patternSummary.js
 * Renders a compact text summary of failure pattern data
 * for display inside the terminal dashboard.
 */

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Formats an hour number into a readable string like "09:00".
 * @param {number} hour
 * @returns {string}
 */
function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * Formats a weekday number (0-6) into a short name.
 * @param {number} day
 * @returns {string}
 */
function formatWeekday(day) {
  return WEEKDAY_NAMES[day] ?? 'Unknown';
}

/**
 * Renders a single pattern report entry as a multi-line string.
 * @param {Object} report - output of buildPatternReport
 * @returns {string}
 */
function renderPatternEntry(report) {
  if (report.totalFailures === 0) {
    return `  ${report.jobName}: no failures recorded`;
  }

  const hourStr = report.peakHour
    ? `${formatHour(report.peakHour.key)} (${report.peakHour.count}x)`
    : 'n/a';

  const dayStr = report.peakWeekday
    ? `${formatWeekday(report.peakWeekday.key)} (${report.peakWeekday.count}x)`
    : 'n/a';

  return [
    `  Job      : ${report.jobName}`,
    `  Failures : ${report.totalFailures}`,
    `  Peak hr  : ${hourStr}`,
    `  Peak day : ${dayStr}`,
  ].join('\n');
}

/**
 * Renders a full pattern summary block for an array of reports.
 * @param {Array<Object>} reports
 * @returns {string}
 */
function renderPatternSummary(reports) {
  if (!reports || reports.length === 0) {
    return 'No pattern data available.';
  }

  const header = '=== Failure Pattern Summary ===';
  const divider = '-'.repeat(32);
  const entries = reports.map(renderPatternEntry).join(`\n${divider}\n`);

  return [header, divider, entries, divider].join('\n');
}

module.exports = {
  formatHour,
  formatWeekday,
  renderPatternEntry,
  renderPatternSummary,
};
