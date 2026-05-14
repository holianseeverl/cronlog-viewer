# cronlog-viewer

A terminal dashboard for visualizing cron job execution history and failure patterns from system logs.

## Installation

```bash
npm install -g cronlog-viewer
```

## Usage

Point `cronlog-viewer` at your system cron log file to launch the interactive dashboard:

```bash
cronlog-viewer --log /var/log/syslog
```

You can also filter by a specific job name or time range:

```bash
cronlog-viewer --log /var/log/cron.log --job backup-db --since "2024-01-01"
```

### Dashboard Controls

| Key | Action |
|-----|--------|
| `↑ / ↓` | Navigate job list |
| `Enter` | Expand job details |
| `f` | Toggle failures only |
| `q` | Quit |

## Features

- Real-time log parsing and display
- Visual failure pattern highlighting
- Per-job execution timeline and success rate
- Supports common log formats (`syslog`, `cron.log`)

## Requirements

- Node.js >= 16.x
- Read access to your system cron log file

## License

MIT © [cronlog-viewer contributors](LICENSE)