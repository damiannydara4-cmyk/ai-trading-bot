/**
 * tradingBot.js
 *
 * Orquestra o ciclo completo do bot, equivalente ao `on_trading_iteration`
 * do projeto original em Python (Lumibot):
 *
 *   1. Busca notícias recentes do ativo
 *   2. Analisa sentimento agregado (NLP)
 *   3. Consulta conta/posição atual na Alpaca
 *   4. Calcula tamanho de posição e preços de stop/take (RiskManager)
 *   5. Decide comprar, vender ou manter
 *   6. Envia Bracket Order (ou fecha posição, se o sentimento virar)
 *
 * Pode ser executado:
 *   - isoladamente:      npm run bot
 *   - agendado por cron: importado pelo server.js (node-cron)
 */
const config = require('./config');
const logger = require('./logger');
const { fetchNews } = require('./newsService');
const { analyzeNews } = require('./sentimentAnalyzer');
const RiskManager = require('./riskManager');
const alpacaService = require('./alpacaService');

const riskManager = new RiskManager({
  cashAtRisk: config.strategy.cashAtRisk,
  stopLossPct: config.strategy.stopLossPct,
  takeProfitPct: config.strategy.takeProfitPct,
});

// Guarda o resultado da última execução para o dashboard consultar.
let lastRun = null;
function getLastRun() {
  return lastRun;
}

async function runIteration(symbol = config.strategy.symbol) {
  logger.info(`Iniciando iteração do bot para ${symbol}`);

  // 1 e 2. Notícias + sentimento
  const news = await fetchNews(symbol);
  const sentiment = analyzeNews(news);
  logger.info(`Sentimento agregado para ${symbol}: ${sentiment.score} (${sentiment.label})`, {
    newsCount: sentiment.count,
  });

  // 3. Conta e posição atual
  const account = await alpacaService.getAccount();
  const position = await alpacaService.getPosition(symbol);
  const lastPrice = await alpacaService.getLastPrice(symbol);
  const availableCash = parseFloat(account.cash);

  // 5. Decisão
  const action = RiskManager.decideAction(
    sentiment.score,
    config.strategy.buyThreshold,
    config.strategy.sellThreshold
  );

  const result = {
    timestamp: new Date().toISOString(),
    symbol,
    lastPrice,
    sentiment,
    action,
    hasOpenPosition: Boolean(position),
    order: null,
    note: null,
  };

  // 6. Execução
  try {
    if (action === 'buy' && !position) {
      const { quantity, cashToUse } = riskManager.calculatePositionSize(availableCash, lastPrice);
      if (quantity < 1) {
        result.note = 'Sentimento positivo, mas caixa insuficiente para 1 ação.';
      } else {
        const { takeProfitPrice, stopLossPrice } = riskManager.bracketPricesForBuy(lastPrice);
        const order = await alpacaService.submitBracketOrder({
          symbol,
          qty: quantity,
          side: 'buy',
          takeProfitPrice,
          stopLossPrice,
        });
        result.order = { id: order.id, qty: quantity, side: 'buy', cashUsed: cashToUse, takeProfitPrice, stopLossPrice };
      }
    } else if (action === 'sell' && position) {
      // Sentimento virou negativo e temos posição comprada: liquidamos.
      const qty = Math.abs(parseFloat(position.qty));
      const order = await alpacaService.submitMarketOrder({ symbol, qty, side: 'sell' });
      result.order = { id: order.id, qty, side: 'sell' };
      result.note = 'Posição encerrada por reversão de sentimento.';
    } else {
      result.note = `Ação "${action}" sem execução (posição aberta: ${Boolean(position)}).`;
    }
  } catch (err) {
    logger.error('Erro ao executar ordem', { message: err.response?.data || err.message });
    result.note = `Erro ao executar ordem: ${err.message}`;
  }

  lastRun = result;
  logger.info(`Iteração concluída para ${symbol}`, { action, hasOrder: Boolean(result.order) });
  return result;
}

// Permite rodar `npm run bot` diretamente, sem subir o servidor web.
if (require.main === module) {
  runIteration()
    .then((r) => {
      console.log(JSON.stringify(r, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runIteration, getLastRun };
