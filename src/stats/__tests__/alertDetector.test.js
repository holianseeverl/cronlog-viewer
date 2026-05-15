const { detectAlerts, buildAlertReport } = require('../alertDetector');

const makeJob = (jobName, totalRuns, failures, consecutiveFailures) => ({
  jobName,
  totalRuns,
  failures,
  consecutiveFailures,
});

describe('detectAlerts', () => {
  it('returns no alerts for a healthy job', () => {
    const job = makeJob('backup', 10, 1, 0);
    const alerts = detectAlerts(job);
    expect(alerts).toHaveLength(0);
  });

  it('returns a warning when failure rate exceeds threshold', () => {
    const job = makeJob('cleanup', 10, 6, 1);
    const alerts = detectAlerts(job);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('high_failure_rate');
    expect(alerts[0].level).toBe('warning');
  });

  it('returns a critical alert for consecutive failures', () => {
    const job = makeJob('sync', 10, 3, 4);
    const alerts = detectAlerts(job);
    const critical = alerts.find((a) => a.type === 'consecutive_failures');
    expect(critical).toBeDefined();
    expect(critical.level).toBe('critical');
  });

  it('returns both alerts when both thresholds are exceeded', () => {
    const job = makeJob('report', 10, 8, 5);
    const alerts = detectAlerts(job);
    expect(alerts).toHaveLength(2);
  });

  it('returns no alerts when totalRuns is 0', () => {
    const job = makeJob('idle', 0, 0, 0);
    const alerts = detectAlerts(job);
    expect(alerts).toHaveLength(0);
  });

  it('respects custom thresholds', () => {
    const job = makeJob('custom', 10, 3, 2);
    const alerts = detectAlerts(job, { failureRateThreshold: 0.2, consecutiveThreshold: 2 });
    expect(alerts).toHaveLength(2);
  });
});

describe('buildAlertReport', () => {
  it('aggregates alerts across multiple jobs', () => {
    const jobs = [
      makeJob('jobA', 10, 6, 4),
      makeJob('jobB', 10, 1, 0),
      makeJob('jobC', 10, 7, 3),
    ];
    const report = buildAlertReport(jobs);
    expect(report.alerts.length).toBeGreaterThan(0);
    expect(typeof report.criticalCount).toBe('number');
    expect(typeof report.warningCount).toBe('number');
    expect(report.criticalCount + report.warningCount).toBe(report.alerts.length);
  });

  it('returns empty alerts for all healthy jobs', () => {
    const jobs = [makeJob('ok1', 10, 0, 0), makeJob('ok2', 20, 1, 0)];
    const report = buildAlertReport(jobs);
    expect(report.alerts).toHaveLength(0);
    expect(report.criticalCount).toBe(0);
    expect(report.warningCount).toBe(0);
  });
});
