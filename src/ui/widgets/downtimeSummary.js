/**
 * Widget for rendering downtime report in the terminal dashboard.
 */

const chalk = require('chalk');

const MS_PER_HOUR = 3600000;
const MS_PER_MIN = 60000;

/**
 * Format milliseconds into a human-readable string.
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
  if (ms >= MS_PER_HOUR) {
    return `${(ms / MS_PER_HOUR).toFixed(1)}h`;
  }
  return `${Math.round(ms / MS_PER_MIN)}m`;
}

/**
 * Render a single job's downtime entry.
 * @param {string} jobName
 * @param {{ windowCount: number, totalDowntimeMs: number }} data
 * @returns {string}
 */
function renderDowntimeEntry(jobName, data) {
  if (data.windowCount === 0) return '';
  const label = chalk.cyan(jobName.padEnd(24));
  const windows = chalk.yellow(`${data.windowCount} gap${data.windowCount !== 1 ? 's' : ''}`);
  const total = chalk.red(formatDuration(data.totalDowntimeMs));
  return `  ${label} ${windows}  total: ${total}`;
}

/**
 * Render the full downtime summary widget.
 * @param {{ summary: Object, mostAffected: string|null }} report
 * @returns {string}
 */
function renderDowntimeSummary(report) {
  const lines = [];
  lines.push(chalk.bold.white('\n── Downtime Windows ──────────────────────────'));

  if (!report || !report.summary || Object.keys(report.summary).length === 0) {
    lines.push(chalk.gray('  No downtime data available.'));
    return lines.join('\n');
  }

  const entries = Object.entries(report.summary)
    .filter(([, d]) => d.windowCount > 0)
    .sort((a, b) => b[1].totalDowntimeMs - a[1].totalDowntimeMs);

  if (entries.length === 0) {
    lines.push(chalk.green('  No downtime gaps detected.'));
  } else {
    for (const [job, data] of entries) {
      lines.push(renderDowntimeEntry(job, data));
    }
    if (report.mostAffected) {
      lines.push('');
      lines.push(`  ${chalk.gray('Most affected:')} ${chalk.bold.red(report.mostAffected)}`);
    }
  }

  return lines.join('\n');
}

module.exports = { formatDuration, renderDowntimeEntry, renderDowntimeSummary };
