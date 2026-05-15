export function renderCheatsheet() {
  return `
<h2>📘 BigQuery vs SQLite (アプリ内エンジン) 対応表</h2>
<p style="color:#a6adc8;font-size:13px;line-height:1.7">
このアプリは起動を高速化するため <b>SQL.js (SQLite WASM)</b> で SQL を実行しています。<br>
学習目的は <b>BigQuery 文法を覚えること</b> なので、両者の違いを以下にまとめました。<br>
各問題画面の「📘 BigQuery の書き方」も合わせて参照してください。
</p>

<h3>📅 日付関数</h3>
<table>
<tr><th>用途</th><th>BigQuery</th><th>SQLite (このアプリ)</th></tr>
<tr><td>月初に丸め</td><td><code>DATE_TRUNC(d, MONTH)</code></td><td><code>date(d, 'start of month')</code></td></tr>
<tr><td>月の文字列化 (YYYY-MM)</td><td><code>FORMAT_DATE('%Y-%m', d)</code></td><td><code>strftime('%Y-%m', d)</code></td></tr>
<tr><td>日付差(日数)</td><td><code>DATE_DIFF(d1, d2, DAY)</code></td><td><code>julianday(d1) - julianday(d2)</code></td></tr>
<tr><td>日付加算</td><td><code>DATE_ADD(d, INTERVAL 7 DAY)</code></td><td><code>date(d, '+7 day')</code></td></tr>
<tr><td>曜日抽出</td><td><code>EXTRACT(DAYOFWEEK FROM d)</code> (日=1)</td><td><code>strftime('%w', d)</code> (日=0)</td></tr>
<tr><td>現在時刻</td><td><code>CURRENT_TIMESTAMP()</code></td><td><code>CURRENT_TIMESTAMP</code></td></tr>
<tr><td>年・月・日</td><td><code>EXTRACT(YEAR FROM d)</code></td><td><code>strftime('%Y', d)</code></td></tr>
</table>

<h3>🔤 文字列関数</h3>
<table>
<tr><th>用途</th><th>BigQuery</th><th>SQLite</th></tr>
<tr><td>正規表現マッチ判定</td><td><code>REGEXP_CONTAINS(s, r)</code></td><td>標準では非対応 → <code>LIKE '%梅%'</code> で代用</td></tr>
<tr><td>正規表現抽出</td><td><code>REGEXP_EXTRACT(s, r)</code></td><td>非対応</td></tr>
<tr><td>部分一致</td><td><code>s LIKE '%abc%'</code></td><td>同じ</td></tr>
<tr><td>分割</td><td><code>SPLIT(s, ',')</code></td><td>非対応 (json トリックで代用可)</td></tr>
<tr><td>連結</td><td><code>CONCAT(a, b)</code> / <code>a || b</code></td><td><code>a || b</code></td></tr>
<tr><td>NULL を空文字に</td><td><code>IFNULL(s, '')</code> / <code>COALESCE</code></td><td><code>COALESCE(s, '')</code></td></tr>
<tr><td>長さ</td><td><code>LENGTH(s)</code> / <code>CHAR_LENGTH</code></td><td><code>length(s)</code></td></tr>
</table>

<h3>🔢 型変換</h3>
<table>
<tr><th>用途</th><th>BigQuery</th><th>SQLite</th></tr>
<tr><td>整数キャスト</td><td><code>CAST(x AS INT64)</code></td><td><code>CAST(x AS INTEGER)</code></td></tr>
<tr><td>失敗時 NULL</td><td><code>SAFE_CAST(x AS INT64)</code></td><td>同等機能なし</td></tr>
<tr><td>文字列化</td><td><code>CAST(x AS STRING)</code></td><td><code>CAST(x AS TEXT)</code></td></tr>
<tr><td>浮動小数化</td><td><code>CAST(x AS FLOAT64)</code></td><td><code>CAST(x AS REAL)</code></td></tr>
</table>

<h3>📊 集約・ウィンドウ関数</h3>
<table>
<tr><th>用途</th><th>BigQuery</th><th>SQLite</th></tr>
<tr><td>配列集約</td><td><code>ARRAY_AGG(x ORDER BY y)</code></td><td>配列型がないので非対応 → <code>GROUP_CONCAT</code> で文字列に</td></tr>
<tr><td>文字列集約</td><td><code>STRING_AGG(x, ',')</code></td><td><code>GROUP_CONCAT(x, ',')</code></td></tr>
<tr><td>ROW_NUMBER 等</td><td><code>ROW_NUMBER() OVER(...)</code></td><td>同じ</td></tr>
<tr><td>ウィンドウのフィルタ</td><td><code>QUALIFY ROW_NUMBER() OVER(...) = 1</code></td><td>非対応 → サブクエリで <code>WHERE rn = 1</code></td></tr>
<tr><td>近似カウント</td><td><code>APPROX_COUNT_DISTINCT(x)</code></td><td>非対応</td></tr>
</table>

<h3>🗂 配列・STRUCT (BQ 学習で重要)</h3>
<table>
<tr><th>用途</th><th>BigQuery</th><th>SQLite</th></tr>
<tr><td>配列展開</td><td><code>FROM t, UNNEST(arr) AS x</code></td><td><code>FROM t, json_each(t.arr) AS j</code> (JSON 配列)</td></tr>
<tr><td>配列リテラル</td><td><code>[1, 2, 3]</code></td><td>非対応 (JSON 文字列で表現)</td></tr>
<tr><td>構造体リテラル</td><td><code>STRUCT(1 AS id, 'a' AS name)</code></td><td>非対応</td></tr>
<tr><td>配列の長さ</td><td><code>ARRAY_LENGTH(arr)</code></td><td>JSON: <code>json_array_length(arr)</code></td></tr>
<tr><td>配列内検索</td><td><code>x IN UNNEST(arr)</code></td><td>JSON: <code>EXISTS(SELECT 1 FROM json_each(arr) WHERE value = x)</code></td></tr>
</table>

<h3>💰 BigQuery 固有のお作法</h3>
<table>
<tr><th>項目</th><th>説明</th></tr>
<tr><td><code>SELECT *</code></td><td>スキャン量増 → 課金大。<code>SELECT * EXCEPT(col)</code> で除外列を指定可</td></tr>
<tr><td>パーティション</td><td>日付列でパーティション分割すると <code>WHERE date BETWEEN ...</code> でスキャン量激減</td></tr>
<tr><td>クラスタリング</td><td>頻繁にフィルタする列に設定でさらにコスト削減</td></tr>
<tr><td><code>WITH</code> 句</td><td>BigQuery の CTE は <b>マテリアライズされない</b>。同じ CTE を何度参照しても再評価。重い処理は一時テーブルへ</td></tr>
<tr><td><code>_PARTITIONTIME</code></td><td>分割テーブルの疑似列。フィルタすると効率UP</td></tr>
<tr><td>料金最適化</td><td>クエリ画面の「このクエリを実行すると○MB が処理されます」を必ず見るクセを</td></tr>
<tr><td><code>SAFE.</code> プレフィックス</td><td><code>SAFE.PARSE_DATE(...)</code> など、エラーの代わりに NULL を返す</td></tr>
</table>
`;
}
