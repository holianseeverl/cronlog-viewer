const {
  formatInterval,
  renderFrequencyEntry,
  renderFrequencySummary,
} = require('../widgets/frequencySummary');

describe('formatInterval', () => {
  it('returns N/A for null', () => {
    expect(formatInterval(null)).toBe('N/A');
  });

  it('formats seconds for sub-minute values', () => {
    expect(formatInterval(30000)).toBe('30s');
  });

  it('formats minutes', () => {
    expect(formatInterval(5 * 60 * 1000)).toBe('5m');
  });

  it('formats hours', () => {
    expect(formatInterval(2 * 60 * 60 * 1000)).toBe('2.0h');
  });
});

describe('renderFrequencyEntry', () => {
  it('renders a basic entry without irregularities', () => {
    const entry = { name: 'backup', runCount: 10, meanIntervalMs: 3600000, irregularCount: 0 };
    const line = renderFrequencyEntry(entry);
    expect(line).toContain('backup');
    expect(line).toContain('10');
    expect(line).toContain('1.0h');
    expect(line).not.toContain('[!');
  });

  it('includes irregular tag when count > 0', () => {
    const entry = { name: 'cleanup', runCount: 5, meanIntervalMs: 60000, irregularCount: 2 };
    const line = renderFrequencyEntry(entry);
    expect(line).toContain('[!2 irregular]');
  });
});

describe('renderFrequencySummary', () => {
  it('returns fallback message for empty report', () => {
    expect(renderFrequencySummary([])).toBe('No frequency data available.');
    expect(renderFrequencySummary(null)).toBe('No frequency data available.');
  });

  it('renders all entries', () => {
    const report = [
      { name: 'alpha', runCount: 8, meanIntervalMs: 3600000, irregularCount: 0 },
      { name: 'beta', runCount: 3, meanIntervalMs: 1800000, irregularCount: 1 },
    ];
    const output = renderFrequencySummary(report);
    expect(output).toContain('alpha');
    expect(output).toContain('beta');
    expect(output).toContain('Job Frequency Summary');
  });

  it('sorts by irregularCount descending', () => {
    const report = [
      { name: 'stable', runCount: 10, meanIntervalMs: 3600000, irregularCount: 0 },
      { name: 'flaky', runCount: 10, meanIntervalMs: 3600000, irregularCount: 3 },
    ];
    const output = renderFrequencySummary(report);
    const flaky = output.indexOf('flaky');
    const stable = output.indexOf('stable');
    expect(flaky).toBeLessThan(stable);
  });
});
