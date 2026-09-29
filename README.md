# 🤖 AI Trading Bot — Node.js

> **Sistema automatizado de análise de notícias e execução de operações financeiras utilizando Inteligência Artificial, Node.js e a API da Alpaca.**

Uma reimplementação em **Node.js puro (JavaScript)** do projeto **AI Trading Bot**, originalmente desenvolvido por Nicholas Renotte, eliminando a dependência de Python.

O sistema realiza **análise de sentimento de notícias em tempo real**, utiliza os resultados para auxiliar na tomada de decisões de negociação e pode executar ordens automaticamente na **Alpaca**, incluindo gerenciamento de risco com **Bracket Orders, Stop Loss e Take Profit**.

Além disso, o projeto conta com um **dashboard web** para acompanhamento das operações, notícias, saldo da conta e logs do robô.

---

## 📌 Funcionalidades

- 📰 Busca de notícias financeiras em tempo real
- 🤖 Análise automatizada de sentimento utilizando NLP
- 📈 Identificação de possíveis oportunidades de negociação
- 💹 Execução automática de ordens através da Alpaca
- 🛡️ Gerenciamento de risco
- 🎯 Stop Loss e Take Profit
- 📦 Bracket Orders
- 💰 Consulta de saldo e informações da conta
- 📋 Monitoramento de ordens executadas
- 📝 Sistema de logs em memória
- 🖥️ Dashboard web para acompanhamento do robô
- 🔄 Atualização automática do dashboard a cada 8 segundos
- ⚙️ Configuração através de variáveis de ambiente
- 🚀 Backend desenvolvido inteiramente em Node.js

---

## 🏗️ Arquitetura do Projeto

```text
ai-trading-bot-js/
│
├── 📄 package.json
├── 🔐 .env.example
│
├── 📁 src/
│   ├── config.js
│   │   └── Variáveis de ambiente centralizadas
│   │
│   ├── logger.js
│   │   └── Sistema de logs com buffer em memória
│   │
│   ├── sentimentAnalyzer.js
│   │   └── Análise de sentimento das notícias
│   │
│   ├── newsService.js
│   │   └── Busca de notícias através da Alpaca News API
│   │
│   ├── alpacaService.js
│   │   └── Integração com a API/SDK da Alpaca
│   │
│   ├── riskManager.js
│   │   └── Gerenciamento de risco e cálculo das posições
│   │
│   ├── tradingBot.js
│   │   └── Orquestração do fluxo de negociação
│   │
│   └── server.js
│       └── Servidor Express, Cron Jobs e API do Dashboard
│
└── 📁 public/
    ├── index.html
    │   └── Estrutura do Dashboard
    │
    ├── style.css
    │   └── Estilos e responsividade
    │
    └── app.js
        └── Atualização dos dados e interação com o Dashboard
```

---

## 🔄 Fluxo de Funcionamento

O funcionamento do robô segue o seguinte fluxo:

```text
┌─────────────────────┐
│   📰 Notícias       │
│   Alpaca News API   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 🤖 Análise de       │
│    Sentimento       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 📊 Decisão de       │
│    Negociação       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 🛡️ Risk Manager     │
│ Stop / Take Profit  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 💹 Alpaca Trading   │
│   API / Orders      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 📈 Dashboard        │
│ Monitoramento       │
└─────────────────────┘
```

---

## 🧩 Tecnologias Utilizadas

| Tecnologia | Utilização |
|---|---|
| 🟢 **Node.js** | Runtime principal da aplicação |
| 🟨 **JavaScript** | Linguagem de desenvolvimento |
| 🚂 **Express.js** | Servidor web e API |
| 🧠 **NLP** | Análise de sentimento |
| 📰 **Alpaca News API** | Obtenção das notícias |
| 💹 **Alpaca Trading API** | Execução e gerenciamento das ordens |
| ⏰ **Cron** | Agendamento das rotinas do robô |
| 🌐 **HTML/CSS/JavaScript** | Desenvolvimento do Dashboard |
| 🔐 **dotenv** | Gerenciamento das variáveis de ambiente |

---

## 📂 Organização dos Módulos

### `config.js`

Centraliza todas as configurações da aplicação e as variáveis obtidas através do arquivo `.env`.

---

### `logger.js`

Responsável pelo sistema de logs da aplicação.

Os logs são armazenados em um **buffer em memória**, permitindo que o Dashboard apresente informações sobre o funcionamento do robô em tempo real.

---

### `sentimentAnalyzer.js`

Responsável pela análise de sentimento das notícias.

O módulo recebe o conteúdo das notícias e classifica seu sentimento, permitindo que o robô utilize essa informação como parte da estratégia de negociação.

---

### `newsService.js`

Responsável pela comunicação com a **Alpaca News API**.

Suas principais funções incluem:

- Buscar notícias;
- Filtrar notícias relevantes;
- Organizar os dados recebidos;
- Disponibilizar as notícias para o mecanismo de análise.

---

### `alpacaService.js`

Implementa a camada de comunicação com a **Alpaca**.

É responsável por operações como:

- Consulta da conta;
- Consulta de posições;
- Consulta de ordens;
- Envio de ordens;
- Gerenciamento de operações.

---

### `riskManager.js`

Responsável pelo gerenciamento de risco das operações.

Entre suas responsabilidades estão:

- Definição do tamanho da posição;
- Cálculo de Stop Loss;
- Cálculo de Take Profit;
- Configuração de Bracket Orders;
- Controle dos parâmetros de risco.

