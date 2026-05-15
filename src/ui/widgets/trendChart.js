const blessed = require('blessed');

/**
 * Format a day label for display (e.g. "Mon 06/12")
 * @param {string} dateStr - ISO date string YYYY-MM-DD
 * @returns {string}
 */
function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${days[d.getDay()]} ${mm}/${dd}`;
}

/**
 * Build a simple ASCII bar for a given value and max.
 * @param {number} value
 * @param {number} max
 * @param {number} width
 * @returns {string}
 */
function buildBar(value, max, width = 20) {
  if (max === 0) return ' '.repeat(width);
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

/**
 * Create a blessed box widget for the trend chart.
 * @param {object} options - blessed box options
 * @returns {object} blessed box
 */
function createTrendChart(options = {}) {
  return blessed.box({
    label: ' Failure Trend (by day) ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    ...options
  });
}

/**
 * Render trend data into the widget.
 * @param {object} widget - blessed box
 * @param {Array<{day: string, count: number, slope: number}>} trendData
 */
function renderTrendChart(widget, trendData) {
  if (!trendData || trendData.length === 0) {
    widget.setContent('  No trend data available.');
    return;
  }

  const max = Math.max(...trendData.map(r => r.count), 1);
  const slopeLabel = trendData[trendData.length - 1]?.slope > 0
    ? '{red-fg}↑ increasing{/red-fg}'
    : '{green-fg}↓ decreasing{/green-fg}';

  const lines = [
    `  Trend: ${slopeLabel}`,
    ''
  ];

  for (const entry of trendData) {
    const label = formatDayLabel(entry.day).padEnd(12);
    const bar = buildBar(entry.count, max);
    const countStr = String(entry.count).padStart(4);
    lines.push(`  ${label} ${bar} ${countStr} failures`);
  }

  widget.setContent(lines.join('\n'));
}

module.exports = { createTrendChart, renderTrendChart, formatDayLabel, buildBar };
