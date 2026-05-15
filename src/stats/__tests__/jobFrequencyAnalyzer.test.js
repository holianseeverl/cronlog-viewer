const {
  groupTimestampsByJob,
  computeIntervals,
  detectIrregularIntervals,
  buildFrequencyReport,
} = require('../jobFrequencyAnalyzer');

const makeJob = (name, timestamp) => ({ name, timestamp });

describe('groupTimestampsByJob', () => {
  it('groups entries by job name', () => {
    const jobs = [
      makeJob('backup', '2024-01-01T01:00:00Z'),
      makeJob('cleanup', '2024-01-01T02:00:00Z'),
      makeJob('backup', '2024-01-01T03:00:00Z'),
    ];
    const result = groupTimestampsByJob(jobs);
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['backup', 'cleanup']));
    expect(result['backup']).toHaveLength(2);
    expect(result['cleanup']).toHaveLength(1);
  });

  it('returns sorted timestamps', () => {
    const jobs = [
      makeJob('job', '2024-01-01T03:00:00Z'),
      makeJob('job', '2024-01-01T01:00:00Z'),
    ];
    const result = groupTimestampsByJob(jobs);
    expect(result['job'][0]).toBeLessThan(result['job'][1]);
  });
});

describe('computeIntervals', () => {
  it('returns empty array for fewer than 2 timestamps', () => {
    expect(computeIntervals([])).toEqual([]);
    expect(computeIntervals([1000])).toEqual([]);
  });

  it('computes correct intervals', () => {
    const ts = [1000, 3000, 6000];
    expect(computeIntervals(ts)).toEqual([2000, 3000]);
  });
});

describe('detectIrregularIntervals', () => {
  it('returns empty for empty intervals', () => {
    expect(detectIrregularIntervals([])).toEqual([]);
  });

  it('flags intervals that deviate significantly', () => {
    // mean = 60000, threshold factor 2 => flag if |interval - 60000| > 120000
    const intervals = [60000, 60000, 60000, 300000];
    const result = detectIrregularIntervals(intervals, 2);
    expect(result).toHaveLength(1);
    expect(result[0].index).toBe(3);
  });

  it('returns nothing when all intervals are uniform', () => {
    const intervals = [60000, 60000, 60000];
    expect(detectIrregularIntervals(intervals)).toHaveLength(0);
  });
});

describe('buildFrequencyReport', () => {
  it('produces a report entry per job', () => {
    const jobs = [
      makeJob('alpha', '2024-01-01T00:00:00Z'),
      makeJob('alpha', '2024-01-01T01:00:00Z'),
      makeJob('beta', '2024-01-01T00:00:00Z'),
    ];
    const report = buildFrequencyReport(jobs);
    expect(report).toHaveLength(2);
    const alpha = report.find(r => r.name === 'alpha');
    expect(alpha.runCount).toBe(2);
    expect(alpha.meanIntervalMs).toBe(3600000);
  });

  it('sets meanIntervalMs to null for single-run jobs', () => {
    const jobs = [makeJob('solo', '2024-01-01T00:00:00Z')];
    const report = buildFrequencyReport(jobs);
    expect(report[0].meanIntervalMs).toBeNull();
  });
});
