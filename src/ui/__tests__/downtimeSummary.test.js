const {
  formatDuration,
  renderDowntimeEntry,
  renderDowntimeSummary
} = require('../widgets/downtimeSummary');

// Strip ANSI codes for easier assertions
const strip = (str) => str.replace(/\x1B\[[0-9;]*m/g, '');

describe('formatDuration', () => {
  it('formats milliseconds under an hour as minutes', () => {
    expect(formatDuration(30 * 60000)).toBe('30m');
  });

  it('formats milliseconds >= 1 hour as hours', () => {
    expect(formatDuration(3 * 3600000)).toBe('3.0h');
    expect(formatDuration(1.5 * 3600000)).toBe('1.5h');
  });
});

describe('renderDowntimeEntry', () => {
  it('returns empty string when no windows', () => {
    expect(renderDowntimeEntry('job1', { windowCount: 0, totalDowntimeMs: 0 })).toBe('');
  });

  it('includes job name, gap count, and total duration', () => {
    const out = strip(renderDowntimeEntry('backup', { windowCount: 2, totalDowntimeMs: 7200000 }));
    expect(out).toContain('backup');
    expect(out).toContain('2 gaps');
    expect(out).toContain('2.0h');
  });

  it('uses singular gap label for 1 window', () => {
    const out = strip(renderDowntimeEntry('sync', { windowCount: 1, totalDowntimeMs: 3600000 }));
    expect(out).toContain('1 gap');
    expect(out).not.toContain('1 gaps');
  });
});

describe('renderDowntimeSummary', () => {
  it('shows fallback when no data', () => {
    const out = strip(renderDowntimeSummary({ summary: {}, mostAffected: null }));
    expect(out).toContain('No downtime data available');
  });

  it('shows no gaps message when all windowCounts are 0', () => {
    const report = {
      summary: { jobA: { windowCount: 0, totalDowntimeMs: 0 } },
      mostAffected: null
    };
    const out = strip(renderDowntimeSummary(report));
    expect(out).toContain('No downtime gaps detected');
  });

  it('renders entries and most affected job', () => {
    const report = {
      summary: {
        jobA: { windowCount: 3, totalDowntimeMs: 10800000 },
        jobB: { windowCount: 1, totalDowntimeMs: 3600000 }
      },
      mostAffected: 'jobA'
    };
    const out = strip(renderDowntimeSummary(report));
    expect(out).toContain('jobA');
    expect(out).toContain('jobB');
    expect(out).toContain('Most affected:');
    expect(out).toContain('jobA');
  });
});
