/**
 * riskManager.js
 *
 * Classe responsável por toda a matemática de risco do bot:
 *  - quanto dinheiro arriscar por trade (cash at risk)
 *  - quantas ações comprar/vender dado o preço atual
 *  - onde colocar stop loss e take profit
 *
 * Espelha a lógica do vídeo original (position_sizing), mas encapsulada
 * em uma classe reutilizável e testável.
 */
class RiskManager {
  /**
   * @param {Object} opts
   * @param {number} opts.cashAtRisk   fração do cash disponível a arriscar (ex: 0.5 = 50%)
   * @param {number} opts.stopLossPct  distância percentual do stop loss (ex: 0.05 = 5%)
   * @param {number} opts.takeProfitPct distância percentual do take profit (ex: 0.10 = 10%)
   */
  constructor({ cashAtRisk = 0.5, stopLossPct = 0.05, takeProfitPct = 0.10 } = {}) {
    if (cashAtRisk <= 0 || cashAtRisk > 1) {
      throw new Error('cashAtRisk deve estar entre 0 e 1');
    }
    this.cashAtRisk = cashAtRisk;
    this.stopLossPct = stopLossPct;
    this.takeProfitPct = takeProfitPct;
  }

  /**
   * Calcula quantidade de ações a negociar com base no caixa disponível
   * e no preço atual do ativo. Sempre arredonda para baixo (não fracionário).
   */
  calculatePositionSize(availableCash, lastPrice) {
    if (lastPrice <= 0) throw new Error('lastPrice inválido');
    const cashToUse = availableCash * this.cashAtRisk;
    const quantity = Math.floor(cashToUse / lastPrice);
    return { quantity, cashToUse: Number(cashToUse.toFixed(2)) };
  }

  /**
   * Calcula os preços de stop loss e take profit para uma ordem de COMPRA.
   */
  bracketPricesForBuy(lastPrice) {
    return {
      takeProfitPrice: Number((lastPrice * (1 + this.takeProfitPct)).toFixed(2)),
      stopLossPrice: Number((lastPrice * (1 - this.stopLossPct)).toFixed(2)),
    };
  }

  /**
   * Calcula os preços de stop loss e take profit para uma ordem de VENDA
   * a descoberto (short) — espelha a lógica inversa do vídeo original.
   */
  bracketPricesForSell(lastPrice) {
    return {
      takeProfitPrice: Number((lastPrice * (1 - this.takeProfitPct)).toFixed(2)),
      stopLossPrice: Number((lastPrice * (1 + this.stopLossPct)).toFixed(2)),
    };
  }

  /**
   * Decide a ação (buy/sell/hold) a partir do score de sentimento agregado,
   * usando os thresholds configurados.
   */
  static decideAction(sentimentScore, buyThreshold, sellThreshold) {
    if (sentimentScore >= buyThreshold) return 'buy';
    if (sentimentScore <= sellThreshold) return 'sell';
    return 'hold';
  }
}

module.exports = RiskManager;
