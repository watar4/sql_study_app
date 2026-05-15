import { problems, chapters } from './problems.js';
import { renderCheatsheet } from './cheatsheet.js';

let SQL = null;
let db = null;
let currentProblemId = null;

const SOLVED_KEY = 'sql_study_solved_v2';
const editorKey = (id) => `sql_study_editor_v2_${id}`;

// ===== SQL.js init =====
async function initDB() {
  // window.initSqlJs は index.html の <script> でグローバルに注入される
  if (typeof window.initSqlJs !== 'function') {
    throw new Error('sql.js が読み込めていません。ネットワーク or CDN を確認してください。');
  }
  SQL = await window.initSqlJs({
    locateFile: f => `https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/${f}`
  });
  db = new SQL.Database();
}

function resetDB() {
  if (db) db.close();
  db = new SQL.Database();
}

function execSetup(sql) {
  db.exec(sql);
}

function execQuery(sql) {
  const results = db.exec(sql);
  if (!results || results.length === 0) return { columns: [], values: [] };
  return results[results.length - 1];
}

function getTableTypes(tableName) {
  try {
    const info = execQuery(`PRAGMA table_info("${tableName}")`);
    const types = {};
    if (info.values) {
      for (const row of info.values) {
        types[row[1]] = row[2] || 'ANY';
      }
    }
    return types;
  } catch {
    return {};
  }
}

// ===== Storage =====
function getSolved() {
  try { return JSON.parse(localStorage.getItem(SOLVED_KEY) || '[]'); }
  catch { return []; }
}
function markSolved(id) {
  const solved = getSolved();
  if (!solved.includes(id)) {
    solved.push(id);
    localStorage.setItem(SOLVED_KEY, JSON.stringify(solved));
  }
  renderSidebar();
}

// ===== Sidebar =====
function renderSidebar() {
  const list = document.getElementById('problem-list');
  list.innerHTML = '';
  const solved = getSolved();

  const byCategory = {};
  for (const p of problems) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  for (const [cat, items] of Object.entries(byCategory)) {
    const h = document.createElement('div');
    h.className = 'cat-header';
    h.textContent = cat;
    list.appendChild(h);

    for (const p of items) {
      const item = document.createElement('div');
      item.className = 'problem-item';
      if (p.id === currentProblemId) item.classList.add('active');
      if (solved.includes(p.id)) item.classList.add('solved');
      const icon = solved.includes(p.id) ? '✓' : '○';
      item.innerHTML = `<span class="status-icon">${icon}</span><span>${p.title}</span>`;
      item.onclick = () => loadProblem(p.id);
      list.appendChild(item);
    }
  }

  document.getElementById('progress').textContent =
    `進捗: ${solved.length} / ${problems.length} 問解答済`;
}

// ===== Home view =====
function showHome() {
  document.getElementById('problem-view').style.display = 'none';
  document.getElementById('cheatsheet').style.display = 'none';
  document.getElementById('home-view').style.display = 'block';
  document.getElementById('home-btn').classList.add('active');
  currentProblemId = null;
  renderHome();
  renderSidebar();
  document.getElementById('main').scrollTop = 0;
}

function renderHome() {
  const solved = getSolved();
  const total = problems.length;
  const solvedCount = solved.length;
  document.getElementById('big-progress-num').textContent = `${solvedCount} / ${total}`;
  const pct = total > 0 ? Math.round(solvedCount / total * 100) : 0;
  document.getElementById('overall-progress-fill').style.width = pct + '%';
  document.getElementById('overall-progress-pct').textContent = pct + '% 完了';

  const grid = document.getElementById('chapter-grid');
  grid.innerHTML = '';
  for (const ch of chapters) {
    const inCh = problems.filter(p => p.category === ch.name);
    if (inCh.length === 0) continue;
    const solvedInCh = inCh.filter(p => solved.includes(p.id));
    const chPct = Math.round(solvedInCh.length / inCh.length * 100);
    const completed = solvedInCh.length === inCh.length;

    const card = document.createElement('div');
    card.className = 'chapter-card' + (completed ? ' completed' : '');
    card.innerHTML = `
      <div class="chapter-header">
        <h3>${escapeHtml(ch.name)}</h3>
        <span class="chapter-progress-badge">${solvedInCh.length}/${inCh.length}${completed ? ' ✓' : ''}</span>
      </div>
      <div class="chapter-desc">${escapeHtml(ch.description)}</div>
      <ul class="chapter-skills">
        ${ch.skills.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
      </ul>
      <div class="mini-progress-bar">
        <div class="mini-progress-fill" style="width:${chPct}%"></div>
      </div>
    `;
    card.onclick = () => {
      const next = inCh.find(p => !solved.includes(p.id)) || inCh[0];
      if (next) loadProblem(next.id);
    };
    grid.appendChild(card);
  }
}

