const { meanDuration, medianDuration, durationRange, computeDurationStats } = require('../durationStats');

const runs = [
  { status: 'success', duration: 10 },
  { status: 'success', duration: 20 },
  { status: 'failure', duration: 30 },
  { status: 'success', duration: 40 },
];

describe('meanDuration', () => {
  it('calculates mean correctly', () => {
    expect(meanDuration(runs)).toBe(25);
  });

  it('returns null for empty runs', () => {
    expect(meanDuration([])).toBeNull();
  });

  it('ignores runs without duration', () => {
    const mixed = [{ duration: 10 }, { status: 'success' }, { duration: 30 }];
    expect(meanDuration(mixed)).toBe(20);
  });
});

describe('medianDuration', () => {
  it('returns median for odd count', () => {
    const r = [{ duration: 1 }, { duration: 3 }, { duration: 5 }];
    expect(medianDuration(r)).toBe(3);
  });

  it('returns average of two middle values for even count', () => {
    expect(medianDuration(runs)).toBe(25);
  });

  it('returns null for empty array', () => {
    expect(medianDuration([])).toBeNull();
  });
});

describe('durationRange', () => {
  it('returns correct min and max', () => {
    expect(durationRange(runs)).toEqual({ min: 10, max: 40 });
  });

  it('returns nulls for empty array', () => {
    expect(durationRange([])).toEqual({ min: null, max: null });
  });
});

describe('computeDurationStats', () => {
  it('returns all stats fields', () => {
    const stats = computeDurationStats(runs);
    expect(stats).toHaveProperty('mean');
    expect(stats).toHaveProperty('median');
    expect(stats).toHaveProperty('min');
    expect(stats).toHaveProperty('max');
    expect(stats).toHaveProperty('sampleSize');
    expect(stats.sampleSize).toBe(4);
  });
});
