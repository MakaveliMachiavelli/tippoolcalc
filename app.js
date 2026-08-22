/* TipPoolCalc — app logic. Vanilla JS, no dependencies, no server. */
'use strict';

/* PRO unlock codes. OWNER: change before promoting (see PAYMENTS.md). */
const PRO_CODES = ['TIPPOOL-PRO-999', 'TPC-DEMO'];
const LS = { draft: 'tpc_draft', pro: 'tpc_pro', teams: 'tpc_teams', hist: 'tpc_hist' };

const ROLES = [
  ['Server', 1.0], ['Bartender', 1.0], ['Barback', 0.7], ['Busser', 0.6],
  ['Food Runner', 0.6], ['Host', 0.5], ['Kitchen / BOH', 0.7],
  ['Dishwasher', 0.5], ['Shift Lead', 0.8], ['Custom', null]
];

let team = [
  { name: 'Anna', role: 'Server', wt: 1.0, hrs: 40 },
  { name: 'Ben', role: 'Bartender', wt: 1.0, hrs: 30 },
  { name: 'Carla', role: 'Busser', wt: 0.6, hrs: 25 },
  { name: 'Diego', role: 'Kitchen / BOH', wt: 0.7, hrs: 40 }
];
let pro = localStorage.getItem(LS.pro) === '1';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cur = () => $('currency').value;
const money = (n) => cur() + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ============ engine ============ */
function calc() {
  const tips = Number($('tips').value) || 0;
  const method = $('method').value;
  const rows = team.map(t => {
    const h = Number(t.hrs) || 0, w = Number(t.wt) || 0;
    return { ...t, h, pts: method === 'points' ? h * w : h };
  });
  const denom = rows.reduce((s, r) => s + (method === 'points' ? r.pts : r.h), 0);
  const out = rows.map(r => {
    const share = denom > 0 ? (method === 'points' ? r.pts : r.h) / denom : 0;
    return { ...r, share, payout: Math.round(tips * share * 100) / 100 };
  });
  // balance the sheet: give rounding remainder to the first person
  const sum = out.reduce((s, r) => s + r.payout, 0);
  const remainder = Math.round((tips - sum) * 100) / 100;
  if (out.length) out[0].payout = Math.round((out[0].payout + remainder) * 100) / 100;
  return { tips, method, rows: out, denom };
}

/* ============ team editor ============ */
function renderTeam() {
  const wrap = $('team');
  wrap.innerHTML = '';
  team.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'team-row';
    const opts = ROLES.map(([r]) => `<option ${r === t.role ? 'selected' : ''}>${r}</option>`).join('');
    row.innerHTML =
      `<input value="${esc(t.name)}" data-i="${i}" data-f="name" placeholder="Name" aria-label="name">` +
      `<select data-i="${i}" data-f="role" aria-label="role">${opts}</select>` +
      `<input type="number" min="0" step="any" value="${t.wt ?? ''}" data-i="${i}" data-f="wt" aria-label="role weight" title="Role weight (points method)">` +
      `<input type="number" min="0" step="any" value="${t.hrs}" data-i="${i}" data-f="hrs" aria-label="hours">` +
      `<button class="row-x" data-i="${i}" aria-label="remove" title="Remove">✕</button>`;
    wrap.appendChild(row);
  });
}

/* ============ payout doc ============ */
function render() {
  const c = calc();
  $('p_period').textContent = $('period').value || 'Week of —';
  $('p_method').textContent = 'Method: ' + (c.method === 'points'
    ? 'hours × role weight (points)' : 'hours worked') + (c.denom > 0 ? ` · total ${c.method === 'points' ? 'points' : 'hours'}: ${c.denom}` : '');
  const tb = $('p_rows');
  tb.innerHTML = '';
  c.rows.forEach(r => {
    const tr = document.createElement('tr');
    const pct = Math.round(r.share * 100);
    tr.innerHTML =
      `<td>${esc(r.name || '—')}</td><td>${esc(r.role)}</td><td class="r">${r.h}</td>` +
      `<td class="r"><span class="share-bar" style="width:${Math.min(60, pct * 1.2)}px"></span>${pct}%</td>` +
      `<td class="r"><strong>${money(r.payout)}</strong></td>`;
    tb.appendChild(tr);
  });
  if (!c.rows.length) tb.innerHTML = '<tr><td colspan="5" style="color:#667085">Add your team on the left.</td></tr>';
  $('p_total').textContent = money(c.tips);
  const sum = c.rows.reduce((s, r) => s + r.payout, 0);
  $('p_check').textContent = c.rows.length && c.tips > 0
    ? `✓ Check: Σ payouts = ${money(sum)} — balances to the pool.`
    : '';
  saveDraft();
}

