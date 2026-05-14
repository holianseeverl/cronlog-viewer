/**
 * Parses raw cron log lines into structured job execution records.
 */

const CRON_LINE_REGEX = /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+CRON\[(\d+)\]:\s+(.+)$/;
const JOB_START_REGEX = /\((.+?)\)\s+CMD\s+\((.+)\)/;
const JOB_STATUS_REGEX = /\((.+?)\)\s+(\w+)\s+(.+)/;

/**
 * @param {string} line - A single log line
 * @returns {object|null} Parsed log entry or null if unrecognized
 */
function parseLine(line) {
  const match = line.match(CRON_LINE_REGEX);
  if (!match) return null;

  const [, timestamp, host, pid, message] = match;

  const cmdMatch = message.match(JOB_START_REGEX);
  if (cmdMatch) {
    return {
      type: 'exec',
      timestamp: parseTimestamp(timestamp),
      host,
      pid: parseInt(pid, 10),
      user: cmdMatch[1],
      command: cmdMatch[2],
    };
  }

  const statusMatch = message.match(JOB_STATUS_REGEX);
  if (statusMatch) {
    return {
      type: 'status',
      timestamp: parseTimestamp(timestamp),
      host,
      pid: parseInt(pid, 10),
      user: statusMatch[1],
      status: statusMatch[2].toLowerCase(),
      detail: statusMatch[3],
    };
  }

  return {
    type: 'unknown',
    timestamp: parseTimestamp(timestamp),
    host,
    pid: parseInt(pid, 10),
    message,
  };
}

function parseTimestamp(raw) {
  const year = new Date().getFullYear();
  return new Date(`${raw} ${year}`);
}

/**
 * @param {string} rawLog - Full log file content
 * @returns {object[]} Array of parsed log entries
 */
function parseLog(rawLog) {
  return rawLog
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(parseLine)
    .filter(Boolean);
}

module.exports = { parseLine, parseLog };
