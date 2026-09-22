/**
 * app.js
 * Frontend simples: faz polling nas rotas da API a cada poucos segundos
 * para simular atualização "em tempo real" do saldo, notícias, sentimento,
 * ordens e logs do bot.
 */
const REFRESH_MS = 8000;

async function getJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function fmtMoney(v) {
  const n = Number(v);
  return isNaN(n) ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

async function refreshConfig() {
  try {
    const cfg = await getJSON('/api/config');
    document.getElementById('symbol-label').textContent = cfg.symbol;
    document.getElementById('paper-badge').textContent = cfg.paper ? 'PAPER' : 'LIVE';
    document.getElementById('paper-badge').style.background = cfg.paper ? '' : 'var(--red)';
  } catch (e) { /* silencioso */ }
}

async function refreshAccount() {
  try {
    const acc = await getJSON('/api/account');
    document.getElementById('acc-cash').textContent = fmtMoney(acc.cash);
    document.getElementById('acc-equity').textContent = fmtMoney(acc.equity);
    document.getElementById('acc-buying-power').textContent = fmtMoney(acc.buying_power);
  } catch (e) {
    document.getElementById('acc-cash').textContent = 'erro';
  }

  try {
    const pos = await getJSON('/api/position');
    document.getElementById('acc-position').textContent = pos
      ? `${pos.qty} ações @ ${fmtMoney(pos.avg_entry_price)}`
      : 'nenhuma';
  } catch (e) {
    document.getElementById('acc-position').textContent = '—';
  }
}

async function refreshNews() {
  try {
    const { sentiment } = await getJSON('/api/news');
    const label = sentiment.label;
    const pill = document.getElementById('sentiment-label');
    pill.textContent = label;
    pill.className = `pill ${label}`;
    document.getElementById('sentiment-value').textContent = sentiment.score.toFixed(3);

    const list = document.getElementById('news-list');
    list.innerHTML = '';
    sentiment.details.slice(0, 10).forEach((n) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="news-headline">${n.headline ?? '(sem título)'}</div>
        <div class="news-meta">${n.source ?? ''} · ${fmtDate(n.createdAt)} · score
          <strong style="color:${n.score > 0 ? 'var(--green)' : n.score < 0 ? 'var(--red)' : 'var(--muted)'}">
            ${n.score.toFixed(2)}
          </strong>
        </div>`;
      list.appendChild(li);
    });
  } catch (e) { /* silencioso */ }
}

async function refreshOrders() {
  try {
    const orders = await getJSON('/api/orders');
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = '';
    orders.slice(0, 15).forEach((o) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.symbol}</td>
        <td class="side-${o.side}">${o.side}</td>
        <td>${o.qty}</td>
        <td>${o.order_class || o.type}</td>
        <td>${o.status}</td>
        <td>${fmtDate(o.created_at)}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) { /* silencioso */ }
}

async function refreshLastRun() {
  try {
    const run = await getJSON('/api/last-run');
    document.getElementById('last-action').textContent = run ? run.action : '—';
    document.getElementById('last-run-time').textContent = run ? fmtDate(run.timestamp) : '—';
  } catch (e) { /* silencioso */ }
}

async function refreshLogs() {
  try {
    const logs = await getJSON('/api/logs');
    const list = document.getElementById('logs-list');
    list.innerHTML = '';
    logs.forEach((l) => {
      const li = document.createElement('li');
      li.textContent = `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`;
      list.appendChild(li);
    });
  } catch (e) { /* silencioso */ }
}

async function refreshAll() {
  await Promise.all([refreshConfig(), refreshAccount(), refreshNews(), refreshOrders(), refreshLastRun(), refreshLogs()]);
}

document.getElementById('run-now-btn').addEventListener('click', async (e) => {
  e.target.disabled = true;
  e.target.textContent = 'Rodando...';
  try {
    await getJSON('/api/run-now', { method: 'POST' });
  } catch (err) {
    alert('Erro ao rodar o bot: ' + err.message);
  } finally {
    e.target.disabled = false;
    e.target.textContent = 'Rodar agora';
    refreshAll();
  }
});

refreshAll();
setInterval(refreshAll, REFRESH_MS);
