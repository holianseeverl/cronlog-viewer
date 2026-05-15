const { formatDayLabel, buildBar, renderTrendChart, createTrendChart } = require('../widgets/trendChart');

describe('formatDayLabel', () => {
  test('returns short weekday and MM/DD', () => {
    // 2024-06-10 is a Monday
    const label = formatDayLabel('2024-06-10');
    expect(label).toMatch(/Mon 06\/10/);
  });

  test('handles sunday', () => {
    // 2024-06-09 is a Sunday
    const label = formatDayLabel('2024-06-09');
    expect(label).toMatch(/Sun 06\/09/);
  });
});

describe('buildBar', () => {
  test('returns full bar when value equals max', () => {
    const bar = buildBar(10, 10, 10);
    expect(bar).toBe('█'.repeat(10));
  });

  test('returns empty bar when value is 0', () => {
    const bar = buildBar(0, 10, 10);
    expect(bar).toBe('░'.repeat(10));
  });

  test('returns spaces when max is 0', () => {
    const bar = buildBar(0, 0, 8);
    expect(bar).toBe(' '.repeat(8));
  });

  test('proportional fill', () => {
    const bar = buildBar(5, 10, 10);
    expect(bar).toBe('█'.repeat(5) + '░'.repeat(5));
  });
});

describe('renderTrendChart', () => {
  let widget;

  beforeEach(() => {
    widget = { setContent: jest.fn() };
  });

  test('shows no data message when empty', () => {
    renderTrendChart(widget, []);
    expect(widget.setContent).toHaveBeenCalledWith(expect.stringContaining('No trend data'));
  });

  test('renders rows for each day entry', () => {
    const data = [
      { day: '2024-06-10', count: 3, slope: 1 },
      { day: '2024-06-11', count: 7, slope: 1 }
    ];
    renderTrendChart(widget, data);
    const content = widget.setContent.mock.calls[0][0];
    expect(content).toContain('failures');
    expect(content).toContain('06/10');
    expect(content).toContain('06/11');
  });

  test('shows increasing label when slope positive', () => {
    const data = [{ day: '2024-06-10', count: 5, slope: 2 }];
    renderTrendChart(widget, data);
    const content = widget.setContent.mock.calls[0][0];
    expect(content).toContain('increasing');
  });

  test('shows decreasing label when slope negative or zero', () => {
    const data = [{ day: '2024-06-10', count: 5, slope: -1 }];
    renderTrendChart(widget, data);
    const content = widget.setContent.mock.calls[0][0];
    expect(content).toContain('decreasing');
  });
});
