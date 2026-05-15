const { groupRetries, detectRetries, buildRetryReport } = require('../retryDetector');

const BASE = new Date('2024-01-15T10:00:00Z').getTime();
const MIN = 60 * 1000;

function makeEntry(offsetMin, status = 'success') {
  return { timestamp: BASE + offsetMin * MIN, status };
}

describe('groupRetries', () => {
  test('returns empty array for empty input', () => {
    expect(groupRetries([])).toEqual([]);
  });

  test('returns no groups when executions are far apart', () => {
    const entries = [makeEntry(0), makeEntry(60), makeEntry(120)];
    expect(groupRetries(entries)).toHaveLength(0);
  });

  test('groups entries within 5 minute window', () => {
    const entries = [makeEntry(0), makeEntry(2), makeEntry(4)];
    const groups = groupRetries(entries);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(3);
  });

  test('creates separate groups for distinct bursts', () => {
    const entries = [
      makeEntry(0), makeEntry(2),
      makeEntry(60), makeEntry(62),
    ];
    const groups = groupRetries(entries);
    expect(groups).toHaveLength(2);
  });
});

describe('detectRetries', () => {
  test('returns empty for jobs with no retries', () => {
    const jobMap = { backup: [makeEntry(0), makeEntry(60)] };
    expect(detectRetries(jobMap)).toHaveLength(0);
  });

  test('detects retry incident with correct metadata', () => {
    const jobMap = {
      sync: [makeEntry(0, 'failure'), makeEntry(3, 'failure')],
    };
    const incidents = detectRetries(jobMap);
    expect(incidents).toHaveLength(1);
    expect(incidents[0].jobName).toBe('sync');
    expect(incidents[0].retryCount).toBe(1);
    expect(incidents[0].allFailed).toBe(true);
  });

  test('marks allFailed false when at least one succeeds', () => {
    const jobMap = {
      sync: [makeEntry(0, 'failure'), makeEntry(3, 'success')],
    };
    const incidents = detectRetries(jobMap);
    expect(incidents[0].allFailed).toBe(false);
  });
});

describe('buildRetryReport', () => {
  test('returns zero counts for clean job map', () => {
    const jobMap = { cleanup: [makeEntry(0), makeEntry(120)] };
    const report = buildRetryReport(jobMap);
    expect(report.totalIncidents).toBe(0);
    expect(report.totalRetries).toBe(0);
  });

  test('aggregates retry counts correctly', () => {
    const jobMap = {
      jobA: [makeEntry(0, 'failure'), makeEntry(2, 'failure'), makeEntry(4, 'failure')],
      jobB: [makeEntry(0, 'failure'), makeEntry(3, 'success')],
    };
    const report = buildRetryReport(jobMap);
    expect(report.totalIncidents).toBe(2);
    expect(report.totalRetries).toBe(3); // 2 + 1
    expect(report.fullyFailedBursts).toBe(1);
  });
});
