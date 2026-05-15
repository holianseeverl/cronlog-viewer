const blessed = require('blessed');
const { createJobTable, renderJobTable } = require('./widgets/jobTable');
const { createFailureChart, renderFailureChart } = require('./widgets/failureChart');
const { createStatusBar, renderStatusBar } = require('./widgets/statusBar');
const { createTrendChart, renderTrendChart } = require('./widgets/trendChart');

/**
 * Create the full dashboard screen with all widgets.
 * @returns {{ screen, widgets }}
 */
function createDashboard() {
  const screen = blessed.screen({ smartCSR: true, title: 'cronlog-viewer' });

  const jobTable = createJobTable({ top: 0, left: 0, width: '60%', height: '50%' });
  const failureChart = createFailureChart({ top: 0, left: '60%', width: '40%', height: '50%' });
  const trendChart = createTrendChart({ top: '50%', left: 0, width: '70%', height: '45%' });
  const statusBar = createStatusBar({ top: '95%', left: 0, width: '100%', height: 1 });

  screen.append(jobTable);
  screen.append(failureChart);
  screen.append(trendChart);
  screen.append(statusBar);

  screen.key(['q', 'C-c'], () => process.exit(0));

  return { screen, widgets: { jobTable, failureChart, trendChart, statusBar } };
}

/**
 * Render all widgets with the provided data.
 * @param {{ screen, widgets }} dashboard
 * @param {object} data
 * @param {Array} data.jobs
 * @param {object} data.statsReport
 * @param {Array} data.trendData
 * @param {string} data.statusMessage
 */
function render(dashboard, data) {
  const { screen, widgets } = dashboard;
  const { jobs, statsReport, trendData, statusMessage } = data;

  renderJobTable(widgets.jobTable, jobs);
  renderFailureChart(widgets.failureChart, statsReport);
  renderTrendChart(widgets.trendChart, trendData);
  renderStatusBar(widgets.statusBar, statusMessage);

  screen.render();
}

/**
 * Attach a reload handler triggered by 'r' key.
 * @param {{ screen }} dashboard
 * @param {Function} handler
 */
function onReload(dashboard, handler) {
  dashboard.screen.key(['r'], handler);
}

module.exports = { createDashboard, render, onReload };
