const { parseLine, parseLog } = require('../logParser');

describe('parseLine', () => {
  it('parses a CMD exec line', () => {
    const line = 'Jan  5 03:00:01 myhost CRON[1234]: (root) CMD (/usr/bin/backup.sh)';
    const result = parseLine(line);
    expect(result).not.toBeNull();
    expect(result.type).toBe('exec');
    expect(result.user).toBe('root');
    expect(result.command).toBe('/usr/bin/backup.sh');
    expect(result.pid).toBe(1234);
    expect(result.host).toBe('myhost');
  });

  it('parses a status line', () => {
    const line = 'Jan  5 03:00:02 myhost CRON[1234]: (root) ERROR (grandchild #1234 failed with exit status 1)';
    const result = parseLine(line);
    expect(result).not.toBeNull();
    expect(result.type).toBe('status');
    expect(result.status).toBe('error');
    expect(result.user).toBe('root');
  });

  it('returns null for unrelated lines', () => {
    expect(parseLine('kernel: something happened')).toBeNull();
    expect(parseLine('')).toBeNull();
  });
});

describe('parseLog', () => {
  it('parses multiple lines and filters nulls', () => {
    const raw = [
      'Jan  5 03:00:01 myhost CRON[1234]: (root) CMD (/usr/bin/backup.sh)',
      'garbage line',
      'Jan  5 03:00:02 myhost CRON[1234]: (root) ERROR (exit status 1)',
    ].join('\n');

    const results = parseLog(raw);
    expect(results.length).toBe(2);
    expect(results[0].type).toBe('exec');
  });

  it('returns empty array for empty input', () => {
    expect(parseLog('')).toEqual([]);
  });
});
