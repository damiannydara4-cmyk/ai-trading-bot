# AI Trading Bot — versão 100% JavaScript / Node.js

Reimplementação, em Node.js puro (sem Python), do projeto de AI Trading Bot
do Nicholas Renotte: análise de sentimento de notícias + execução automática
de ordens na Alpaca (bracket orders com stop loss e take profit), com
dashboard web para acompanhar tudo em tempo real.

## Arquitetura

```
ai-trading-bot-js/
├── package.json
├── .env.example
├── src/
│   ├── config.js            # variáveis de ambiente centralizadas
│   ├── logger.js             # logs com buffer em memória (para o dashboard)
│   ├── sentimentAnalyzer.js  # NLP: análise de sentimento das notícias
│   ├── newsService.js        # busca notícias na Alpaca News API
│   ├── alpacaService.js      # wrapper do SDK da Alpaca (conta/ordens)
│   ├── riskManager.js        # tamanho de posição, stop loss, take profit
│   ├── tradingBot.js         # orquestra: notícia -> sentimento -> ordem
│   └── server.js             # Express + cron + API para o dashboard
└── public/
    ├── index.html
    ├── style.css
    └── app.js                # polling a cada 8s (saldo, notícias, ordens)
```

## Guia de execução — continuando de onde você parou

Você já rodou `npm install` e viu este aviso:

```
39 packages are looking for funding
5 vulnerabilities (4 high, 1 critical)
```

**Isso é normal** em praticamente qualquer projeto Node com dependências de
terceiros (o `alpaca-trade-api` puxa libs antigas em sua árvore de
dependências). **Não rode `npm audit fix --force`** agora — ele pode
atualizar pacotes para versões com breaking changes e travar o SDK da
Alpaca. Siga os passos abaixo primeiro; se quiser, tratamos as
vulnerabilidades no final (passo 7).

### 1. Confirme que as dependências foram instaladas

Dentro da pasta do projeto:

```bash
cd ai-trading-bot-js
npm install
```

(se você já rodou isso e só viu os avisos, pode seguir direto para o passo 2)

### 2. Crie sua conta paper trading na Alpaca

1. Acesse https://app.alpaca.markets/signup e crie uma conta gratuita.
2. No dashboard, ative o modo **Paper Trading** (simulação, dinheiro fictício).
3. Vá em **API Keys** e gere uma `Key ID` e uma `Secret Key`.

### 3. Configure o arquivo `.env`

```bash
cp .env.example .env
```

Abra o `.env` e cole suas chaves:

```
APCA_API_KEY_ID=sua_key_aqui
APCA_API_SECRET_KEY=sua_secret_aqui
APCA_PAPER=true
```

Ajuste também, se quiser, `SYMBOL`, `CASH_AT_RISK`, `STOP_LOSS_PCT`,
`TAKE_PROFIT_PCT` e `CRON_SCHEDULE`.

### 4. Rode o bot uma vez, isoladamente (sem dashboard)

Útil para validar que as credenciais e a lógica funcionam:

```bash
npm run bot
```

Você deve ver um JSON no terminal com o sentimento calculado, a ação
decidida (`buy` / `sell` / `hold`) e, se aplicável, os dados da ordem
enviada.

### 5. Suba o servidor com o dashboard

```bash
npm start
```

Acesse **http://localhost:3000** no navegador. Você verá:

- Saldo da conta (cash, equity, buying power)
- Sentimento agregado das notícias recentes do ativo configurado
- Lista de notícias com score individual
- Tabela de ordens recentes (status, lado, quantidade)
- Logs do bot em tempo real
- Botão **"Rodar agora"** para forçar uma iteração manual

O dashboard atualiza sozinho a cada 8 segundos (polling).

### 6. Deixe o bot rodando automaticamente

Enquanto `npm start` estiver ativo, o `node-cron` dispara `runIteration()`
automaticamente segundo o `CRON_SCHEDULE` do `.env` (padrão: a cada 5
minutos, em dias úteis). Não precisa de terminal adicional.

Para rodar em segundo plano de forma mais robusta, use o `pm2`:

```bash
npm install -g pm2
pm2 start src/server.js --name ai-trading-bot
pm2 logs ai-trading-bot
```

### 7. (Opcional) Resolver as vulnerabilidades do npm audit

Depois que tudo estiver funcionando, você pode investigar com calma:

```bash
npm audit
```

Leia a lista — na maioria dos casos são dependências indiretas de
ferramentas de build/teste, não do código que roda em produção. Se quiser
corrigir sem quebrar nada:

```bash
npm audit fix
```

(sem `--force`). Só use `--force` se tiver certeza e testar o bot de novo
em seguida (`npm run bot`), pois ele pode subir versões maiores das libs.

## Como a IA de sentimento funciona

`src/sentimentAnalyzer.js` usa a biblioteca `sentiment` (léxico AFINN) para
pontuar cada notícia entre -1 e 1, depois agrega as notícias mais recentes
com peso maior. Isso substitui o FinBERT (Python/HuggingFace) do vídeo
original por uma solução 100% JS, local e sem custo de API.

### Upgrade para Transformers.js (opcional, modelo real tipo FinBERT)

Se quiser um modelo neural de verdade (mais fiel ao vídeo original), troque
a implementação de `scoreText` em `sentimentAnalyzer.js` por algo como:

```js
const { pipeline } = require('@xenova/transformers');
let classifier;
async function scoreTextML(text) {
  if (!classifier) {
    classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
  }
  const [result] = await classifier(text);
  const score = result.label === 'POSITIVE' ? result.score : -result.score;
  return { score, label: result.label.toLowerCase() };
}
```

Instale com `npm install @xenova/transformers` (primeira execução baixa o
modelo, ~250MB, e roda 100% local depois disso).

## Aviso importante

Este projeto é educacional. Trading automatizado envolve risco real de
perda de capital. Use **sempre** a conta paper (`APCA_PAPER=true`) até
entender completamente o comportamento do bot, e nunca invista dinheiro
que não pode perder.
