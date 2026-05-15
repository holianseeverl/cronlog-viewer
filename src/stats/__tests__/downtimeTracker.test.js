const {
  detectDowntimeWindows,
  summarizeDowntime,
  buildDowntimeReport
} = require('../downtimeTracker');

const HOUR = 60 * 60 * 1000;

describe('detectDowntimeWindows', () => {
  it('returns empty for fewer than 2 timestamps', () => {
    expect(detectDowntimeWindows([], HOUR)).toEqual([]);
    expect(detectDowntimeWindows([Date.now()], HOUR)).toEqual([]);
  });

  it('finds no windows when gaps are normal', () => {
    const base = 1000000;
    const ts = [base, base + HOUR, base + 2 * HOUR];
    expect(detectDowntimeWindows(ts, HOUR)).toEqual([]);
  });

  it('detects a gap larger than 2x expected interval', () => {
    const base = 1000000;
    const ts = [base, base + 3 * HOUR];
    const windows = detectDowntimeWindows(ts, HOUR);
    expect(windows).toHaveLength(1);
    expect(windows[0].durationMs).toBe(3 * HOUR);
  });

  it('respects custom gapMultiplier', () => {
    const base = 0;
    const ts = [base, base + 1.5 * HOUR];
    // multiplier 1 => threshold = 1*HOUR, gap 1.5*HOUR triggers
    const windows = detectDowntimeWindows(ts, HOUR, 1);
    expect(windows).toHaveLength(1);
  });
});

describe('summarizeDowntime', () => {
  it('summarizes multiple jobs', () => {
    const base = 0;
    const jobTimestamps = {
      backup: [base, base + 3 * HOUR, base + 4 * HOUR],
      sync: [base, base + HOUR, base + 2 * HOUR]
    };
    const result = summarizeDowntime(jobTimestamps, HOUR);
    expect(result.backup.windowCount).toBe(1);
    expect(result.sync.windowCount).toBe(0);
    expect(result.backup.totalDowntimeMs).toBe(3 * HOUR);
  });
});

describe('buildDowntimeReport', () => {
  it('identifies the most affected job', () => {
    const base = 0;
    const jobTimestamps = {
      jobA: [base, base + 5 * HOUR],
      jobB: [base, base + 2.5 * HOUR]
    };
    const report = buildDowntimeReport(jobTimestamps, HOUR);
    expect(report.mostAffected).toBe('jobA');
  });

  it('returns null mostAffected when no downtime', () => {
    const base = 0;
    const jobTimestamps = { jobA: [base, base + HOUR] };
    const report = buildDowntimeReport(jobTimestamps, HOUR);
    expect(report.mostAffected).toBeNull();
  });
});
