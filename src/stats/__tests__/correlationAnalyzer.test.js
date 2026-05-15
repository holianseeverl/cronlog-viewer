const {
  groupFailuresByMinute,
  countPairCoOccurrences,
  buildCorrelationReport,
} = require('../correlationAnalyzer');

function makeJobs(entries) {
  // entries: [{ name, timestamps }]
  return entries.map(({ name, timestamps }) => ({
    name,
    failures: timestamps.map(ts => ({ timestamp: ts })),
  }));
}

const T1 = '2024-03-01T02:05:00Z';
const T2 = '2024-03-01T02:05:30Z'; // same minute as T1
const T3 = '2024-03-01T03:10:00Z';

describe('groupFailuresByMinute', () => {
  it('groups failures into minute buckets', () => {
    const jobs = makeJobs([
      { name: 'jobA', timestamps: [T1] },
      { name: 'jobB', timestamps: [T2] },
    ]);
    const buckets = groupFailuresByMinute(jobs);
    expect(buckets.size).toBe(1);
    const key = '2024-03-01T02:05';
    expect(buckets.get(key)).toEqual(expect.arrayContaining(['jobA', 'jobB']));
  });

  it('handles jobs with no failures', () => {
    const jobs = [{ name: 'jobA', failures: [] }];
    const buckets = groupFailuresByMinute(jobs);
    expect(buckets.size).toBe(0);
  });
});

describe('countPairCoOccurrences', () => {
  it('counts pairs correctly', () => {
    const buckets = new Map([
      ['2024-03-01T02:05', ['jobA', 'jobB', 'jobA']],
      ['2024-03-01T03:10', ['jobA', 'jobB']],
    ]);
    const pairs = countPairCoOccurrences(buckets);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toMatchObject({ jobA: 'jobA', jobB: 'jobB', coOccurrences: 2 });
  });

  it('returns empty array when no co-occurrences', () => {
    const buckets = new Map([['2024-03-01T02:05', ['jobA']]]);
    expect(countPairCoOccurrences(buckets)).toEqual([]);
  });
});

describe('buildCorrelationReport', () => {
  it('returns correlated pairs above threshold', () => {
    const jobs = makeJobs([
      { name: 'jobA', timestamps: [T1, T3] },
      { name: 'jobB', timestamps: [T2, T3] },
    ]);
    const report = buildCorrelationReport(jobs, 2);
    expect(report.pairs).toHaveLength(1);
    expect(report.pairs[0].coOccurrences).toBe(2);
    expect(report.summary).toMatch(/1 correlated pair/);
  });

  it('returns empty summary when nothing meets threshold', () => {
    const jobs = makeJobs([{ name: 'jobA', timestamps: [T1] }]);
    const report = buildCorrelationReport(jobs, 2);
    expect(report.pairs).toHaveLength(0);
    expect(report.summary).toMatch(/No correlated/);
  });
});
