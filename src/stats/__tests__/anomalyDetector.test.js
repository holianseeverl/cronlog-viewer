const {
  computeStats,
  detectDurationAnomalies,
  buildAnomalyReport,
} = require('../anomalyDetector');

function makeJob(name, durations) {
  return {
    name,
    runs: durations.map((d) => ({ duration: d })),
  };
}

describe('computeStats', () => {
  test('returns zeros for empty array', () => {
    expect(computeStats([])).toEqual({ mean: 0, stdDev: 0 });
  });

  test('computes correct mean and stdDev', () => {
    const { mean, stdDev } = computeStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(mean).toBeCloseTo(5, 5);
    expect(stdDev).toBeCloseTo(2, 5);
  });

  test('stdDev is 0 for uniform values', () => {
    const { stdDev } = computeStats([3, 3, 3]);
    expect(stdDev).toBe(0);
  });
});

describe('detectDurationAnomalies', () => {
  test('returns empty array when no jobs provided', () => {
    expect(detectDurationAnomalies([])).toEqual([]);
  });

  test('skips jobs with fewer than 3 runs', () => {
    const jobs = [makeJob('shortjob', [10, 20])];
    expect(detectDurationAnomalies(jobs)).toEqual([]);
  });

  test('flags a clearly anomalous latest duration', () => {
    // mean ~5, stdDev ~2, latest=100 => very high z-score
    const jobs = [makeJob('slowjob', [4, 5, 5, 5, 6, 100])];
    const results = detectDurationAnomalies(jobs, 2);
    expect(results).toHaveLength(1);
    expect(results[0].jobName).toBe('slowjob');
    expect(results[0].direction).toBe('slower');
    expect(results[0].zScore).toBeGreaterThan(2);
  });

  test('does not flag normal durations', () => {
    const jobs = [makeJob('normaljob', [10, 11, 10, 12, 11, 11])];
    expect(detectDurationAnomalies(jobs, 2)).toEqual([]);
  });

  test('flags faster anomaly correctly', () => {
    const jobs = [makeJob('fastjob', [100, 98, 99, 101, 100, 1])];
    const results = detectDurationAnomalies(jobs, 2);
    expect(results).toHaveLength(1);
    expect(results[0].direction).toBe('faster');
  });
});

describe('buildAnomalyReport', () => {
  test('returns anomalyCount and anomalies array', () => {
    const jobs = [makeJob('job1', [4, 5, 5, 5, 6, 100])];
    const report = buildAnomalyReport(jobs);
    expect(report).toHaveProperty('anomalyCount', 1);
    expect(report.anomalies).toHaveLength(1);
  });

  test('returns zero anomalies for clean data', () => {
    const jobs = [makeJob('clean', [10, 10, 10, 10, 10])];
    const report = buildAnomalyReport(jobs);
    expect(report.anomalyCount).toBe(0);
    expect(report.anomalies).toEqual([]);
  });
});
