/**
 * newsService.js
 * Busca notícias recentes de um ativo usando o endpoint de News da Alpaca
 * (Alpaca Market Data API - v1beta1/news). Não precisa de outra API key:
 * usa as mesmas credenciais da conta de trading.
 */
const axios = require('axios');
const config = require('./config');
const logger = require('./logger');

const NEWS_BASE_URL = 'https://data.alpaca.markets/v1beta1/news';

async function fetchNews(symbol = config.strategy.symbol, lookbackDays = config.strategy.newsLookbackDays) {
  const start = new Date();
  start.setDate(start.getDate() - lookbackDays);

  try {
    const { data } = await axios.get(NEWS_BASE_URL, {
      headers: {
        'APCA-API-KEY-ID': config.alpaca.keyId,
        'APCA-API-SECRET-KEY': config.alpaca.secretKey,
      },
      params: {
        symbols: symbol,
        start: start.toISOString(),
        limit: 20,
        sort: 'desc',
      },
    });

    return (data.news || []).map((n) => ({
      headline: n.headline,
      summary: n.summary,
      source: n.source,
      created_at: n.created_at,
      url: n.url,
    }));
  } catch (err) {
    logger.error('Falha ao buscar notícias na Alpaca', {
      message: err.response?.data || err.message,
    });
    return [];
  }
}

module.exports = { fetchNews };
