

const colors = {
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  debug: '\x1b[90m', // Gray
  reset: '\x1b[0m'
};

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const color = colors[level.toLowerCase()] || colors.reset;
  const metaStr = meta && Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${color}${level.toUpperCase()}${colors.reset}] ${message}${metaStr}`;
};

const logger = {
  info: (msg, meta) => console.log(formatMessage('INFO', msg, meta)),
  warn: (msg, meta) => console.warn(formatMessage('WARN', msg, meta)),
  error: (msg, meta) => console.error(formatMessage('ERROR', msg, meta)),
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage('DEBUG', msg, meta));
    }
  }
};

module.exports = logger;
