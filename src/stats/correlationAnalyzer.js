/**
 * correlationAnalyzer.js
 * Detects correlations between job failures — e.g. jobs that tend to fail together.
 */

/**
 * Build a map of { timestamp -> [jobNames] } for failed entries.
 * @param {Object[]} jobs - array of aggregated job summaries with .failures array
 * @returns {Map<string, string[]>}
 */
function groupFailuresByMinute(jobs) {
  const buckets = new Map();
  for (const job of jobs) {
    for (const f of job.failures || []) {
      const key = new Date(f.timestamp).toISOString().slice(0, 16); // minute precision
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(job.name);
    }
  }
  return buckets;
}

/**
 * Count how many times each pair of jobs failed within the same minute.
 * @param {Map<string, string[]>} buckets
 * @returns {Object[]} array of { jobA, jobB, coOccurrences }
 */
function countPairCoOccurrences(buckets) {
  const counts = {};
  for (const names of buckets.values()) {
    if (names.length < 2) continue;
    const unique = [...new Set(names)].sort();
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const key = `${unique[i]}||${unique[j]}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    }
  }
  return Object.entries(counts).map(([key, coOccurrences]) => {
    const [jobA, jobB] = key.split('||');
    return { jobA, jobB, coOccurrences };
  });
}

/**
 * Build a correlation report highlighting job pairs that fail together frequently.
 * @param {Object[]} jobs
 * @param {number} [minCoOccurrences=2]
 * @returns {{ pairs: Object[], summary: string }}
 */
function buildCorrelationReport(jobs, minCoOccurrences = 2) {
  const buckets = groupFailuresByMinute(jobs);
  const pairs = countPairCoOccurrences(buckets)
    .filter(p => p.coOccurrences >= minCoOccurrences)
    .sort((a, b) => b.coOccurrences - a.coOccurrences);

  const summary =
    pairs.length === 0
      ? 'No correlated failure pairs detected.'
      : `${pairs.length} correlated pair(s) found. Top: ${pairs[0].jobA} & ${pairs[0].jobB} (${pairs[0].coOccurrences}x).`;

  return { pairs, summary };
}

module.exports = { groupFailuresByMinute, countPairCoOccurrences, buildCorrelationReport };
