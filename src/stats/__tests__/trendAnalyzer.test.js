const { groupByDay, linearSlope, buildTrendReport } = require('../trendAnalyzer');

const makeJob = (runs) => ({ name: 'test-job', runs });
const run = (dateStr, status) => ({ timestamp: new Date(dateStr).toISOString(), status });

describe('groupByDay', () => {
  it('groups runs by date', () => {
    const jobs = [
      makeJob([
        run('2024-01-01T10:00:00Z', 'success'),
        run('2024-01-01T12:00:00Z', 'failure'),
        run('2024-01-02T09:00:00Z', 'success'),
      ]),
    ];
    const result = groupByDay(jobs);
    expect(result['2024-01-01']).toEqual({ total: 2, failures: 1 });
    expect(result['2024-01-02']).toEqual({ total: 1, failures: 0 });
  });

  it('returns empty object for jobs with no runs', () => {
    expect(groupByDay([makeJob([])])).toEqual({});
  });

  it('skips runs with invalid timestamps', () => {
    const jobs = [makeJob([{ timestamp: 'bad-date', status: 'failure' }])];
    expect(groupByDay(jobs)).toEqual({});
  });
});

describe('linearSlope', () => {
  it('returns 0 for a single value', () => {
    expect(linearSlope([0.5])).toBe(0);
  });

  it('returns positive slope for increasing values', () => {
    expect(linearSlope([0, 0.25, 0.5, 0.75, 1.0])).toBeGreaterThan(0);
  });

  it('returns negative slope for decreasing values', () => {
    expect(linearSlope([1.0, 0.75, 0.5, 0.25, 0])).toBeLessThan(0);
  });

  it('returns 0 for flat values', () => {
    expect(linearSlope([0.5, 0.5, 0.5])).toBe(0);
  });
});

describe('buildTrendReport', () => {
  it('returns worsening trend when failure rate increases', () => {
    const jobs = [
      makeJob([
        run('2024-01-01T10:00:00Z', 'success'),
        run('2024-01-02T10:00:00Z', 'failure'),
        run('2024-01-03T10:00:00Z', 'failure'),
      ]),
    ];
    const report = buildTrendReport(jobs);
    expect(report.trend).toBe('worsening');
    expect(report.daily).toHaveLength(3);
    expect(typeof report.slope).toBe('number');
  });

  it('returns stable trend for consistent failure rate', () => {
    const jobs = [
      makeJob([
        run('2024-01-01T10:00:00Z', 'failure'),
        run('2024-01-02T10:00:00Z', 'failure'),
        run('2024-01-03T10:00:00Z', 'failure'),
      ]),
    ];
    const report = buildTrendReport(jobs);
    expect(report.trend).toBe('stable');
  });

  it('handles empty jobs array', () => {
    const report = buildTrendReport([]);
    expect(report.daily).toEqual([]);
    expect(report.slope).toBe(0);
    expect(report.trend).toBe('stable');
  });
});
