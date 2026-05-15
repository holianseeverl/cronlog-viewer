/**
 * Widget for rendering retry incident summaries in the terminal dashboard.
 */

const chalk = require('chalk');

/**
 * Formats a timestamp as a short time string.
 * @param {number} ts - Unix timestamp in ms
 * @returns {string}
 */
function formatTime(ts) {
  return new Date(ts).toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Renders a single retry incident line.
 * @param {Object} incident
 * @returns {string}
 */
function renderRetryEntry(incident) {
  const label = chalk.cyan(incident.jobName.padEnd(24));
  const retries = chalk.yellow(`x${incident.retryCount} retries`);
  const time = chalk.gray(formatTime(incident.startTime));
  const status = incident.allFailed
    ? chalk.red('[ALL FAILED]')
    : chalk.green('[recovered]');

  return `  ${label} ${retries}  ${time}  ${status}`;
}

/**
 * Renders the full retry summary widget.
 * @param {Object} report - Output of buildRetryReport
 * @returns {string}
 */
function renderRetrySummary(report) {
  const lines = [];

  lines.push(chalk.bold.white('── Retry Incidents ──────────────────────────'));

  if (report.totalIncidents === 0) {
    lines.push(chalk.gray('  No retry bursts detected.'));
    return lines.join('\n');
  }

  lines.push(
    chalk.gray(
      `  Total incidents: ${report.totalIncidents}  ` +
      `Retries: ${report.totalRetries}  ` +
      `All-failed bursts: ${report.fullyFailedBursts}`
    )
  );
  lines.push('');

  const top = report.incidents.slice(0, 8);
  for (const incident of top) {
    lines.push(renderRetryEntry(incident));
  }

  if (report.incidents.length > 8) {
    lines.push(chalk.gray(`  ... and ${report.incidents.length - 8} more`));
  }

  return lines.join('\n');
}

module.exports = { formatTime, renderRetryEntry, renderRetrySummary };
