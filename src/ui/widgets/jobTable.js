const blessed = require('blessed');

/**
 * Creates a scrollable table widget displaying cron job summaries.
 * @param {object} screen - blessed screen instance
 * @param {object} options - widget position/size options
 * @returns {object} blessed list-table widget
 */
function createJobTable(screen, options = {}) {
  const table = blessed.listtable({
    top: options.top || 0,
    left: options.left || 0,
    width: options.width || '50%',
    height: options.height || '50%',
    border: { type: 'line' },
    style: {
      header: { bold: true, fg: 'cyan' },
      cell: { selected: { bg: 'blue', fg: 'white' } },
      border: { fg: 'gray' },
    },
    scrollable: true,
    keys: true,
    mouse: true,
    label: ' Jobs ',
    align: 'left',
  });

  screen.append(table);
  return table;
}

/**
 * Renders job summary data into the table widget.
 * @param {object} table - blessed listtable widget
 * @param {Array} jobSummaries - array of job summary objects
 */
function renderJobTable(table, jobSummaries) {
  const headers = ['Job Name', 'Runs', 'Failures', 'Fail Rate', 'Avg Duration'];

  const rows = jobSummaries.map((job) => [
    job.name || 'unknown',
    String(job.totalRuns || 0),
    String(job.totalFailures || 0),
    `${((job.failureRate || 0) * 100).toFixed(1)}%`,
    job.avgDuration ? `${job.avgDuration.toFixed(2)}s` : 'N/A',
  ]);

  table.setData([headers, ...rows]);
}

module.exports = { createJobTable, renderJobTable };
