/**
 * correlationSummary.js
 * Renders a text-based summary of correlated job failure pairs.
 */

const chalk = require('chalk');

/**
 * Render a single correlated pair entry.
 * @param {{ jobA: string, jobB: string, coOccurrences: number }} pair
 * @param {number} rank
 * @returns {string}
 */
function renderCorrelationEntry(pair, rank) {
  const badge = pair.coOccurrences >= 5
    ? chalk.red(`[${pair.coOccurrences}x]`)
    : chalk.yellow(`[${pair.coOccurrences}x]`);
  return `  ${rank}. ${chalk.cyan(pair.jobA)} ${chalk.dim('&')} ${chalk.cyan(pair.jobB)}  ${badge}`;
}

/**
 * Render the full correlation summary widget.
 * @param {{ pairs: Object[], summary: string }} report
 * @param {object} [options]
 * @param {number} [options.maxEntries=5]
 * @returns {string}
 */
function renderCorrelationSummary(report, options = {}) {
  const { maxEntries = 5 } = options;
  const lines = [];

  lines.push(chalk.bold.white('── Correlated Failures ──'));

  if (!report || !report.pairs || report.pairs.length === 0) {
    lines.push(chalk.dim('  No correlated failure pairs detected.'));
    return lines.join('\n');
  }

  const visible = report.pairs.slice(0, maxEntries);
  visible.forEach((pair, i) => {
    lines.push(renderCorrelationEntry(pair, i + 1));
  });

  if (report.pairs.length > maxEntries) {
    lines.push(chalk.dim(`  … and ${report.pairs.length - maxEntries} more pair(s).`));
  }

  lines.push('');
  lines.push(chalk.dim(`  ${report.summary}`));

  return lines.join('\n');
}

module.exports = { renderCorrelationEntry, renderCorrelationSummary };