---

### `tradingBot.js`

É o **orquestrador principal do sistema**.

Coordena todo o fluxo:

```text
Notícia
   ↓
Análise de Sentimento
   ↓
Avaliação da Estratégia
   ↓
Gerenciamento de Risco
   ↓
Envio da Ordem
   ↓
Monitoramento
```

---

### `server.js`

Responsável pela execução do servidor da aplicação.

Integra:

- Express;
- API do Dashboard;
- Cron Jobs;
- Serviços do robô;
- Rotinas de atualização;
- Endpoints de monitoramento.

---

## 🖥️ Dashboard

O projeto possui um Dashboard web para acompanhar o funcionamento do robô.

Entre as informações apresentadas estão:

- 💰 Saldo da conta
- 📊 Informações da carteira
- 📰 Notícias recentes
- 🤖 Análises de sentimento
- 📈 Ordens executadas
- 📝 Logs do sistema
- 🔄 Status do robô

Os dados são atualizados automaticamente através de **polling a cada 8 segundos**.

```text
Dashboard
    │
    ├── 💰 Saldo
    ├── 📰 Notícias
    ├── 🧠 Sentimentos
    ├── 📈 Ordens
    └── 📝 Logs
          │
          └── Atualização automática
                 ↕
              8 segundos
```

---

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd ai-trading-bot-js
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie uma cópia do arquivo `.env.example`:

```bash
cp .env.example .env
```

Depois, configure suas credenciais e parâmetros no arquivo `.env`.

Exemplo:

```env
ALPACA_API_KEY=your_api_key
ALPACA_SECRET_KEY=your_secret_key
ALPACA_BASE_URL=your_base_url

PORT=3000
```

> ⚠️ **Nunca publique suas chaves da Alpaca no GitHub.** O arquivo `.env` deve permanecer fora do controle de versão.

---

## ▶️ Executando o Projeto

Para iniciar a aplicação:

```bash
npm start
```

Para desenvolvimento:

```bash
npm run dev
```

Após iniciar o servidor, acesse:

```text
http://localhost:3000
```

---

## 🧪 Ambiente de Testes

Recomenda-se utilizar inicialmente o ambiente **Paper Trading** da Alpaca para testar o funcionamento do sistema sem utilizar dinheiro real.

O fluxo recomendado é:

```text
Desenvolvimento
      ↓
Testes locais
      ↓
Paper Trading
      ↓
Validação da estratégia
      ↓
Monitoramento
      ↓
Produção
```

---

## 🛡️ Gerenciamento de Risco

O robô possui mecanismos para controlar o risco das operações, incluindo:

- Definição do tamanho das posições;
- Stop Loss;
- Take Profit;
- Bracket Orders;
- Controle dos parâmetros de entrada;
- Limitação da exposição por operação.

> **Importante:** estratégias automatizadas podem gerar perdas financeiras. Os mecanismos de gerenciamento de risco não eliminam o risco de perda.

---

## 🔐 Segurança

Nunca versione informações sensíveis.

Adicione o `.env` ao `.gitignore`:

```gitignore
.env
node_modules/
logs/
```

As credenciais da Alpaca devem ser armazenadas exclusivamente através de variáveis de ambiente.

---

## 📁 Estrutura de Dados

O fluxo interno do sistema pode ser representado da seguinte maneira:

```text
                    ┌──────────────┐
                    │    Alpaca    │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        📰 News API              💹 Trading API
              │                         │
              ▼                         │
     Sentiment Analyzer                 │
              │                         │
              ▼                         │
       Trading Strategy                 │
              │                         │
              ▼                         │
        Risk Manager ───────────────────┘
              │
              ▼
           Orders
              │
              ▼
         📊 Dashboard
```

---

## 🚀 Possíveis Melhorias

Algumas funcionalidades que podem ser adicionadas futuramente:

- [ ] 📊 Gráficos de desempenho da carteira
- [ ] 🧠 Modelos de NLP mais avançados
- [ ] 📈 Mais indicadores técnicos
- [ ] 🔔 Sistema de notificações
- [ ] 📧 Alertas por e-mail
- [ ] 📱 Dashboard responsivo para dispositivos móveis
- [ ] 💾 Persistência dos dados em banco de dados
- [ ] 📊 Histórico de operações
- [ ] 🧪 Backtesting da estratégia
- [ ] 🔄 WebSockets para atualização em tempo real
- [ ] 👤 Sistema de autenticação do Dashboard
- [ ] 🐳 Dockerização da aplicação

---

## 📜 Licença

Este projeto foi desenvolvido para fins **educacionais e experimentais**.

Consulte o arquivo `LICENSE` para obter informações sobre os termos de utilização.

---

## ⚠️ Disclaimer

Este projeto **não constitui recomendação ou aconselhamento financeiro**.

Operações automatizadas no mercado financeiro envolvem riscos, incluindo a possibilidade de perda parcial ou total do capital investido.

Utilize o sistema com responsabilidade e realize testes adequados, preferencialmente em ambiente de **Paper Trading**, antes de qualquer utilização com capital real.

---

## 👨‍💻 Projeto

**AI Trading Bot — Node.js / JavaScript**

Desenvolvido como uma reimplementação em Node.js de um projeto de AI Trading Bot, com foco em:

> **Automação • Inteligência Artificial • Análise de Sentimento • Trading • Gerenciamento de Risco**