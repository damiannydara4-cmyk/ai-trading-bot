/**
 * config.js
 * Carrega e valida as variáveis de ambiente usadas em todo o bot.
 */
require('dotenv').config();

function requireEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`[config] Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

const config = {
  alpaca: {
    keyId: requireEnv('APCA_API_KEY_ID'),
    secretKey: requireEnv('APCA_API_SECRET_KEY'),
    paper: (process.env.APCA_PAPER ?? 'true') === 'true',
  },
  strategy: {
    symbol: process.env.SYMBOL || 'SPY',
    cashAtRisk: parseFloat(process.env.CASH_AT_RISK || '0.5'),
    stopLossPct: parseFloat(process.env.STOP_LOSS_PCT || '0.05'),
    takeProfitPct: parseFloat(process.env.TAKE_PROFIT_PCT || '0.10'),
    buyThreshold: parseFloat(process.env.SENTIMENT_BUY_THRESHOLD || '0.35'),
    sellThreshold: parseFloat(process.env.SENTIMENT_SELL_THRESHOLD || '-0.35'),
    newsLookbackDays: parseInt(process.env.NEWS_LOOKBACK_DAYS || '3', 10),
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  cron: {
    schedule: process.env.CRON_SCHEDULE || '*/5 * * * 1-5',
  },
};

module.exports = config;
