/**
 * sentimentAnalyzer.js
 *
 * Módulo de NLP responsável por transformar um conjunto de manchetes/notícias
 * em um "score" de sentimento e um sinal de trading (positive/negative/neutral).
 *
 * Estratégia:
 *  - Usa a lib `sentiment` (léxico AFINN), 100% JS, local, sem downloads
 *    de modelo e sem custo de API — equivalente rápido ao FinBERT usado
 *    no vídeo original (Python), porém mais leve.
 *  - Cada notícia recebe um score normalizado entre -1 e 1.
 *  - O score agregado é a média ponderada pelas notícias mais recentes.
 *
 * Observação: se quiser um modelo Transformer real (mais parecido com o
 * FinBERT do vídeo original), veja a seção "Upgrade para Transformers.js"
 * no README — o pacote @xenova/transformers permite rodar modelos tipo
 * distilbert-sst2 localmente, em JS puro, trocando apenas a implementação
 * de `scoreText` abaixo.
 */
const Sentiment = require('sentiment');
const analyzer = new Sentiment();

/**
 * Normaliza o score bruto da lib `sentiment` (não limitado) para o
 * intervalo [-1, 1] usando uma função de saturação suave.
 */
function normalize(comparative) {
  // `comparative` já é o score dividido pelo nº de tokens (-∞, ∞).
  // tanh comprime suavemente para [-1, 1].
  return Math.tanh(comparative * 2);
}

/**
 * Analisa um único texto e retorna { score, label }.
 */
function scoreText(text) {
  if (!text || !text.trim()) return { score: 0, label: 'neutral' };
  const result = analyzer.analyze(text);
  const score = normalize(result.comparative);
  const label = score > 0.15 ? 'positive' : score < -0.15 ? 'negative' : 'neutral';
  return { score, label, positiveWords: result.positive, negativeWords: result.negative };
}

/**
 * Analisa uma lista de notícias (headline + summary) e retorna:
 *  - score agregado [-1, 1]
 *  - label agregada (positive/negative/neutral)
 *  - detalhamento por notícia (útil para exibir no dashboard)
 */
function analyzeNews(newsItems = []) {
  if (newsItems.length === 0) {
    return { score: 0, label: 'neutral', count: 0, details: [] };
  }

  const details = newsItems.map((item) => {
    const text = `${item.headline || ''}. ${item.summary || ''}`;
    const { score, label } = scoreText(text);
    return {
      headline: item.headline,
      source: item.source,
      createdAt: item.created_at,
      url: item.url,
      score: Number(score.toFixed(3)),
      label,
    };
  });

  // Notícias mais recentes pesam um pouco mais (peso linear decrescente).
  const n = details.length;
  let weightedSum = 0;
  let weightTotal = 0;
  details.forEach((d, idx) => {
    const weight = n - idx; // assume que a lista já vem ordenada da mais recente p/ mais antiga
    weightedSum += d.score * weight;
    weightTotal += weight;
  });

  const aggregateScore = Number((weightedSum / weightTotal).toFixed(3));
  const label =
    aggregateScore > 0.15 ? 'positive' : aggregateScore < -0.15 ? 'negative' : 'neutral';

  return { score: aggregateScore, label, count: n, details };
}

module.exports = { scoreText, analyzeNews };
