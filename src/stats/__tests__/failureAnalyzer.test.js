const {
  getFailureRate,
  findHighFailureJobs,
  getConsecutiveFailures,
  buildFailureReport,
} = require('../failureAnalyzer');

describe('getFailureRate', () => {
  it('returns 0 for job with no runs', () => {
    expect(getFailureRate({ totalRuns: 0, failures: 0 })).toBe(0);
  });

  it('calculates correct failure rate', () => {
    expect(getFailureRate({ totalRuns: 10, failures: 3 })).toBeCloseTo(0.3);
  });

  it('returns 0 for null input', () => {
    expect(getFailureRate(null)).toBe(0);
  });
});

describe('findHighFailureJobs', () => {
  const jobs = [
    { name: 'job-a', totalRuns: 10, failures: 1 },
    { name: 'job-b', totalRuns: 10, failures: 5 },
    { name: 'job-c', totalRuns: 10, failures: 0 },
  ];

  it('filters jobs below threshold', () => {
    const result = findHighFailureJobs(jobs, 0.4);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('job-b');
  });

  it('sorts by failure rate descending', () => {
    const result = findHighFailureJobs(jobs, 0.0);
    expect(result[0].name).toBe('job-b');
  });
});

describe('getConsecutiveFailures', () => {
  it('counts trailing failures', () => {
    const runs = [
      { status: 'success' },
      { status: 'failure' },
      { status: 'failure' },
    ];
    expect(getConsecutiveFailures(runs)).toBe(2);
  });

  it('returns 0 when last run succeeded', () => {
    const runs = [{ status: 'failure' }, { status: 'success' }];
    expect(getConsecutiveFailures(runs)).toBe(0);
  });

  it('returns 0 for empty runs', () => {
    expect(getConsecutiveFailures([])).toBe(0);
  });
});
