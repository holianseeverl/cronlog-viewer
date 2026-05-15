const {
  groupFailuresByHour,
  groupFailuresByWeekday,
  buildPatternReport,
} = require('../patternDetector');

const DAY_MS = 24 * 60 * 60 * 1000;

// Monday 2024-01-08 09:00 UTC
const base = new Date('2024-01-08T09:00:00Z');

function makeFailures(offsets) {
  return offsets.map((ms) => ({ timestamp: new Date(base.getTime() + ms) }));
}

describe('groupFailuresByHour', () => {
  it('counts failures per hour', () => {
    const failures = makeFailures([0, 0, 60 * 60 * 1000]); // 09:00, 09:00, 10:00
    const result = groupFailuresByHour(failures);
    expect(result[9]).toBe(2);
    expect(result[10]).toBe(1);
  });

  it('returns empty object for no failures', () => {
    expect(groupFailuresByHour([])).toEqual({});
  });
});

describe('groupFailuresByWeekday', () => {
  it('counts failures per weekday', () => {
    // base is Monday (day 1), +1 day = Tuesday (day 2)
    const failures = makeFailures([0, 0, DAY_MS]);
    const result = groupFailuresByWeekday(failures);
    expect(result[1]).toBe(2); // Monday
    expect(result[2]).toBe(1); // Tuesday
  });

  it('returns empty object for no failures', () => {
    expect(groupFailuresByWeekday([])).toEqual({});
  });
});

describe('buildPatternReport', () => {
  it('returns zeroed report when no failures', () => {
    const report = buildPatternReport('backup', []);
    expect(report.jobName).toBe('backup');
    expect(report.totalFailures).toBe(0);
    expect(report.peakHour).toBeNull();
    expect(report.peakWeekday).toBeNull();
  });

  it('identifies peak hour and weekday', () => {
    const failures = makeFailures([0, 0, 0, DAY_MS]); // 3x Monday 09h, 1x Tuesday 09h
    const report = buildPatternReport('sync', failures);
    expect(report.totalFailures).toBe(4);
    expect(report.peakHour.key).toBe(9);
    expect(report.peakHour.count).toBe(4);
    expect(report.peakWeekday.key).toBe(1); // Monday
    expect(report.peakWeekday.count).toBe(3);
  });

  it('includes hour and weekday distributions', () => {
    const failures = makeFailures([0]);
    const report = buildPatternReport('cleanup', failures);
    expect(report.hourDistribution).toBeDefined();
    expect(report.weekdayDistribution).toBeDefined();
  });
});
