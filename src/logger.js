/**
 * logger.js
 * Logger minimalista com timestamp e níveis, mantendo também um
 * buffer em memória para expor os últimos logs via API (dashboard).
 */
const MAX_BUFFER = 200;
const buffer = [];

function push(level, message, meta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta: meta ?? null,
  };
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER) buffer.shift();

  const line = `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`;
  if (level === 'error') console.error(line, meta ?? '');
  else console.log(line, meta ?? '');

  return entry;
}

module.exports = {
  info: (msg, meta) => push('info', msg, meta),
  warn: (msg, meta) => push('warn', msg, meta),
  error: (msg, meta) => push('error', msg, meta),
  getRecent: (n = 50) => buffer.slice(-n).reverse(),
};
