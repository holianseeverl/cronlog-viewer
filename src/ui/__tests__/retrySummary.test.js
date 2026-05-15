const { formatTime, renderRetryEntry, renderRetrySummary } = require('../widgets/retrySummary');

const BASE = new Date('2024-03-10T08:30:00Z').getTime();

function makeIncident(overrides = {}) {
  return {
    jobName: 'nightly-backup',
    retryCount: 2,
    startTime: BASE,
    endTime: BASE + 4 * 60 * 1000,
    allFailed: true,
    entries: [],
    ...overrides,
  };
}

describe('formatTime', () => {
  test('formats timestamp as readable datetime string', () => {
    const result = formatTime(BASE);
    expect(result).toBe('2024-03-10 08:30:00');
  });
});

describe('renderRetryEntry', () => {
  test('includes job name in output', () => {
    const result = renderRetryEntry(makeIncident());
    expect(result).toContain('nightly-backup');
  });

  test('shows retry count', () => {
    const result = renderRetryEntry(makeIncident({ retryCount: 3 }));
    expect(result).toContain('x3 retries');
  });

  test('shows ALL FAILED when allFailed is true', () => {
    const result = renderRetryEntry(makeIncident({ allFailed: true }));
    expect(result).toContain('ALL FAILED');
  });

  test('shows recovered when allFailed is false', () => {
    const result = renderRetryEntry(makeIncident({ allFailed: false }));
    expect(result).toContain('recovered');
  });
});

describe('renderRetrySummary', () => {
  test('shows no-retry message when incidents list is empty', () => {
    const report = { totalIncidents: 0, totalRetries: 0, fullyFailedBursts: 0, incidents: [] };
    const result = renderRetrySummary(report);
    expect(result).toContain('No retry bursts detected');
  });

  test('renders summary stats line', () => {
    const report = {
      totalIncidents: 1,
      totalRetries: 2,
      fullyFailedBursts: 1,
      incidents: [makeIncident()],
    };
    const result = renderRetrySummary(report);
    expect(result).toContain('Total incidents: 1');
    expect(result).toContain('Retries: 2');
  });

  test('limits display to 8 incidents and shows overflow count', () => {
    const incidents = Array.from({ length: 10 }, (_, i) =>
      makeIncident({ jobName: `job-${i}`, retryCount: 1 })
    );
    const report = { totalIncidents: 10, totalRetries: 10, fullyFailedBursts: 5, incidents };
    const result = renderRetrySummary(report);
    expect(result).toContain('... and 2 more');
  });
});
