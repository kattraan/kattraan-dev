const {
  deriveWatchedPercentage,
  COMPLETION_THRESHOLD,
} = require('../services/progress.service');

describe('progress deriveWatchedPercentage', () => {
  it('derives percentage from currentTime/duration', () => {
    expect(deriveWatchedPercentage(90, 100).percentage).toBe(90);
    expect(deriveWatchedPercentage(45, 100).percentage).toBe(45);
  });

  it('clamps to 0–100', () => {
    expect(deriveWatchedPercentage(150, 100).percentage).toBe(100);
    expect(deriveWatchedPercentage(-10, 100).percentage).toBe(0);
  });

  it('returns 0 when duration is missing', () => {
    expect(deriveWatchedPercentage(100, 0).percentage).toBe(0);
  });

  it('marks complete only at threshold via derived percentage', () => {
    const atThreshold = deriveWatchedPercentage(COMPLETION_THRESHOLD, 100);
    expect(atThreshold.percentage).toBeGreaterThanOrEqual(COMPLETION_THRESHOLD);
    const below = deriveWatchedPercentage(COMPLETION_THRESHOLD - 1, 100);
    expect(below.percentage).toBeLessThan(COMPLETION_THRESHOLD);
  });
});
