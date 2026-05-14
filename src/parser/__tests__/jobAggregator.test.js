const { aggregateJobs, summarizeJobs } = require('../jobAggregator');

const mockEntries = [
  {
    type: 'exec',
    timestamp: new Date('2024-01-05T03:00:01'),
    host: 'myhost',
    pid: 100,
    user: 'root',
    command: '/usr/bin/backup.sh',
  },
  {
    type: 'status',
    timestamp: new Date('2024-01-05T03:00:02'),
    host: 'myhost',
    pid: 100,
    user: 'root',
    status: 'error',
    detail: 'exit status 1',
  },
  {
    type: 'exec',
    timestamp: new Date('2024-01-05T04:00:01'),
    host: 'myhost',
    pid: 200,
    user: 'root',
    command: '/usr/bin/backup.sh',
  },
];

describe('aggregateJobs', () => {
  it('groups runs by command', () => {
    const jobMap = aggregateJobs(mockEntries);
    expect(jobMap.has('/usr/bin/backup.sh')).toBe(true);
    expect(jobMap.get('/usr/bin/backup.sh').length).toBe(2);
  });

  it('marks failed runs correctly', () => {
    const jobMap = aggregateJobs(mockEntries);
    const runs = jobMap.get('/usr/bin/backup.sh');
    expect(runs[0].failed).toBe(true);
    expect(runs[1].failed).toBe(false);
  });
});

describe('summarizeJobs', () => {
  it('returns correct summary stats', () => {
    const jobMap = aggregateJobs(mockEntries);
    const summaries = summarizeJobs(jobMap);
    expect(summaries.length).toBe(1);
    expect(summaries[0].totalRuns).toBe(2);
    expect(summaries[0].failures).toBe(1);
    expect(summaries[0].successRate).toBe(50);
  });
});
