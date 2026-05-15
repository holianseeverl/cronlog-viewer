/**
 * Widget for rendering anomaly detection results in the terminal dashboard.
 */

const chalk = require('chalk');

/**
 * Format a single anomaly entry as a terminal string.
 *
 * @param {Object} anomaly
 * @returns {string}
 */
function renderAnomalyEntry(anomaly) {
  const dirColor = anomaly.direction === 'slower' ? chalk.red : chalk.cyan;
  const dirLabel = dirColor(anomaly.direction.toUpperCase());
  const name = chalk.bold(anomaly.jobName);
  const latest = chalk.yellow(`${anomaly.latestDuration}s`);
  const mean = chalk.gray(`mean: ${anomaly.mean}s`);
  const z = chalk.magenta(`z: ${anomaly.zScore}`);
  return `  ${name}  ${dirLabel}  latest=${latest}  ${mean}  ${z}`;
}

/**
 * Render the full anomaly summary widget.
 *
 * @param {{ anomalyCount: number, anomalies: Object[] }} report
 * @returns {string}
 */
function renderAnomalySummary(report) {
  const lines = [];
  lines.push(chalk.bold.underline('Duration Anomalies'));

  if (!report || report.anomalyCount === 0) {
    lines.push(chalk.green('  No anomalies detected.'));
    return lines.join('\n');
  }

  lines.push(
    chalk.red(`  ${report.anomalyCount} anomalous job(s) detected:`)
  );
  lines.push('');

  for (const anomaly of report.anomalies) {
    lines.push(renderAnomalyEntry(anomaly));
  }

  return lines.join('\n');
}

module.exports = { renderAnomalyEntry, renderAnomalySummary };
