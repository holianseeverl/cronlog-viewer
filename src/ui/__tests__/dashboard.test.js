jest.mock('blessed', () => {
  const widget = () => ({
    setData: jest.fn(),
    setContent: jest.fn(),
    focus: jest.fn(),
    append: jest.fn(),
    key: jest.fn(),
    render: jest.fn(),
  });
  return {
    screen: jest.fn(() => ({ ...widget(), append: jest.fn(), key: jest.fn(), render: jest.fn() })),
    listtable: widget,
    box: widget,
  };
});

jest.mock('blessed-contrib', () => ({
  bar: jest.fn(() => ({ setData: jest.fn() })),
}));

const { createJobTable, renderJobTable } = require('../widgets/jobTable');
const { createFailureChart, renderFailureChart } = require('../widgets/failureChart');
const { createStatusBar, renderStatusBar } = require('../widgets/statusBar');

describe('jobTable widget', () => {
  it('renderJobTable sets data with headers and rows', () => {
    const mockScreen = require('blessed').screen();
    const table = createJobTable(mockScreen);
    const jobs = [{ name: 'backup', totalRuns: 10, totalFailures: 2, failureRate: 0.2, avgDuration: 3.5 }];
    renderJobTable(table, jobs);
    expect(table.setData).toHaveBeenCalledWith(expect.arrayContaining([
      expect.arrayContaining(['Job Name']),
      expect.arrayContaining(['backup', '10', '2', '20.0%', '3.50s']),
    ]));
  });
});

describe('failureChart widget', () => {
  it('renderFailureChart sets titles and data', () => {
    const mockScreen = require('blessed').screen();
    const bar = createFailureChart(mockScreen);
    const jobs = [{ name: 'cleanup', totalFailures: 5 }, { name: 'sync', totalFailures: 3 }];
    renderFailureChart(bar, jobs);
    expect(bar.setData).toHaveBeenCalledWith({ titles: ['cleanup', 'sync'], data: [5, 3] });
  });

  it('truncates long job names', () => {
    const mockScreen = require('blessed').screen();
    const bar = createFailureChart(mockScreen);
    renderFailureChart(bar, [{ name: 'very-long-job-name', totalFailures: 1 }]);
    const call = bar.setData.mock.calls[0][0];
    expect(call.titles[0].length).toBeLessThanOrEqual(8);
  });
});

describe('statusBar widget', () => {
  it('renders stats into status bar content', () => {
    const mockScreen = require('blessed').screen();
    const bar = createStatusBar(mockScreen);
    renderStatusBar(bar, { totalJobs: 4, totalRuns: 20, totalFailures: 4, logFile: '/var/log/cron' });
    expect(bar.setContent).toHaveBeenCalledWith(expect.stringContaining('20.0%'));
    expect(bar.setContent).toHaveBeenCalledWith(expect.stringContaining('/var/log/cron'));
  });
});
