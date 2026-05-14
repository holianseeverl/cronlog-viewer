const blessed = require('blessed');

/**
 * Creates a status bar at the bottom of the screen.
 * @param {object} screen - blessed screen instance
 * @returns {object} blessed box widget
 */
function createStatusBar(screen) {
  const bar = blessed.box({
    bottom: 0,
    left: 0,
    width: '100%',
    height: 1,
    style: {
      bg: 'blue',
      fg: 'white',
    },
    tags: true,
  });

  screen.append(bar);
  return bar;
}

/**
 * Updates the status bar with current stats and key hints.
 * @param {object} bar - blessed box widget
 * @param {object} stats - { totalJobs, totalRuns, totalFailures, logFile }
 */
function renderStatusBar(bar, stats) {
  const { totalJobs = 0, totalRuns = 0, totalFailures = 0, logFile = '' } = stats;
  const failRate = totalRuns > 0 ? ((totalFailures / totalRuns) * 100).toFixed(1) : '0.0';

  bar.setContent(
    ` {bold}File:{/bold} ${logFile}  ` +
    `{bold}Jobs:{/bold} ${totalJobs}  ` +
    `{bold}Runs:{/bold} ${totalRuns}  ` +
    `{bold}Failures:{/bold} ${totalFailures} (${failRate}%)  ` +
    `{|}  Press {bold}q{/bold} to quit  {bold}r{/bold} to reload`
  );
}

module.exports = { createStatusBar, renderStatusBar };
