/**
 * trendAnalyzer.js
 * Analyzes failure trends over time windows for cron job execution history.
 */

/**
 * Groups job runs by day (YYYY-MM-DD) and counts failures per day.
 * @param {Array} jobs - Array of job summary objects
 * @returns {Object} Map of date string to { total, failures }
 */
function groupByDay(jobs) {
  const days = {};
  for (const job of jobs) {
    for (const run of job.runs || []) {
      const date = new Date(run.timestamp);
      if (isNaN(date)) continue;
      const key = date.toISOString().slice(0, 10);
      if (!days[key]) days[key] = { total: 0, failures: 0 };
      days[key].total += 1;
      if (run.status === 'failure') days[key].failures += 1;
    }
  }
  return days;
}

/**
 * Computes a simple linear trend slope for an array of numbers.
 * Returns positive if trending up, negative if trending down.
 * @param {number[]} values
 * @returns {number}
 */
function linearSlope(values) {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/**
 * Builds a trend report from aggregated job data.
 * @param {Array} jobs
 * @returns {Object} trend report with daily breakdown and slope
 */
function buildTrendReport(jobs) {
  const daily = groupByDay(jobs);
  const sortedDates = Object.keys(daily).sort();
  const failureRates = sortedDates.map(d =>
    daily[d].total > 0 ? daily[d].failures / daily[d].total : 0
  );
  const slope = linearSlope(failureRates);
  const trend = slope > 0.01 ? 'worsening' : slope < -0.01 ? 'improving' : 'stable';

  return {
    daily: sortedDates.map(date => ({ date, ...daily[date] })),
    slope: parseFloat(slope.toFixed(4)),
    trend,
  };
}

module.exports = { groupByDay, linearSlope, buildTrendReport };
