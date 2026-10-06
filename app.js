// Порог онлайна, сек: ПК онлайн, если last_seen не старше этого.
const ONLINE_AFTER_SEC = 300;

const rows = document.getElementById('rows');
const cOnline = document.getElementById('cOnline');
const cOffline = document.getElementById('cOffline');
const cTotal = document.getElementById('cTotal');
const updated = document.getElementById('updated');
const q = document.getElementById('q');

let all = [];

function ago(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return s + ' сек назад';
  if (s < 3600) return Math.floor(s / 60) + ' мин назад';
  if (s < 86400) return Math.floor(s / 3600) + ' ч назад';
  return Math.floor(s / 86400) + ' дн назад';
}

function render() {
  const f = q.value.trim().toLowerCase();
  let on = 0;
  rows.innerHTML = '';
  all.forEach(p => {
    const online = (Date.now() - p.ts) / 1000 <= ONLINE_AFTER_SEC;
    if (online) on++;
    if (f && !(p.name.toLowerCase().includes(f) || p.ip.toLowerCase().includes(f))) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td><td>${p.ip}</td><td>${p.os || '—'}</td>` +
      `<td class="${online ? 'on' : 'off'}"><span class="dot"></span>${online ? 'Онлайн' : 'Оффлайн'}</td>` +
      `<td>${ago(p.ts)}</td>`;
    rows.appendChild(tr);
  });
  cOnline.textContent = on;
  cOffline.textContent = all.length - on;
  cTotal.textContent = all.length;
  updated.textContent = 'обновлено: ' + new Date().toLocaleString('ru-RU');
}

async function load() {
  try {
    const r = await fetch('pcs.json?t=' + Date.now());
    const raw = await r.json();
    const list = Array.isArray(raw) ? raw : raw.pcs;
    const now = Date.now();
    all = list.map(p => ({
      name: p.name || p.id, ip: p.ip || '—', os: p.os || '',
      ts: p.last_seen ? Date.parse(p.last_seen)
        : now - (p.last_seen_offset_sec || 9999) * 1000
    }));
  } catch (e) {
    all = [];
  }
  render();
}

document.getElementById('refresh').onclick = load;
q.oninput = render;
load();
setInterval(load, 30000);
