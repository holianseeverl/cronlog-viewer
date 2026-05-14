const blessed = require('blessed');
const { createJobTable, renderJobTable } = require('./widgets/jobTable');
const { createFailureChart, renderFailureChart } = require('./widgets/failureChart');
const { createStatusBar, renderStatusBar } = require('./widgets/statusBar');

/**
 * Builds and manages the full terminal dashboard layout.
 */
function createDashboard() {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'cronlog-viewer',
    fullUnicode: true,
  });

  const jobTable = createJobTable(screen, {
    top: 0, left: 0, width: '55%', height: '90%',
  });

  const failureChart = createFailureChart(screen, {
    top: 0, left: '55%', width: '45%', height: '90%',
  });

  const statusBar = createStatusBar(screen);

  screen.key(['q', 'C-c'], () => process.exit(0));

  jobTable.focus();

  function render(data) {
    const { jobSummaries = [], topFailingJobs = [], stats = {} } = data;
    renderJobTable(jobTable, jobSummaries);
    renderFailureChart(failureChart, topFailingJobs.slice(0, 8));
    renderStatusBar(statusBar, stats);
    screen.render();
  }

  function onReload(callback) {
    screen.key(['r'], callback);
  }

  return { screen, render, onReload };
}

module.exports = { createDashboard };
