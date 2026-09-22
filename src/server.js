/**
 * server.js
 * Servidor Express que:
 *  - serve o dashboard estático (public/)
 *  - expõe API REST para saldo, notícias, ordens e status do bot
 *  - agenda a execução periódica do bot via node-cron
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const config = require('./config');
const logger = require('./logger');
const alpacaService = require('./alpacaService');
const { fetchNews } = require('./newsService');
const { analyzeNews } = require('./sentimentAnalyzer');
const { runIteration, getLastRun } = require('./tradingBot');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API: conta ---
app.get('/api/account', async (req, res) => {
  try {
    const account = await alpacaService.getAccount();
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API: notícias + sentimento do símbolo configurado ---
app.get('/api/news', async (req, res) => {
  try {
    const symbol = req.query.symbol || config.strategy.symbol;
    const news = await fetchNews(symbol);
    const sentiment = analyzeNews(news);
    res.json({ symbol, sentiment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API: ordens recentes ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await alpacaService.getRecentOrders(30);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API: posição atual do símbolo configurado ---
app.get('/api/position', async (req, res) => {
  try {
    const symbol = req.query.symbol || config.strategy.symbol;
    const position = await alpacaService.getPosition(symbol);
    res.json(position || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API: logs recentes do bot ---
app.get('/api/logs', (req, res) => {
  res.json(logger.getRecent(50));
});

// --- API: última execução do bot ---
app.get('/api/last-run', (req, res) => {
  res.json(getLastRun());
});

// --- API: dispara uma iteração manualmente (botão no dashboard) ---
app.post('/api/run-now', async (req, res) => {
  try {
    const result = await runIteration();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/config', (req, res) => {
  res.json({ ...config.strategy, cronSchedule: config.cron.schedule, paper: config.alpaca.paper });
});

// --- Agendamento automático (node-cron) ---
if (cron.validate(config.cron.schedule)) {
  cron.schedule(config.cron.schedule, () => {
    logger.info('Cron disparado: iniciando iteração automática do bot');
    runIteration().catch((err) => logger.error('Erro na iteração agendada', { message: err.message }));
  });
  logger.info(`Cron agendado com schedule "${config.cron.schedule}"`);
} else {
  logger.warn(`CRON_SCHEDULE inválido: "${config.cron.schedule}" — agendamento automático desativado`);
}

app.listen(config.server.port, () => {
  logger.info(`Servidor rodando em http://localhost:${config.server.port}`);
});
