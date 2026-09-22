/**
 * alpacaService.js
 * Encapsula o SDK @alpacahq/alpaca-trade-api: conta, posições e envio de ordens
 * (incluindo Bracket Orders com Stop Loss e Take Profit).
 */
const Alpaca = require('@alpacahq/alpaca-trade-api');
const config = require('./config');
const logger = require('./logger');

const alpaca = new Alpaca({
  keyId: config.alpaca.keyId,
  secretKey: config.alpaca.secretKey,
  paper: config.alpaca.paper,
});

async function getAccount() {
  return alpaca.getAccount();
}

async function getLastPrice(symbol) {
  const trade = await alpaca.getLatestTrade(symbol);
  return trade.Price ?? trade.price;
}

async function getPosition(symbol) {
  try {
    return await alpaca.getPosition(symbol);
  } catch (err) {
    // Alpaca retorna 404 quando não há posição aberta.
    return null;
  }
}

async function getOpenOrders() {
  return alpaca.getOrders({ status: 'open', limit: 50, direction: 'desc' });
}

async function getRecentOrders(limit = 20) {
  return alpaca.getOrders({ status: 'all', limit, direction: 'desc' });
}

async function closeAllPositions() {
  return alpaca.closeAllPositions();
}

/**
 * Envia uma Bracket Order (ordem principal + take-profit + stop-loss),
 * exatamente como no projeto original em Python.
 */
async function submitBracketOrder({ symbol, qty, side, takeProfitPrice, stopLossPrice }) {
  const order = {
    symbol,
    qty,
    side, // 'buy' | 'sell'
    type: 'market',
    time_in_force: 'day',
    order_class: 'bracket',
    take_profit: { limit_price: takeProfitPrice.toFixed(2) },
    stop_loss: { stop_price: stopLossPrice.toFixed(2) },
  };

  logger.info(`Enviando bracket order`, order);
  return alpaca.createOrder(order);
}

/**
 * Ordem simples de mercado, sem bracket (usada, por exemplo, para liquidar
 * uma posição rapidamente quando o sentimento vira).
 */
async function submitMarketOrder({ symbol, qty, side }) {
  const order = { symbol, qty, side, type: 'market', time_in_force: 'day' };
  logger.info('Enviando ordem a mercado', order);
  return alpaca.createOrder(order);
}

module.exports = {
  alpaca,
  getAccount,
  getLastPrice,
  getPosition,
  getOpenOrders,
  getRecentOrders,
  closeAllPositions,
  submitBracketOrder,
  submitMarketOrder,
};
