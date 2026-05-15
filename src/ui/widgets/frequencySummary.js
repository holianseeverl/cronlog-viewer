/**
 * Renders a summary widget for job frequency / scheduling irregularity data.
 */

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

/**
 * Formats a millisecond interval into a human-readable string.
 * @param {number|null} ms
 * @returns {string}
 */
function formatInterval(ms) {
  if (ms === null || ms === undefined) return 'N/A';
  if (ms < MS_PER_MINUTE) return `${Math.round(ms / 1000)}s`;
  if (ms < MS_PER_HOUR) return `${Math.round(ms / MS_PER_MINUTE)}m`;
  return `${(ms / MS_PER_HOUR).toFixed(1)}h`;
}

/**
 * Renders a single row for a job frequency entry.
 * @param {{ name: string, runCount: number, meanIntervalMs: number|null, irregularCount: number }} entry
 * @returns {string}
 */
function renderFrequencyEntry(entry) {
  const interval = formatInterval(entry.meanIntervalMs);
  const irregTag = entry.irregularCount > 0
    ? ` [!${entry.irregularCount} irregular]`
    : '';
  return `  ${entry.name.padEnd(24)} runs: ${String(entry.runCount).padStart(4)}  avg interval: ${interval.padStart(6)}${irregTag}`;
}

/**
 * Renders the full frequency summary block.
 * @param {Object[]} report - output of buildFrequencyReport
 * @returns {string}
 */
function renderFrequencySummary(report) {
  if (!report || report.length === 0) {
    return 'No frequency data available.';
  }

  const sorted = [...report].sort((a, b) => b.irregularCount - a.irregularCount);

  const lines = [
    '── Job Frequency Summary ──────────────────────────',
    `${'Job'.padEnd(24)} ${'Runs'.padStart(7)}  ${'Avg Interval'.padStart(14)}  Flags`,
    '─'.repeat(60),
    ...sorted.map(renderFrequencyEntry),
    '─'.repeat(60),
  ];

  return lines.join('\n');
}

module.exports = { formatInterval, renderFrequencyEntry, renderFrequencySummary };
