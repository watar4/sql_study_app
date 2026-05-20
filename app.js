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

// ===== SQLite 固有構文の検出 (BigQuery では使えない) =====
function stripStrings(sql) {
  return sql.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');
}

function detectSQLiteOnly(sql) {
  const cleaned = stripStrings(sql);
  const checks = [
    { pattern: /\bstrftime\s*\(/i, name: 'strftime()',
      bq: "BigQuery では <code>FORMAT_DATE('%Y-%m', col)</code>、<code>EXTRACT(MONTH FROM col)</code>、<code>DATE_TRUNC(col, MONTH)</code> など" },
    { pattern: /\bGROUP_CONCAT\s*\(/i, name: 'GROUP_CONCAT()',
      bq: "BigQuery では文字列連結なら <code>STRING_AGG(col, ',')</code>、配列なら <code>ARRAY_AGG(col)</code>" },
    { pattern: /\bjulianday\s*\(/i, name: 'julianday()',
      bq: "BigQuery では日数差は <code>DATE_DIFF(d1, d2, DAY)</code>" },
    { pattern: /\bjson_each\s*\(/i, name: 'json_each()',
      bq: "BigQuery では <code>UNNEST(array_col)</code> または <code>UNNEST(JSON_EXTRACT_ARRAY(json_text))</code>" },
    { pattern: /\bCAST\s*\([^)]+?\bAS\s+TEXT\s*\)/i, name: 'CAST(... AS TEXT)',
      bq: "BigQuery では <code>CAST(... AS STRING)</code>" },
    { pattern: /\bCAST\s*\([^)]+?\bAS\s+REAL\s*\)/i, name: 'CAST(... AS REAL)',
      bq: "BigQuery では <code>CAST(... AS FLOAT64)</code>" },
    { pattern: /\bdate\s*\(\s*[^,)]+\s*,\s*'[+-]?\d+\s+(day|month|year)/i, name: "date(col, '+N day')",
      bq: "BigQuery では <code>DATE_ADD(col, INTERVAL N DAY)</code>" },
  ];
  for (const c of checks) {
    if (c.pattern.test(cleaned)) return c;
  }
  return null;
}

// ===== QUALIFY 翻訳 (BQ → SQLite サブクエリ展開) =====
function splitTopLevel(s, delim) {
  const result = [];
  let depth = 0;
  let cur = '';
  let inQ = null;
  for (const ch of s) {
    if (inQ) { cur += ch; if (ch === inQ) inQ = null; continue; }
    if (ch === "'" || ch === '"') { inQ = ch; cur += ch; continue; }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === delim && depth === 0) { result.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) result.push(cur.trim());
  return result;
}

function findOuterKeyword(s, keyword) {
  const re = new RegExp(`\\b${keyword.replace(/\s+/, '\\s+')}\\b`, 'i');
  let depth = 0;
  let inQ = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQ) { if (ch === inQ) inQ = null; continue; }
    if (ch === "'" || ch === '"') { inQ = ch; continue; }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0 && re.test(s.slice(i, i + keyword.length + 4))) {
      const slice = s.slice(i);
      const m = slice.match(re);
      if (m && m.index === 0) return i;
    }
  }
  return -1;
}

function findLastOuterKeyword(s, keyword, startIdx, endIdx) {
  let depth = 0;
  let inQ = null;
  let lastFound = -1;
  const upperKw = keyword.toUpperCase();
  for (let i = startIdx; i < endIdx; i++) {
    const ch = s[i];
    if (inQ) { if (ch === inQ) inQ = null; continue; }
    if (ch === "'" || ch === '"') { inQ = ch; continue; }
    if (ch === '(') { depth++; continue; }
    if (ch === ')') { depth--; continue; }
    if (depth !== 0) continue;
    const slice = s.slice(i, i + keyword.length).toUpperCase();
    if (slice === upperKw) {
      const before = i > 0 ? s[i - 1] : ' ';
      const after = s[i + keyword.length] || ' ';
      if (/[^A-Za-z0-9_]/.test(before) && /[^A-Za-z0-9_]/.test(after)) {
        lastFound = i;
      }
    }
  }
  return lastFound;
}