// ===== Problem loader =====
function loadProblem(id) {
  const p = problems.find(x => x.id === id);
  if (!p) return;
  currentProblemId = id;

  document.getElementById('home-view').style.display = 'none';
  document.getElementById('cheatsheet').style.display = 'none';
  document.getElementById('home-btn').classList.remove('active');
  document.getElementById('problem-view').style.display = 'block';

  const header = document.getElementById('problem-header');
  header.querySelector('.category').textContent = p.category;
  header.querySelector('.difficulty').textContent = p.difficulty || '★';
  header.querySelector('.title').textContent = p.title;
  document.getElementById('description').innerHTML = p.description;

  resetDB();
  execSetup(p.setup);

  const schemaDiv = document.getElementById('schema');
  schemaDiv.innerHTML = '<h3>📋 利用可能なテーブル (先頭5行・型付き)</h3>';
  for (const t of p.tables) {
    const types = getTableTypes(t);
    const res = execQuery(`SELECT * FROM ${t} LIMIT 5`);
    const div = document.createElement('div');
    div.className = 'table-info';
    div.innerHTML = `<div class="table-name">${t}</div>${renderTable(res, types)}`;
    schemaDiv.appendChild(div);
  }

  const saved = localStorage.getItem(editorKey(id));
  document.getElementById('editor').value = saved || '';

  setStatus('', null);
  setResults(null, null);

  const hintsDiv = document.getElementById('hints');
  const hintBtn = document.getElementById('hint-btn');
  if (p.hints && p.hints.length) {
    hintsDiv.innerHTML = '<div class="note-header">💡 ヒント</div>' +
      p.hints.map(h => `<div>・ ${h}</div>`).join('');
    hintsDiv.classList.remove('visible');
    hintBtn.style.display = '';
    hintBtn.textContent = '💡 ヒントを見る';
  } else {
    hintsDiv.classList.remove('visible');
    hintBtn.style.display = 'none';
  }

  const bqDiv = document.getElementById('bq-notes');
  if (p.bqNotes) {
    bqDiv.innerHTML = `<div class="note-header">📘 BigQuery の書き方</div>${p.bqNotes}`;
    bqDiv.classList.add('visible');
  } else {
    bqDiv.classList.remove('visible');
  }

  renderSidebar();
  document.getElementById('main').scrollTop = 0;
}

