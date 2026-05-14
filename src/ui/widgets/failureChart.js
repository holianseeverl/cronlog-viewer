const blessed = require('blessed');
const contrib = require('blessed-contrib');

/**
 * Creates a bar chart widget for visualizing failure counts per job.
 * @param {object} screen - blessed screen instance
 * @param {object} options - widget position/size options
 * @returns {object} blessed-contrib bar widget
 */
function createFailureChart(screen, options = {}) {
  const bar = contrib.bar({
    top: options.top || 0,
    left: options.left || '50%',
    width: options.width || '50%',
    height: options.height || '50%',
    label: ' Failures by Job ',
    barWidth: 6,
    barSpacing: 2,
    xOffset: 1,
    maxHeight: 10,
    border: { type: 'line' },
    style: {
      border: { fg: 'gray' },
      bar: { background: 'red', foreground: 'white' },
      text: 'white',
    },
  });

  screen.append(bar);
  return bar;
}

/**
 * Renders failure data into the bar chart.
 * @param {object} bar - blessed-contrib bar widget
 * @param {Array} topFailingJobs - array of { name, totalFailures } objects
 */
function renderFailureChart(bar, topFailingJobs) {
  const titles = topFailingJobs.map((j) =>
    j.name.length > 8 ? j.name.slice(0, 7) + '…' : j.name
  );
  const data = topFailingJobs.map((j) => j.totalFailures || 0);

  bar.setData({ titles, data });
}

module.exports = { createFailureChart, renderFailureChart };