function translateUnnest(sql) {
  // Pattern: UNNEST(JSON_EXTRACT_ARRAY(<col>)) AS <alias>
  const re = /UNNEST\s*\(\s*JSON_EXTRACT_ARRAY\s*\(([^()]+)\)\s*\)\s+AS\s+(\w+)/i;
  const m = sql.match(re);
  if (!m) return sql;
  const col = m[1].trim();
  const alias = m[2];
  const aliasJe = `${alias}__je`;
  let r = sql.replace(re, `json_each(${col}) AS ${aliasJe}`);
  // UNNEST 句を書き換えた後は元の "AS <alias>" は消えているので、
  // 残る <alias> 単独参照を <alias>__je.value に置換
  const refRe = new RegExp(`(?<!\\.)\\b${alias}\\b(?!__je)`, 'g');
  r = r.replace(refRe, `${aliasJe}.value`);
  return r;
}

function translateQualify(sql) {
  const qualifyIdx = findOuterKeyword(sql, 'QUALIFY');
  if (qualifyIdx < 0) return sql;

  const beforeQualify = sql.slice(0, qualifyIdx).trim();
  let afterQualify = sql.slice(qualifyIdx).replace(/^QUALIFY\s+/i, '');

  // 外側 ORDER BY を切り出し
  const orderByIdx = findOuterKeyword(afterQualify, 'ORDER BY');
  let orderBy = '';
  let qualifyExpr = afterQualify;
  if (orderByIdx >= 0) {
    orderBy = ' ' + afterQualify.slice(orderByIdx).trim();
    qualifyExpr = afterQualify.slice(0, orderByIdx).trim();
  }

  const opMatch = qualifyExpr.match(/^([\s\S]+?)\s*(<=|>=|<>|!=|=|<|>)\s*([\s\S]+)$/);
  if (!opMatch) return sql;
  const windowExpr = opMatch[1].trim();
  const op = opMatch[2];
  const val = opMatch[3].trim();

  const fromIdx = findOuterKeyword(beforeQualify, 'FROM');
  if (fromIdx < 0) return sql;
  // WITH 句がある場合に備え、外側 FROM の直前にある SELECT を探す
  const selectIdx = findLastOuterKeyword(beforeQualify, 'SELECT', 0, fromIdx);
  if (selectIdx < 0) return sql;

  const prefixPart = beforeQualify.slice(0, selectIdx).trim();
  const selectPart = beforeQualify.slice(selectIdx, fromIdx).trim();
  const restPart = beforeQualify.slice(fromIdx).trim();

  const selectColsRaw = selectPart.replace(/^SELECT\s+/i, '').trim();
  const cols = splitTopLevel(selectColsRaw, ',');
  const outputNames = cols.map(c => {
    const asMatch = c.match(/\s+AS\s+`?(\w+)`?\s*$/i);
    if (asMatch) return asMatch[1];
    const tail = c.trim().match(/(\w+)$/);
    return tail ? tail[1] : c.trim();
  });

  const innerQuery = `${prefixPart ? prefixPart + ' ' : ''}SELECT ${selectColsRaw}, ${windowExpr} AS _qf_ ${restPart}`;
  return `SELECT ${outputNames.join(', ')} FROM (${innerQuery}) WHERE _qf_ ${op} ${val}${orderBy}`;
}