/* ============ persistence ============ */
function saveDraft() {
  try {
    localStorage.setItem(LS.draft, JSON.stringify({
      tips: $('tips').value, currency: $('currency').value, method: $('method').value,
      period: $('period').value, team
    }));
  } catch (e) {}
}
function loadDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(LS.draft) || 'null');
    if (!d) return;
    $('tips').value = d.tips ?? 1000; $('currency').value = d.currency ?? '$';
    $('method').value = d.method ?? 'hours'; $('period').value = d.period ?? '';
    if (Array.isArray(d.team) && d.team.length) team = d.team;
  } catch (e) {}
}

/* ============ PRO ============ */
function applyPro() {
  $('proBadge').classList.toggle('hidden', !pro);
  $('saveTeamBtn').classList.toggle('hidden', !pro);
  $('loadTeamBtn').classList.toggle('hidden', !pro);
  $('historyBtn').classList.toggle('hidden', !pro);
}

/* ============ history ============ */
function getHist() { try { return JSON.parse(localStorage.getItem(LS.hist) || '[]'); } catch (e) { return []; } }
function logPrint() {
  if (!pro) return;
  const c = calc();
  const hist = getHist();
  hist.push({ at: new Date().toISOString(), period: $('period').value || 'Unlabeled', tips: c.tips, cur: cur(),
    method: c.method, rows: c.rows.map(r => ({ name: r.name, role: r.role, hrs: r.h, payout: r.payout })) });
  localStorage.setItem(LS.hist, JSON.stringify(hist));
}
function renderHist() {
  const h = getHist();
  $('histBody').innerHTML = h.length ? h.map((e, i) => {
    const top = e.rows.slice().sort((a, b) => b.payout - a.payout)[0];
    return `<tr><td>${esc(e.period)}</td><td>${e.cur}${e.tips.toFixed(2)}</td><td>${e.rows.length}</td>` +
      `<td class="r">${top ? esc(top.name) + ' ' + e.cur + top.payout.toFixed(2) : '—'}</td>` +
      `<td><button class="btn-tiny" data-hi="${i}">view</button></td></tr>`;
  }).join('') : '<tr><td colspan="5" style="color:#667085">No payout sheets logged yet.</td></tr>';
}
function exportCsv() {
  const h = getHist();
  const rows = [['Period', 'Name', 'Role', 'Hours', 'Payout', 'Currency', 'Pool', 'Method']]
    .concat(...h.map(e => e.rows.map(r => [e.period, r.name, r.role, r.hrs, r.payout.toFixed(2), e.cur, e.tips.toFixed(2), e.method])));
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'tippoolcalc-history.csv';
  a.click();
}

/* ============ teams ============ */
function getTeams() { try { return JSON.parse(localStorage.getItem(LS.teams) || '[]'); } catch (e) { return []; } }
function saveTeam() {
  const name = prompt('Team name (e.g. "Friday night crew"):');
  if (!name) return;
  const teams = getTeams().filter(t => t.name !== name);
  teams.push({ name, roster: team.map(t => ({ ...t })) });
  localStorage.setItem(LS.teams, JSON.stringify(teams));
  alert('Team saved: ' + name);
}
function renderTeams() {
  const list = getTeams();
  $('teamList').innerHTML = list.length
    ? list.map((t, i) => `<li><div><strong>${esc(t.name)}</strong><br><small>${t.roster.length} people</small></div><button data-ti="${i}">Load</button></li>`).join('')
    : '<li style="color:#667085">No saved teams yet.</li>';
}