// ===== Rendering =====
function renderTable(result, types) {
  if (!result.columns.length) {
    return '<div class="empty">(結果0列)</div>';
  }
  const headerCells = result.columns.map(c => {
    const t = types && types[c] ? `<span class="col-type">${escapeHtml(types[c])}</span>` : '';
    return `<th>${escapeHtml(c)}${t}</th>`;
  }).join('');
  if (!result.values.length) {
    return `<table class="result-table"><thead><tr>${headerCells}</tr></thead><tbody><tr><td colspan="${result.columns.length}" class="null">(結果0行)</td></tr></tbody></table>`;
  }
  let html = `<table class="result-table"><thead><tr>${headerCells}</tr></thead><tbody>`;
  for (const row of result.values) {
    html += '<tr>';
    for (const v of row) {
      if (v === null || v === undefined) {
        html += '<td class="null">NULL</td>';
      } else {
        html += `<td>${escapeHtml(String(v))}</td>`;
      }
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== Run / compare =====
function runQuery() {
  const p = problems.find(x => x.id === currentProblemId);
  if (!p) return;
  const sql = document.getElementById('editor').value.trim();
  if (!sql) {
    setStatus('SQL を入力してください', 'error');
    return;
  }
  localStorage.setItem(editorKey(currentProblemId), sql);

  setStatus('実行中...', null);

  try {
    resetDB();
    execSetup(p.setup);
    const userResult = execQuery(sql);

    resetDB();
    execSetup(p.setup);
    const expectedResult = execQuery(p.expected);

    setResults(userResult, expectedResult);

    if (compareResults(userResult, expectedResult, p.ordered === true)) {
      setStatus('✓ 正解です!', 'success');
      markSolved(p.id);
    } else {
      setStatus('× 結果が期待と一致しません。下の「期待される結果」と見比べてください。', 'mismatch');
    }
  } catch (e) {
    setStatus(`エラー: ${e.message}`, 'error');
    setResults(null, null);
  }
}

function setStatus(msg, kind) {
  const el = document.getElementById('status');
  el.className = '';
  if (!msg) {
    el.classList.remove('visible');
    el.textContent = '';
    return;
  }
  el.textContent = msg;
  el.classList.add('visible');
  if (kind) el.classList.add(`status-${kind}`);
}

function setResults(userResult, expectedResult) {
  const rDiv = document.getElementById('result');
  const eDiv = document.getElementById('expected');
  if (!userResult) { rDiv.innerHTML = ''; rDiv.classList.add('empty'); }
  else {
    rDiv.classList.remove('empty');
    rDiv.innerHTML = `<h3>あなたの結果 (${userResult.values.length} 行)</h3>${renderTable(userResult)}`;
  }
  if (!expectedResult) { eDiv.innerHTML = ''; eDiv.classList.add('empty'); }
  else {
    eDiv.classList.remove('empty');
    eDiv.innerHTML = `<h3>期待される結果 (${expectedResult.values.length} 行)</h3>${renderTable(expectedResult)}`;
  }
}

function compareResults(a, b, ordered) {
  if (a.values.length !== b.values.length) return false;
  if (a.values.length === 0) return true;
  if (a.columns.length !== b.columns.length) return false;

  const aSer = a.values.map(r => JSON.stringify(r.map(normalize)));
  const bSer = b.values.map(r => JSON.stringify(r.map(normalize)));

  if (!ordered) {
    aSer.sort();
    bSer.sort();
  }
  for (let i = 0; i < aSer.length; i++) {
    if (aSer[i] !== bSer[i]) return false;
  }
  return true;
}

function normalize(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && !Number.isInteger(v)) {
    return Math.round(v * 1e6) / 1e6;
  }
  return v;
}

// ===== UI handlers =====
function showAnswer() {
  const p = problems.find(x => x.id === currentProblemId);
  if (!p) return;
  document.getElementById('editor').value = p.expected.trim();
}

function resetEditor() {
  document.getElementById('editor').value = '';
  if (currentProblemId) localStorage.removeItem(editorKey(currentProblemId));
}

function toggleHints() {
  const hintsDiv = document.getElementById('hints');
  const hintBtn = document.getElementById('hint-btn');
  if (hintsDiv.classList.contains('visible')) {
    hintsDiv.classList.remove('visible');
    hintBtn.textContent = '💡 ヒントを見る';
  } else {
    hintsDiv.classList.add('visible');
    hintBtn.textContent = '💡 ヒントを隠す';
  }
}

function showCheatsheet() {
  document.getElementById('problem-view').style.display = 'none';
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('home-btn').classList.remove('active');
  const c = document.getElementById('cheatsheet');
  c.style.display = 'block';
  c.innerHTML = renderCheatsheet();
  currentProblemId = null;
  renderSidebar();
  document.getElementById('main').scrollTop = 0;
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    document.getElementById('loading').style.display = 'none';
    showHome();

    document.getElementById('run-btn').onclick = runQuery;
    document.getElementById('answer-btn').onclick = showAnswer;
    document.getElementById('reset-btn').onclick = resetEditor;
    document.getElementById('show-cheatsheet').onclick = showCheatsheet;
    document.getElementById('home-btn').onclick = showHome;
    document.getElementById('hint-btn').onclick = toggleHints;

    const editor = document.getElementById('editor');
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.slice(0, start) + '  ' + editor.value.slice(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runQuery();
      }
    });
  } catch (e) {
    document.getElementById('loading').innerHTML =
      `<p style="color:#f38ba8">初期化エラー: ${escapeHtml(e.message)}</p>
       <p style="font-size:12px;margin-top:8px">start.bat 経由でローカルサーバから開く必要があります</p>`;
    console.error(e);
  }
});