// ===== BigQuery → SQLite 翻訳レイヤー =====
// よくある BQ 固有関数を SQLite 等価に書き換える。
// マッチしないパターンは素通り (SQLite 構文ならそのまま動く)
function translateBQtoSQLite(sql) {
  let r = sql;

  // CURRENT_TIMESTAMP() → CURRENT_TIMESTAMP (SQLite はかっこ不可)
  r = r.replace(/\bCURRENT_TIMESTAMP\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP');
  r = r.replace(/\bCURRENT_DATE\s*\(\s*\)/gi, 'CURRENT_DATE');

  // DATE 'YYYY-MM-DD' / TIMESTAMP 'YYYY-MM-DD ...' リテラル → 単純文字列
  r = r.replace(/\bDATE\s+'(\d{4}-\d{2}-\d{2})'/gi, "'$1'");
  r = r.replace(/\bTIMESTAMP\s+'([^']+)'/gi, "'$1'");
  r = r.replace(/\bDATETIME\s+'([^']+)'/gi, "'$1'");

  // SAFE_CAST → CAST、SAFE.FUNC( → FUNC(
  r = r.replace(/\bSAFE_CAST\b/gi, 'CAST');
  r = r.replace(/\bSAFE\.([A-Z_]+)\s*\(/gi, '$1(');

  // 型名: INT64 / STRING / FLOAT64 / BOOL → SQLite 型
  r = r.replace(/\bAS\s+INT64\b/gi, 'AS INTEGER');
  r = r.replace(/\bAS\s+STRING\b/gi, 'AS TEXT');
  r = r.replace(/\bAS\s+FLOAT64\b/gi, 'AS REAL');
  r = r.replace(/\bAS\s+BOOL\b/gi, 'AS INTEGER');
  r = r.replace(/\bAS\s+NUMERIC\b/gi, 'AS REAL');

  // FORMAT_DATE('%Y-%m', col) → strftime('%Y-%m', col)
  r = r.replace(/\bFORMAT_(?:DATE|TIMESTAMP|DATETIME)\s*\(\s*('[^']+')\s*,\s*([^)]+)\)/gi, 'strftime($1, $2)');

  // DATE_TRUNC(col, MONTH/YEAR/DAY/WEEK)
  r = r.replace(/\bDATE_TRUNC\s*\(([^,]+),\s*MONTH\s*\)/gi, "strftime('%Y-%m-01', $1)");
  r = r.replace(/\bDATE_TRUNC\s*\(([^,]+),\s*YEAR\s*\)/gi, "strftime('%Y-01-01', $1)");
  r = r.replace(/\bDATE_TRUNC\s*\(([^,]+),\s*DAY\s*\)/gi, 'date($1)');
  r = r.replace(/\bDATE_TRUNC\s*\(([^,]+),\s*WEEK\s*\)/gi, "date($1, 'weekday 0', '-6 days')");

  // EXTRACT(MONTH/YEAR/DAY FROM col) は SQLite でも EXTRACT 動かない → strftime に
  r = r.replace(/\bEXTRACT\s*\(\s*YEAR\s+FROM\s+([^)]+)\)/gi, "CAST(strftime('%Y', $1) AS INTEGER)");
  r = r.replace(/\bEXTRACT\s*\(\s*MONTH\s+FROM\s+([^)]+)\)/gi, "CAST(strftime('%m', $1) AS INTEGER)");
  r = r.replace(/\bEXTRACT\s*\(\s*DAY\s+FROM\s+([^)]+)\)/gi, "CAST(strftime('%d', $1) AS INTEGER)");
  // EXTRACT(DAYOFWEEK FROM col): BQ は日=1〜土=7、SQLite strftime('%w') は日=0〜土=6
  r = r.replace(/\bEXTRACT\s*\(\s*DAYOFWEEK\s+FROM\s+([^)]+)\)/gi, "(CAST(strftime('%w', $1) AS INTEGER) + 1)");
  // ISOWEEK や ISO 関連はスキップ

  // DATE_DIFF(d1, d2, DAY) → 日数差
  r = r.replace(/\bDATE_DIFF\s*\(([^,]+),([^,]+),\s*DAY\s*\)/gi, 'CAST((julianday($1) - julianday($2)) AS INTEGER)');

  // DATE_ADD / DATE_SUB
  r = r.replace(/\bDATE_ADD\s*\(([^,]+),\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "date($1, '+$2 day')");
  r = r.replace(/\bDATE_SUB\s*\(([^,]+),\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "date($1, '-$2 day')");
  r = r.replace(/\bDATE_ADD\s*\(([^,]+),\s*INTERVAL\s+(\d+)\s+MONTH\s*\)/gi, "date($1, '+$2 month')");
  r = r.replace(/\bDATE_SUB\s*\(([^,]+),\s*INTERVAL\s+(\d+)\s+MONTH\s*\)/gi, "date($1, '-$2 month')");

  // REGEXP_CONTAINS(col, 'pat') → col LIKE '%pat%' (リテラル文字列に限る簡易対応)
  r = r.replace(/\bREGEXP_CONTAINS\s*\(\s*([^,]+),\s*'([^']+)'\s*\)/gi, "$1 LIKE '%$2%'");
  r = r.replace(/\bCONTAINS_SUBSTR\s*\(\s*([^,]+),\s*'([^']+)'\s*\)/gi, "$1 LIKE '%$2%'");

  // ARRAY_AGG(col ORDER BY x) → GROUP_CONCAT(col, ',' ORDER BY x)
  r = r.replace(/\bARRAY_AGG\s*\(\s*(\w+)\s+ORDER\s+BY\s+([^)]+)\)/gi, "GROUP_CONCAT($1, ',' ORDER BY $2)");
  r = r.replace(/\bARRAY_AGG\s*\(\s*(DISTINCT\s+\w+)\s*\)/gi, "GROUP_CONCAT($1, ',')");
  r = r.replace(/\bARRAY_AGG\s*\(\s*(\w+)\s*\)/gi, "GROUP_CONCAT($1, ',')");

  // STRING_AGG(col, sep) → GROUP_CONCAT(col, sep)
  r = r.replace(/\bSTRING_AGG\s*\(/gi, 'GROUP_CONCAT(');

  // COUNTIF(cond) → SUM(CASE WHEN cond THEN 1 ELSE 0 END)
  r = r.replace(/\bCOUNTIF\s*\(([^)]+)\)/gi, 'SUM(CASE WHEN $1 THEN 1 ELSE 0 END)');

  // IF(cond, a, b) → CASE WHEN cond THEN a ELSE b END (簡易: ネストなし、カンマで3要素)
  // 注意: 三引数の関数すべてに反応してしまうリスクあり。"IF(" だけにマッチさせる
  r = r.replace(/\bIF\s*\(([^,()]+|\([^)]*\))\s*,\s*([^,()]+|\([^)]*\))\s*,\s*([^,()]+|\([^)]*\))\)/gi,
                '(CASE WHEN $1 THEN $2 ELSE $3 END)');

  // EXCEPT DISTINCT / UNION DISTINCT / INTERSECT DISTINCT → SQLite はキーワード無し
  r = r.replace(/\bEXCEPT\s+DISTINCT\b/gi, 'EXCEPT');
  r = r.replace(/\bUNION\s+DISTINCT\b/gi, 'UNION');
  r = r.replace(/\bINTERSECT\s+DISTINCT\b/gi, 'INTERSECT');

  // UNNEST(JSON_EXTRACT_ARRAY(col)) AS alias → json_each(col) AS alias__je
  // SELECT/ORDER BY 中の bare alias を alias__je.value に書き換え
  r = translateUnnest(r);

  // QUALIFY → サブクエリ展開
  r = translateQualify(r);

  // IFNULL は SQLite でも動く、変換不要

  return r;
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

  // SQLite 固有構文の検出 (bqOnly 問題はスキップ)
  if (!p.bqOnly) {
    const sqliteOnly = detectSQLiteOnly(sql);
    if (sqliteOnly) {
      setStatus(
        `❌ SQLite では正しいが BigQuery では使えない構文です\n\n` +
        `検出: ${sqliteOnly.name}\n` +
        `→ ${sqliteOnly.bq.replace(/<\/?code>/g, '`')}`,
        'error'
      );
      showTranslationNotice(null);
      setResults(null, null);
      return;
    }
  }

  // BigQuery 構文を SQLite 等価に翻訳
  const translatedSql = translateBQtoSQLite(sql);
  const wasTranslated = translatedSql.replace(/\s+/g, ' ').trim() !== sql.replace(/\s+/g, ' ').trim();
  showTranslationNotice(wasTranslated ? translatedSql : null);

  setStatus('実行中...', null);

  try {
    resetDB();
    execSetup(p.setup);
    const userResult = execQuery(translatedSql);

    resetDB();
    execSetup(p.setup);
    const expectedSql = p.execExpected || translateBQtoSQLite(p.expected);
    const expectedResult = execQuery(expectedSql);

    setResults(userResult, expectedResult);

    if (compareResults(userResult, expectedResult, p.ordered === true)) {
      setStatus('✓ 正解です!', 'success');
      markSolved(p.id);
    } else {
      setStatus('× 結果が期待と一致しません。下の「期待される結果」と見比べてください。', 'mismatch');
    }
  } catch (e) {
    let msg = `エラー: ${e.message}`;
    if (/QUALIFY/i.test(sql)) {
      msg += `\n\n💡 ヒント: QUALIFY は SQLite では未対応です。サブクエリで書き換えてみてください。`;
    } else if (/\bUNNEST\b/i.test(sql)) {
      msg += `\n\n💡 ヒント: UNNEST は SQLite では未対応です。配列の代わりに json_each(json_列) を使ってください。`;
    }
    setStatus(msg, 'error');
    setResults(null, null);
  }
}

function showTranslationNotice(translatedSql) {
  const div = document.getElementById('translation-notice');
  if (!div) return;
  if (!translatedSql) {
    div.style.display = 'none';
    div.innerHTML = '';
    return;
  }
  div.style.display = 'block';
  div.innerHTML = `
    <div class="notice-header">📝 BigQuery 構文を SQLite 構文に自動変換しました (実際に実行された SQL ↓)</div>
    <pre>${escapeHtml(translatedSql)}</pre>
  `;
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