/* ============ wire-up ============ */
document.addEventListener('DOMContentLoaded', () => {
  loadDraft();
  renderTeam();
  applyPro();

  ['tips', 'currency', 'method', 'period'].forEach(id => $(id).addEventListener('input', render));

  $('team').addEventListener('input', e => {
    const t = e.target, i = +t.dataset.i, f = t.dataset.f;
    if (f === undefined || Number.isNaN(i)) return;
    if (f === 'hrs' || f === 'wt') team[i][f] = Number(t.value) || 0; else team[i][f] = t.value;
    render();
  });
  $('team').addEventListener('change', e => {
    const t = e.target, i = +t.dataset.i;
    if (t.dataset.f !== 'role') return;
    team[i].role = t.value;
    const preset = ROLES.find(([r]) => r === t.value);
    if (preset && preset[1] !== null) {
      team[i].wt = preset[1];
      renderTeam(); // refresh weight input
    }
    render();
  });
  $('team').addEventListener('click', e => {
    if (e.target.classList.contains('row-x')) { team.splice(+e.target.dataset.i, 1); renderTeam(); render(); }
  });
  $('addRow').addEventListener('click', () => { team.push({ name: '', role: 'Server', wt: 1.0, hrs: 0 }); renderTeam(); render(); });
  $('resetBtn').addEventListener('click', () => {
    team = [{ name: '', role: 'Server', wt: 1.0, hrs: 0 }];
    $('tips').value = 1000; $('period').value = '';
    renderTeam(); render();
  });
  $('printBtn').addEventListener('click', () => { logPrint(); window.print(); });

  // pay modal
  const openPay = () => { $('payModal').classList.remove('hidden'); $('codeMsg').textContent = ''; };
  $('proBtn').addEventListener('click', openPay);
  $('proBtn2').addEventListener('click', openPay);
  $('payClose').addEventListener('click', () => $('payModal').classList.add('hidden'));
  $('codeBtn').addEventListener('click', () => {
    const code = $('codeInput').value.trim().toUpperCase();
    if (PRO_CODES.includes(code)) {
      pro = true; localStorage.setItem(LS.pro, '1'); applyPro();
      $('codeMsg').textContent = '✓ PRO unlocked — teams, history and CSV export are active.';
      $('codeMsg').className = 'code-msg ok';
      setTimeout(() => $('payModal').classList.add('hidden'), 1500);
    } else {
      $('codeMsg').textContent = 'Invalid code — check the code from your payment receipt.';
      $('codeMsg').className = 'code-msg bad';
    }
  });
  $('codeInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('codeBtn').click(); });

  // history modal
  $('historyBtn').addEventListener('click', () => { renderHist(); $('histModal').classList.remove('hidden'); });
  $('histClose').addEventListener('click', () => $('histModal').classList.add('hidden'));
  $('exportCsv').addEventListener('click', exportCsv);
  $('clearHist').addEventListener('click', () => { if (confirm('Clear all payout history?')) { localStorage.removeItem(LS.hist); renderHist(); } });
  $('histBody').addEventListener('click', e => {
    const btn = e.target.closest('button[data-hi]'); if (!btn) return;
    const entry = getHist()[+btn.dataset.hi];
    if (!entry) return;
    const lines = entry.rows.map(r => `${r.name} (${r.role}, ${r.hrs}h): ${entry.cur}${r.payout.toFixed(2)}`).join('\n');
    alert(`${entry.period} — pool ${entry.cur}${entry.tips.toFixed(2)}\n\n${lines}`);
  });

  // teams
  $('saveTeamBtn').addEventListener('click', saveTeam);
  $('loadTeamBtn').addEventListener('click', () => { renderTeams(); $('teamModal').classList.remove('hidden'); });
  $('teamClose').addEventListener('click', () => $('teamModal').classList.add('hidden'));
  $('teamList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-ti]'); if (!btn) return;
    const t = getTeams()[+btn.dataset.ti];
    if (t) { team = t.roster.map(x => ({ ...x })); renderTeam(); render(); $('teamModal').classList.add('hidden'); }
  });

  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); }));

  render();
});
