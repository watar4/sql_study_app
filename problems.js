// ============================================================
// 共通テーブル定義 (SQLite 互換)
// ============================================================
const STATIONS = `
CREATE TABLE stations (
  station_id INTEGER,
  name TEXT,
  line TEXT,
  prefecture TEXT
);
INSERT INTO stations VALUES
  (1, '大阪', 'JR京都線', '大阪府'),
  (2, '新大阪', 'JR京都線', '大阪府'),
  (3, '京都', 'JR京都線', '京都府'),
  (4, '神戸', 'JR神戸線', '兵庫県'),
  (5, '三ノ宮', 'JR神戸線', '兵庫県'),
  (6, '梅田', '阪急神戸線', '大阪府'),
  (7, '十三', '阪急神戸線', '大阪府'),
  (8, '宝塚', '阪急宝塚線', '兵庫県'),
  (9, '京橋', 'JR大阪環状線', '大阪府'),
  (10, '天王寺', 'JR大阪環状線', '大阪府');
`;

const PASSENGERS = `
CREATE TABLE passengers (
  passenger_id INTEGER,
  name TEXT,
  age INTEGER,
  gender TEXT,
  prefecture TEXT,
  registered_at TEXT
);
INSERT INTO passengers VALUES
  (1, '田中太郎', 32, 'M', '大阪府', '2023-04-01'),
  (2, '佐藤花子', 28, 'F', '兵庫県', '2023-07-15'),
  (3, '鈴木一郎', 45, 'M', '京都府', '2024-01-10'),
  (4, '山田美咲', 22, 'F', '大阪府', '2024-03-20'),
  (5, '高橋健', 60, 'M', '大阪府', '2022-11-05'),
  (6, '伊藤里香', 35, 'F', '兵庫県', '2024-06-01'),
  (7, '渡辺翔', 19, 'M', '京都府', '2025-01-12'),
  (8, '中村優子', 50, 'F', '大阪府', '2023-09-08'),
  (9, '小林剛', 41, 'M', '滋賀県', '2024-11-22'),
  (10, '加藤さくら', 26, 'F', '奈良県', '2025-02-14');
`;

const RIDES = `
CREATE TABLE rides (
  ride_id INTEGER,
  passenger_id INTEGER,
  from_station_id INTEGER,
  to_station_id INTEGER,
  ride_date TEXT,
  fare INTEGER
);
INSERT INTO rides VALUES
  (1, 1, 1, 3, '2025-01-15', 580),
  (2, 1, 3, 1, '2025-01-15', 580),
  (3, 2, 4, 5, '2025-01-16', 170),
  (4, 3, 3, 1, '2025-01-16', 580),
  (5, 1, 1, 2, '2025-02-01', 170),
  (6, 4, 6, 7, '2025-02-03', 160),
  (7, 5, 9, 10, '2025-02-05', 160),
  (8, 6, 4, 1, '2025-02-10', 410),
  (9, 2, 5, 4, '2025-02-15', 170),
  (10, 7, 6, 8, '2025-02-20', 280),
  (11, 1, 2, 1, '2025-03-01', 170),
  (12, 8, 10, 9, '2025-03-05', 160),
  (13, 3, 1, 3, '2025-03-10', 580),
  (14, 4, 7, 6, '2025-03-15', 160),
  (15, 1, 1, 10, '2025-03-20', 200),
  (16, 9, 1, 4, '2025-03-22', 410),
  (17, 6, 1, 3, '2025-04-01', 580),
  (18, 2, 4, 1, '2025-04-05', 410),
  (19, 5, 9, 1, '2025-04-10', 170),
  (20, 8, 10, 1, '2025-04-12', 200);
`;

const PRODUCTS = `
CREATE TABLE products (
  product_id INTEGER,
  name TEXT,
  category TEXT,
  price INTEGER
);
INSERT INTO products VALUES
  (1, '駅弁・幕の内', '弁当', 1200),
  (2, '駅弁・牛肉', '弁当', 1500),
  (3, '緑茶ペットボトル', '飲料', 160),
  (4, 'コーヒー缶', '飲料', 130),
  (5, 'チョコ菓子', '菓子', 280),
  (6, 'おにぎり梅', '弁当', 180),
  (7, 'おにぎり鮭', '弁当', 200),
  (8, 'ビール', '飲料', 320);
`;

const SALES = `
CREATE TABLE sales (
  sale_id INTEGER,
  product_id INTEGER,
  sold_at TEXT,
  quantity INTEGER,
  store_id INTEGER
);
INSERT INTO sales VALUES
  (1, 1, '2025-01-10', 2, 1),
  (2, 3, '2025-01-10', 5, 1),
  (3, 6, '2025-01-11', 8, 2),
  (4, 2, '2025-01-15', 1, 1),
  (5, 4, '2025-02-01', 10, 2),
  (6, 5, '2025-02-05', 3, 1),
  (7, 1, '2025-02-10', 4, 2),
  (8, 7, '2025-02-15', 6, 1),
  (9, 8, '2025-03-01', 2, 1),
  (10, 3, '2025-03-05', 7, 2),
  (11, 6, '2025-03-10', 9, 1),
  (12, 1, '2025-03-15', 3, 2),
  (13, 2, '2025-04-01', 2, 1),
  (14, 4, '2025-04-05', 5, 2);
`;

const USER_TAGS = `
CREATE TABLE user_tags (
  user_id INTEGER,
  tags TEXT
);
INSERT INTO user_tags VALUES
  (1, '["通勤","JR利用"]'),
  (2, '["観光","関西在住"]'),
  (3, '["通勤","阪急利用","IC利用"]');
`;

const SURVEY = `
CREATE TABLE survey_responses (
  response_id INTEGER,
  passenger_id INTEGER,
  satisfaction INTEGER,
  comment TEXT
);
INSERT INTO survey_responses VALUES
  (1, 1, 5, '快適でした'),
  (2, 2, NULL, NULL),
  (3, 3, 3, NULL),
  (4, 4, 4, '時間が短くて良い'),
  (5, 5, NULL, NULL),
  (6, 6, 5, '車内案内が親切'),
  (7, 7, 2, '遅延が多い'),
  (8, 8, NULL, '...'),
  (9, 1, 4, NULL),
  (10, 3, NULL, NULL);
`;

const QUARTERLY = `
CREATE TABLE quarterly_sales (
  region TEXT,
  q1 INTEGER,
  q2 INTEGER,
  q3 INTEGER,
  q4 INTEGER
);
INSERT INTO quarterly_sales VALUES
  ('大阪', 1200, 1450, 1380, 1620),
  ('京都', 980, 1050, 1120, 1250),
  ('兵庫', 1100, 1230, 1190, 1350);
`;

// ============================================================
// 章メタデータ (TOP 画面で表示)
// ============================================================
export const chapters = [
  {
    name: '基礎',
    description: 'SELECT / WHERE / ORDER BY / LIMIT。必要な行と列だけ取り出す SQL の土台。',
    skills: ['列の指定', '条件で絞り込む (WHERE)', '並び替え (ORDER BY)', '件数制限 (LIMIT)', 'AND/OR の組み合わせ']
  },
  {
    name: '集約',
    description: 'データを束ねる。COUNT・SUM・AVG とグルーピングで集計表を作る。',
    skills: ['GROUP BY', 'COUNT / SUM / AVG', 'HAVING で集約後フィルタ', 'ROUND / CAST で整える']
  },
  {
    name: '結合',
    description: '複数テーブルを繋ぐ。INNER / LEFT JOIN の使い分けが分析の幅を決める。',
    skills: ['INNER JOIN', '同テーブルの多重 JOIN', 'LEFT JOIN で欠損を残す', 'NULL 混在時の COUNT 注意']
  },
  {
    name: 'サブクエリ・CTE',
    description: 'クエリを部品化する。サブクエリと WITH 句で複雑な処理を読みやすく。',
    skills: ['スカラーサブクエリ', 'WITH (CTE) で多段集計', '集計値との比較']
  },
  {
    name: '条件分岐',
    description: 'CASE WHEN で値の変換・カテゴリ化を行う。レポート集計の必修スキル。',
    skills: ['CASE WHEN ... THEN ... END', '値のラベリング', 'CASE の結果で GROUP BY']
  },
  {
    name: 'NULL処理',
    description: 'NULL の落とし穴を避け、補完・集計を正しく扱う。',
    skills: ['COALESCE / IFNULL', 'COUNT(*) と COUNT(列) の違い', 'NULL を含む AVG 挙動']
  },
  {
    name: '重複・順位',
    description: '重複を制御し、順位を付ける。3つのランク関数を使い分ける。',
    skills: ['DISTINCT', 'ROW_NUMBER / RANK / DENSE_RANK の違い', 'ORDER BY DESC でランキング']
  },
  {
    name: '集合演算',
    description: 'テーブル同士の集合操作。和・差で新しい視点を作る。',
    skills: ['UNION / UNION ALL', 'EXCEPT で差分', '列構造を揃えるルール']
  },
  {
    name: 'ウィンドウ関数',
    description: '行を消さずに行間の計算をする。BigQuery で最も差がつく領域。',
    skills: ['OVER (PARTITION BY ... ORDER BY ...)', 'ROW_NUMBER', 'LAG / LEAD で前後行', '累計 SUM', 'QUALIFY (BQ)']
  },
  {
    name: '応用ウィンドウ',
    description: '分位・先頭/末尾値・フレーム指定。分析の表現力を一段上げる。',
    skills: ['NTILE で分位', 'FIRST_VALUE / LAST_VALUE', 'ROWS BETWEEN フレーム指定']
  },
  {
    name: 'ピボット',
    description: '縦持ち↔横持ちの変換でレポート向けに整形する。',
    skills: ['CASE WHEN ピボット', 'UNION ALL アンピボット', 'BQ の PIVOT / UNPIVOT 構文']
  },
  {
    name: '日付・文字列',
    description: '日付の切り出し・部分一致など、加工系の関数を覚える。',
    skills: ['strftime / FORMAT_DATE', 'LIKE 部分一致', 'BQ の REGEXP_CONTAINS']
  },
  {
    name: '配列・UNNEST',
    description: 'BigQuery 特有のネストデータ。配列を集める/ばらす操作。',
    skills: ['GROUP_CONCAT / ARRAY_AGG', 'json_each / UNNEST', 'CROSS JOIN UNNEST パターン']
  },
  {
    name: '実践応用',
    description: '複数の概念を組み合わせる総合演習。業務でよく出るパターン。',
    skills: ['前月比成長率 (LAG)', 'コホート分析', 'CTE の段階的積み上げ']
  }
];

// ============================================================
// 問題定義
// ============================================================
export const problems = [
  // ====================================================
  // 基礎
  // ====================================================
  {
    id: 'b01', category: '基礎', difficulty: '★',
    title: '全ての駅を取得',
    description: '<code>stations</code> テーブルから<b>全ての駅情報</b>(全列)を取得してください。',
    tables: ['stations'],
    setup: STATIONS,
    expected: 'SELECT * FROM stations',
    ordered: false,
    hints: ['<code>SELECT * FROM テーブル名</code> で全列・全行を取得'],
    bqNotes: 'BigQuery では <code>SELECT *</code> はスキャン量(=料金)が増えがちです。本番では必要な列のみ指定するか <code>SELECT * EXCEPT(col1)</code> で除外。'
  },
  {
    id: 'b02', category: '基礎', difficulty: '★',
    title: '大阪府の駅だけ抽出',
    description: '<code>stations</code> から <b>prefecture が「大阪府」</b> の駅の <code>name</code> と <code>line</code> を取得してください。',
    tables: ['stations'],
    setup: STATIONS,
    expected: "SELECT name, line FROM stations WHERE prefecture = '大阪府'",
    ordered: false,
    hints: ['列指定は <code>SELECT 列1, 列2</code>', '条件は <code>WHERE 列 = \'値\'</code>'],
    bqNotes: '文字列リテラルは BigQuery でもシングルクォート <code>\'</code> が一般的。'
  },
  {
    id: 'b03', category: '基礎', difficulty: '★',
    title: '運賃の高い順に上位5件',
    description: '<code>rides</code> から運賃が高い順に <b>上位5件</b> を取得してください。列は <code>ride_id, fare</code>。',
    tables: ['rides'],
    setup: RIDES,
    expected: 'SELECT ride_id, fare FROM rides ORDER BY fare DESC LIMIT 5',
    ordered: true,
    hints: ['<code>ORDER BY 列 DESC</code> で降順', '<code>LIMIT N</code> でN件に絞る']
  },
  {
    id: 'b04', category: '基礎', difficulty: '★',
    title: '複数条件 (AND/OR)',
    description: '<code>passengers</code> から <b>大阪府在住</b> かつ <b>30歳以上</b> の人を <code>name, age</code> で取得してください。',
    tables: ['passengers'],
    setup: PASSENGERS,
    expected: "SELECT name, age FROM passengers WHERE prefecture = '大阪府' AND age >= 30",
    ordered: false,
    hints: ['複数条件は <code>AND</code> / <code>OR</code> でつなぐ'],
    bqNotes: 'BigQuery では <code>BETWEEN</code> や <code>IN (\'A\',\'B\')</code> も使えます。可読性を優先しましょう。'
  },

  // ====================================================
  // 集約
  // ====================================================
  {
    id: 'a01', category: '集約', difficulty: '★★',
    title: '都道府県別の乗客数',
    description: '<code>passengers</code> から <b>都道府県ごとの乗客数</b> を集計してください。列名は <code>prefecture, cnt</code>。',
    tables: ['passengers'],
    setup: PASSENGERS,
    expected: 'SELECT prefecture, COUNT(*) AS cnt FROM passengers GROUP BY prefecture',
    ordered: false,
    hints: ['<code>GROUP BY</code> + <code>COUNT(*)</code>', '列名は <code>AS 名前</code>'],
    bqNotes: 'BigQuery は <code>GROUP BY 1, 2</code> のように<b>位置番号</b>でグルーピング可能。'
  },
  {
    id: 'a02', category: '集約', difficulty: '★★',
    title: '乗客ごとの利用回数と合計運賃',
    description: '<code>rides</code> から <b>乗客ごとに</b> 利用回数 (<code>ride_count</code>) と合計運賃 (<code>total_fare</code>) を出してください。<code>passenger_id</code> 昇順で。',
    tables: ['rides'],
    setup: RIDES,
    expected: 'SELECT passenger_id, COUNT(*) AS ride_count, SUM(fare) AS total_fare FROM rides GROUP BY passenger_id ORDER BY passenger_id',
    ordered: true,
    hints: ['<code>COUNT(*)</code>, <code>SUM(fare)</code>', 'GROUP BY 後に ORDER BY']
  },
  {
    id: 'a03', category: '集約', difficulty: '★★',
    title: 'HAVING で絞り込み',
    description: '乗客ごとの利用回数を計算し、<b>3回以上利用した乗客</b> だけを抽出してください。列は <code>passenger_id, ride_count</code>。',
    tables: ['rides'],
    setup: RIDES,
    expected: 'SELECT passenger_id, COUNT(*) AS ride_count FROM rides GROUP BY passenger_id HAVING COUNT(*) >= 3',
    ordered: false,
    hints: ['<b>集約後</b>の絞り込みは <code>WHERE</code> ではなく <code>HAVING</code>'],
    bqNotes: '<code>WHERE</code> は GROUP BY <b>前</b>の行フィルタ、<code>HAVING</code> は <b>後</b>の集約値フィルタ。'
  },
  {
    id: 'a04', category: '集約', difficulty: '★★',
    title: 'カテゴリ別の平均価格',
    description: '<code>products</code> からカテゴリごとの <b>平均価格</b> を出してください。列名は <code>category, avg_price</code>、平均価格は<b>整数(円)</b>に丸めてください。',
    tables: ['products'],
    setup: PRODUCTS,
    expected: 'SELECT category, CAST(ROUND(AVG(price)) AS INTEGER) AS avg_price FROM products GROUP BY category',
    ordered: false,
    hints: ['<code>AVG()</code> は浮動小数', '<code>ROUND()</code> + <code>CAST(... AS INTEGER)</code>'],
    bqNotes: 'BigQuery: <code>CAST(x AS INT64)</code> または <code>SAFE_CAST(x AS INT64)</code>。'
  },

  // ====================================================
  // 結合
  // ====================================================
  {
    id: 'j01', category: '結合', difficulty: '★★',
    title: 'INNER JOIN: 乗車記録 × 駅名',
    description: '<code>rides</code> と <code>stations</code> を結合し、<b>出発駅名と到着駅名</b>を表示してください。列は <code>ride_id, from_name, to_name, fare</code>。<code>ride_id</code> 昇順で。',
    tables: ['rides', 'stations'],
    setup: STATIONS + RIDES,
    expected: `SELECT r.ride_id, sf.name AS from_name, st.name AS to_name, r.fare
FROM rides r
JOIN stations sf ON r.from_station_id = sf.station_id
JOIN stations st ON r.to_station_id = st.station_id
ORDER BY r.ride_id`,
    ordered: true,
    hints: ['同じテーブルを2回JOIN', 'エイリアス (<code>sf</code>, <code>st</code>) で区別']
  },
  {
    id: 'j02', category: '結合', difficulty: '★★',
    title: 'LEFT JOIN: 未利用の乗客も含める',
    description: '<b>全ての乗客</b> について利用回数を集計してください。一度も乗車していない人も <code>ride_count = 0</code> として含める。列は <code>passenger_id, name, ride_count</code>、<code>passenger_id</code> 昇順。',
    tables: ['passengers', 'rides'],
    setup: PASSENGERS + RIDES,
    expected: `SELECT p.passenger_id, p.name, COUNT(r.ride_id) AS ride_count
FROM passengers p
LEFT JOIN rides r ON p.passenger_id = r.passenger_id
GROUP BY p.passenger_id, p.name
ORDER BY p.passenger_id`,
    ordered: true,
    hints: ['<code>LEFT JOIN</code> で左側を残す', '<code>COUNT(*)</code> ではなく <code>COUNT(列)</code>'],
    bqNotes: '<code>COUNT(*)</code> は NULL行も含めてカウント、<code>COUNT(列)</code> は NULL を除く。LEFT JOIN の集計でハマりやすい。'
  },

  // ====================================================
  // サブクエリ・CTE
  // ====================================================
  {
    id: 'c01', category: 'サブクエリ・CTE', difficulty: '★★',
    title: '平均運賃より高い乗車',
    description: '全乗車の <b>平均運賃より高い</b> 乗車レコードを抽出してください。列は <code>ride_id, fare</code>、<code>fare</code> 降順。',
    tables: ['rides'],
    setup: RIDES,
    expected: 'SELECT ride_id, fare FROM rides WHERE fare > (SELECT AVG(fare) FROM rides) ORDER BY fare DESC',
    ordered: true,
    hints: ['<code>WHERE 列 > (SELECT AVG(列) FROM ...)</code>']
  },
  {
    id: 'c02', category: 'サブクエリ・CTE', difficulty: '★★★',
    title: 'WITH 句で月次集計',
    description: '<code>rides</code> から <b>月 (YYYY-MM)</b> ごとの乗車回数と合計運賃を集計してください。<code>WITH 句 (CTE)</code> を使ってください。列は <code>month, ride_count, total_fare</code>、<code>month</code> 昇順。',
    tables: ['rides'],
    setup: RIDES,
    expected: `WITH monthly AS (
  SELECT strftime('%Y-%m', ride_date) AS month, fare
  FROM rides
)
SELECT month, COUNT(*) AS ride_count, SUM(fare) AS total_fare
FROM monthly
GROUP BY month
ORDER BY month`,
    ordered: true,
    hints: ['<code>WITH 名前 AS (SELECT ...)</code>', 'SQLite: <code>strftime(\'%Y-%m\', date)</code>'],
    bqNotes: 'BigQuery: <code>FORMAT_DATE(\'%Y-%m\', d)</code> または <code>DATE_TRUNC(d, MONTH)</code>。'
  },

  // ====================================================
  // 条件分岐 (CASE)
  // ====================================================
  {
    id: 'cs01', category: '条件分岐', difficulty: '★★',
    title: 'CASE で年代カテゴリ付与',
    description: '<code>passengers</code> から、各乗客に <b>年代カテゴリ</b> を付けてください。<br>20歳未満→「10代」, 20代→「20代」, 30代→「30代」, 40代→「40代」, 50歳以上→「50代以上」<br>列は <code>name, age, age_group</code>、<code>age</code> 昇順。',
    tables: ['passengers'],
    setup: PASSENGERS,
    expected: `SELECT name, age,
  CASE
    WHEN age < 20 THEN '10代'
    WHEN age < 30 THEN '20代'
    WHEN age < 40 THEN '30代'
    WHEN age < 50 THEN '40代'
    ELSE '50代以上'
  END AS age_group
FROM passengers
ORDER BY age`,
    ordered: true,
    hints: ['<code>CASE WHEN cond THEN val ... ELSE val END</code>', 'WHEN は上から順に評価される(マッチした時点で確定)'],
    bqNotes: 'BigQuery でも完全に同じ構文。<code>IF(cond, a, b)</code> という関数版もあり、2分岐ならこちらが簡潔。'
  },
  {
    id: 'cs02', category: '条件分岐', difficulty: '★★',
    title: '運賃帯別の件数集計',
    description: '<code>rides</code> を以下の3つの運賃帯に分け、<b>帯別の件数</b> を集計してください。<br>200円以下→「安い」, 201〜400円→「普通」, 401円以上→「高い」<br>列は <code>fare_class, cnt</code>。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT
  CASE
    WHEN fare <= 200 THEN '安い'
    WHEN fare <= 400 THEN '普通'
    ELSE '高い'
  END AS fare_class,
  COUNT(*) AS cnt
FROM rides
GROUP BY fare_class`,
    ordered: false,
    hints: ['<code>GROUP BY</code> で CASE 式の結果でグルーピング', 'SQLite/BQ ともに GROUP BY にエイリアス名が使える'],
    bqNotes: '<code>GROUP BY fare_class</code> のように <b>SELECT のエイリアス名</b> を使えるのが BQ/SQLite の便利な点。Postgres は使えないので注意。'
  },

  // ====================================================
  // NULL 処理
  // ====================================================
  {
    id: 'n01', category: 'NULL処理', difficulty: '★★',
    title: 'COALESCE で NULL を補完',
    description: '<code>survey_responses</code> の <code>satisfaction</code> 列には NULL があります。<b>NULL を「3 (中立)」として扱った平均満足度</b> を計算してください。<br>列名は <code>avg_score</code>、小数2桁まで。',
    tables: ['survey_responses'],
    setup: SURVEY,
    expected: 'SELECT ROUND(AVG(COALESCE(satisfaction, 3)), 2) AS avg_score FROM survey_responses',
    ordered: false,
    hints: ['<code>COALESCE(列, デフォルト値)</code> で NULL のときデフォルトに置換', 'AVG は NULL を無視するため、COALESCE しないと結果が変わる'],
    bqNotes: 'BigQuery でも <code>COALESCE</code> は同じ。2引数なら <code>IFNULL(x, 3)</code> も使えます。'
  },
  {
    id: 'n02', category: 'NULL処理', difficulty: '★★',
    title: 'COUNT(*) と COUNT(列) の違い',
    description: '<code>survey_responses</code> から <b>全行数</b>・<b>satisfaction の回答数 (NULL 除く)</b>・<b>未回答数</b> を1行に出してください。<br>列名: <code>total, rated, missing</code>。',
    tables: ['survey_responses'],
    setup: SURVEY,
    expected: `SELECT
  COUNT(*) AS total,
  COUNT(satisfaction) AS rated,
  COUNT(*) - COUNT(satisfaction) AS missing
FROM survey_responses`,
    ordered: false,
    hints: ['<code>COUNT(*)</code> は NULL 含む全行', '<code>COUNT(列)</code> は NULL を除外'],
    bqNotes: 'BigQuery でも同じ挙動。NULL率を測るには <code>COUNTIF(列 IS NULL)</code> も便利。'
  },

  // ====================================================
  // 重複・順位
  // ====================================================
  {
    id: 'dr01', category: '重複・順位', difficulty: '★',
    title: 'DISTINCT で利用駅一覧',
    description: '<code>rides</code> から <b>出発駅として一度でも使われた駅ID</b> の重複を除いたリストを取得してください。<br>列は <code>from_station_id</code>、昇順。',
    tables: ['rides'],
    setup: RIDES,
    expected: 'SELECT DISTINCT from_station_id FROM rides ORDER BY from_station_id',
    ordered: true,
    hints: ['<code>SELECT DISTINCT 列</code> で重複除去'],
    bqNotes: 'BigQuery: <code>SELECT DISTINCT</code> は完全に同じ。<code>GROUP BY 列</code> でも代用できる(大規模クエリでは GROUP BY の方が高速なことも)。'
  },
  {
    id: 'dr02', category: '重複・順位', difficulty: '★★★',
    title: 'RANK vs DENSE_RANK vs ROW_NUMBER',
    description: '<code>rides</code> から <b>運賃の高い順</b> に、3つの順位関数を並べてトップ10を表示してください。<br>列は <code>ride_id, fare, rn, rk, drk</code>。<code>fare</code> 降順, <code>ride_id</code> 昇順。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT ride_id, fare,
  ROW_NUMBER() OVER (ORDER BY fare DESC) AS rn,
  RANK() OVER (ORDER BY fare DESC) AS rk,
  DENSE_RANK() OVER (ORDER BY fare DESC) AS drk
FROM rides
ORDER BY fare DESC, ride_id
LIMIT 10`,
    ordered: true,
    hints: ['3つとも構文は同じで関数名だけ違う', '同点運賃の行で3つの値の違いを観察'],
    bqNotes: '<b>ROW_NUMBER</b>: 同点でも連番(1,2,3,4)<br><b>RANK</b>: 同点で同番、次は飛ぶ(1,1,3,4)<br><b>DENSE_RANK</b>: 同点で同番、次は詰める(1,1,2,3)<br>BigQuery でも完全に同じ。'
  },

  // ====================================================
  // 集合演算
  // ====================================================
  {
    id: 'u01', category: '集合演算', difficulty: '★★',
    title: 'UNION ALL で出発駅と到着駅を縦結合',
    description: '<code>rides</code> の <b>出発駅と到着駅を全て1つのリスト</b> にしてください。出発・到着の区別がつくよう <code>type</code> 列を付与。<br>列は <code>station_id, type</code>、<code>station_id, type</code> 昇順。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT from_station_id AS station_id, '出発' AS type FROM rides
UNION ALL
SELECT to_station_id AS station_id, '到着' AS type FROM rides
ORDER BY station_id, type`,
    ordered: true,
    hints: ['<code>SELECT ... UNION ALL SELECT ...</code> で縦結合', '<code>UNION</code> (重複除去) と <code>UNION ALL</code> (重複保持) の違い'],
    bqNotes: 'BigQuery でも同じ。<code>UNION ALL</code> は重複除去しないので高速。重複除去が必要な時だけ <code>UNION DISTINCT</code> を。'
  },
  {
    id: 'u02', category: '集合演算', difficulty: '★★',
    title: 'EXCEPT で未利用駅を抽出',
    description: '<b>全駅のうち、rides で出発駅として一度も使われていない駅ID</b> を抽出してください。<code>EXCEPT</code> を使ってください。<br>列は <code>station_id</code>、昇順。',
    tables: ['stations', 'rides'],
    setup: STATIONS + RIDES,
    expected: `SELECT station_id FROM stations
EXCEPT
SELECT from_station_id FROM rides
ORDER BY station_id`,
    ordered: true,
    hints: ['<code>SELECT ... EXCEPT SELECT ...</code> で差分', '上下のSELECTは同じ列数・順序が必要'],
    bqNotes: 'BigQuery では <code>EXCEPT DISTINCT</code> と明示が必要 (重複保持版の <code>EXCEPT ALL</code> もあり)。SQLite/Postgres の <code>EXCEPT</code> は DISTINCT が暗黙。'
  },

  // ====================================================
  // ウィンドウ関数
  // ====================================================
  {
    id: 'w01', category: 'ウィンドウ関数', difficulty: '★★★',
    title: 'ROW_NUMBER で乗車順位',
    description: '乗客ごとに <b>乗車日が古い順</b> の通し番号 <code>seq</code> を付けてください。列は <code>passenger_id, ride_date, fare, seq</code>、<code>passenger_id, seq</code> 昇順。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT passenger_id, ride_date, fare,
  ROW_NUMBER() OVER (PARTITION BY passenger_id ORDER BY ride_date) AS seq
FROM rides
ORDER BY passenger_id, seq`,
    ordered: true,
    hints: ['<code>ROW_NUMBER() OVER (PARTITION BY 列 ORDER BY 列)</code>'],
    bqNotes: 'BigQuery でも完全に同じ構文。'
  },
  {
    id: 'w02', category: 'ウィンドウ関数', difficulty: '★★★',
    title: 'LAG で前回乗車との運賃差',
    description: '乗客ごとに乗車日順で並べ、<b>前回乗車との運賃の差</b> <code>fare_diff</code> を求めてください。前回がない場合は NULL。列は <code>passenger_id, ride_date, fare, fare_diff</code>、<code>passenger_id, ride_date</code> 昇順。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT passenger_id, ride_date, fare,
  fare - LAG(fare) OVER (PARTITION BY passenger_id ORDER BY ride_date) AS fare_diff
FROM rides
ORDER BY passenger_id, ride_date`,
    ordered: true,
    hints: ['<code>LAG(列) OVER (...)</code> で前行の値'],
    bqNotes: '<code>LAG(col, 2, default)</code> で「2行前、無ければ default」。<code>LEAD</code> は逆方向(次行)。'
  },
  {
    id: 'w03', category: 'ウィンドウ関数', difficulty: '★★★',
    title: '駅別の累計乗車運賃',
    description: '出発駅ごとに乗車日順で並べ、<b>累計運賃 (cum_fare)</b> を計算してください。列は <code>from_station_id, ride_date, fare, cum_fare</code>、<code>from_station_id, ride_date, ride_id</code> 昇順。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT from_station_id, ride_date, fare,
  SUM(fare) OVER (PARTITION BY from_station_id ORDER BY ride_date, ride_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_fare
FROM rides
ORDER BY from_station_id, ride_date, ride_id`,
    ordered: true,
    hints: ['<code>SUM() OVER (PARTITION BY ... ORDER BY ...)</code> で累計', 'タイブレークのため <code>ride_id</code> も ORDER BY に入れる'],
    bqNotes: '<code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> がフレーム明示。省略時は <code>RANGE</code> 系で同値行が同じ累計になるので注意。'
  },
  {
    id: 'w04', category: 'ウィンドウ関数', difficulty: '★★★',
    title: '都道府県ごとの最年長者',
    description: '<code>passengers</code> から <b>都道府県ごとに最年長の人</b> を1人ずつ抽出してください。列は <code>prefecture, name, age</code>、<code>prefecture</code> 昇順。',
    tables: ['passengers'],
    setup: PASSENGERS,
    expected: `SELECT prefecture, name, age FROM (
  SELECT prefecture, name, age,
    ROW_NUMBER() OVER (PARTITION BY prefecture ORDER BY age DESC) AS rn
  FROM passengers
) WHERE rn = 1
ORDER BY prefecture`,
    ordered: true,
    hints: ['ウィンドウ関数 + サブクエリで <code>rn = 1</code> をフィルタ', 'BigQuery なら <code>QUALIFY</code> 一発'],
    bqNotes: `BigQuery では <code>QUALIFY</code> を使ってよりシンプルに書けます:
<pre style="background:#11111b;padding:8px;border-radius:4px;margin-top:4px"><code>SELECT prefecture, name, age
FROM passengers
QUALIFY ROW_NUMBER() OVER (PARTITION BY prefecture ORDER BY age DESC) = 1
ORDER BY prefecture</code></pre>
<code>QUALIFY</code> はウィンドウ関数結果を直接 WHERE のように使える節。BQ/DuckDB/Snowflake 専用。`
  },

  // ====================================================
  // 応用ウィンドウ
  // ====================================================
  {
    id: 'w05', category: '応用ウィンドウ', difficulty: '★★★',
    title: 'NTILE で運賃を4分位に分割',
    description: '<code>rides</code> の運賃を <b>低い順に4分位 (NTILE)</b> に分け、各乗車にどの分位に属するかラベルを付けてください。<br>列は <code>ride_id, fare, quartile</code>、<code>fare, ride_id</code> 昇順。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT ride_id, fare,
  NTILE(4) OVER (ORDER BY fare, ride_id) AS quartile
FROM rides
ORDER BY fare, ride_id`,
    ordered: true,
    hints: ['<code>NTILE(N) OVER (ORDER BY ...)</code> で N 等分グループ番号', '同点を含めるためタイブレーカに ride_id'],
    bqNotes: 'BigQuery でも完全に同じ。<b>PERCENTILE_CONT</b> や <b>APPROX_QUANTILES</b> で具体的な閾値を算出するパターンも頻出。'
  },
  {
    id: 'w06', category: '応用ウィンドウ', difficulty: '★★★',
    title: 'FIRST_VALUE で初回乗車運賃を全行に',
    description: '乗客ごとの全乗車に、<b>その乗客の初回乗車運賃 (first_fare)</b> を付与してください。<br>列は <code>passenger_id, ride_date, fare, first_fare</code>、<code>passenger_id, ride_date, ride_id</code> 昇順。同日複数乗車は <code>ride_id</code> 小さい方を初回扱い。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT passenger_id, ride_date, fare,
  FIRST_VALUE(fare) OVER (PARTITION BY passenger_id ORDER BY ride_date, ride_id) AS first_fare
FROM rides
ORDER BY passenger_id, ride_date, ride_id`,
    ordered: true,
    hints: ['<code>FIRST_VALUE(列) OVER (PARTITION BY ... ORDER BY ...)</code>', 'デフォルトフレームでも先頭値は安定して取れる'],
    bqNotes: '<b>LAST_VALUE</b> はデフォルトフレーム (RANGE) だと自分の行までしか見ないので、<code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code> が必要。<code>NTH_VALUE(col, n)</code> も似た系統。'
  },

  // ====================================================
  // ピボット
  // ====================================================
  {
    id: 'pv01', category: 'ピボット', difficulty: '★★★',
    title: 'CASE で月別都道府県別ピボット',
    description: '<b>都道府県 × 月</b> の乗車数クロス集計表を作ってください。<br>列は <code>prefecture, m_2025_01, m_2025_02, m_2025_03, m_2025_04</code>、<code>prefecture</code> 昇順。',
    tables: ['rides', 'passengers'],
    setup: PASSENGERS + RIDES,
    expected: `SELECT p.prefecture,
  SUM(CASE WHEN strftime('%Y-%m', r.ride_date) = '2025-01' THEN 1 ELSE 0 END) AS m_2025_01,
  SUM(CASE WHEN strftime('%Y-%m', r.ride_date) = '2025-02' THEN 1 ELSE 0 END) AS m_2025_02,
  SUM(CASE WHEN strftime('%Y-%m', r.ride_date) = '2025-03' THEN 1 ELSE 0 END) AS m_2025_03,
  SUM(CASE WHEN strftime('%Y-%m', r.ride_date) = '2025-04' THEN 1 ELSE 0 END) AS m_2025_04
FROM rides r
JOIN passengers p ON r.passenger_id = p.passenger_id
GROUP BY p.prefecture
ORDER BY p.prefecture`,
    ordered: true,
    hints: ['<code>SUM(CASE WHEN 条件 THEN 1 ELSE 0 END)</code> = 条件カウント', '月の数だけ列を増やす'],
    bqNotes: `BigQuery には専用の <code>PIVOT</code> 構文があります:
<pre style="background:#11111b;padding:8px;border-radius:4px;margin-top:4px"><code>SELECT * FROM (
  SELECT p.prefecture, FORMAT_DATE('m_%Y_%m', r.ride_date) AS month, 1 AS n
  FROM rides r JOIN passengers p USING (passenger_id)
)
PIVOT (SUM(n) FOR month IN ('m_2025_01','m_2025_02','m_2025_03','m_2025_04'))</code></pre>
ただし列名を動的に指定できないため、実務では CASE WHEN の方が柔軟。`
  },
  {
    id: 'pv02', category: 'ピボット', difficulty: '★★',
    title: 'UNION ALL でアンピボット (横→縦)',
    description: '<code>quarterly_sales</code> は四半期売上が横持ち (q1,q2,q3,q4) です。これを <b>縦持ち (region, quarter, sales)</b> に変換してください。<code>region, quarter</code> 昇順。',
    tables: ['quarterly_sales'],
    setup: QUARTERLY,
    expected: `SELECT region, 'Q1' AS quarter, q1 AS sales FROM quarterly_sales
UNION ALL
SELECT region, 'Q2' AS quarter, q2 AS sales FROM quarterly_sales
UNION ALL
SELECT region, 'Q3' AS quarter, q3 AS sales FROM quarterly_sales
UNION ALL
SELECT region, 'Q4' AS quarter, q4 AS sales FROM quarterly_sales
ORDER BY region, quarter`,
    ordered: true,
    hints: ['列ごとに SELECT を作って <code>UNION ALL</code>', '各 SELECT で同じ列構造にする'],
    bqNotes: `BigQuery では専用の <code>UNPIVOT</code> 構文:
<pre style="background:#11111b;padding:8px;border-radius:4px;margin-top:4px"><code>SELECT region, quarter, sales
FROM quarterly_sales
UNPIVOT (sales FOR quarter IN (q1, q2, q3, q4))
ORDER BY region, quarter</code></pre>`
  },

  // ====================================================
  // 日付・文字列
  // ====================================================
  {
    id: 'd01', category: '日付・文字列', difficulty: '★★',
    title: '月別の乗車回数',
    description: '<code>rides</code> から <b>月別の乗車回数</b> を集計してください。列は <code>month (YYYY-MM 形式)</code>, <code>cnt</code>、<code>month</code> 昇順。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT strftime('%Y-%m', ride_date) AS month, COUNT(*) AS cnt
FROM rides
GROUP BY month
ORDER BY month`,
    ordered: true,
    hints: ['<code>strftime(\'%Y-%m\', ride_date)</code>'],
    bqNotes: 'BigQuery: <code>FORMAT_DATE(\'%Y-%m\', ride_date)</code> または <code>DATE_TRUNC(ride_date, MONTH)</code>。'
  },
  {
    id: 'd02', category: '日付・文字列', difficulty: '★★',
    title: '「梅」を含む駅を抽出',
    description: '<code>stations</code> から <b>駅名に「梅」を含む</b> 駅を抽出してください。列は <code>station_id, name</code>、<code>station_id</code> 昇順。',
    tables: ['stations'],
    setup: STATIONS,
    expected: "SELECT station_id, name FROM stations WHERE name LIKE '%梅%' ORDER BY station_id",
    ordered: true,
    hints: ['<code>LIKE \'%梅%\'</code> で部分一致'],
    bqNotes: 'BigQuery: <code>REGEXP_CONTAINS(name, \'梅\')</code> もよく使われます。複雑なパターンマッチは正規表現の方が便利。'
  },

  // ====================================================
  // 配列・UNNEST
  // ====================================================
  {
    id: 's01', category: '配列・UNNEST', difficulty: '★★★',
    title: '乗客ごとの利用駅リスト',
    description: '乗客ごとに、<b>利用した出発駅IDをカンマ区切りで連結</b>してください。列は <code>passenger_id, station_ids</code>、<code>passenger_id</code> 昇順。<code>ride_id</code> 順で連結。',
    tables: ['rides'],
    setup: RIDES,
    expected: `SELECT passenger_id, GROUP_CONCAT(from_station_id, ',' ORDER BY ride_id) AS station_ids
FROM rides
GROUP BY passenger_id
ORDER BY passenger_id`,
    ordered: true,
    hints: ['SQLite: <code>GROUP_CONCAT(列, 区切り文字 ORDER BY ...)</code>'],
    bqNotes: `BigQuery では <code>ARRAY_AGG</code> で<b>配列</b>そのものを返すのが標準:
<pre style="background:#11111b;padding:8px;border-radius:4px;margin-top:4px"><code>SELECT passenger_id, ARRAY_AGG(from_station_id ORDER BY ride_id) AS station_ids
FROM rides
GROUP BY passenger_id
ORDER BY passenger_id</code></pre>
カンマ連結なら <code>STRING_AGG(col, ',')</code>。`
  },
  {
    id: 's02', category: '配列・UNNEST', difficulty: '★★★',
    title: '配列を1行1要素に展開',
    description: '<code>user_tags</code> テーブルの <code>tags</code> 列は JSON 配列の文字列です。<b>1行1タグの形に展開</b>してください。列は <code>user_id, tag</code>、<code>user_id, tag</code> 昇順。',
    tables: ['user_tags'],
    setup: USER_TAGS,
    expected: `SELECT u.user_id, j.value AS tag
FROM user_tags u, json_each(u.tags) j
ORDER BY u.user_id, j.value`,
    ordered: true,
    hints: ['SQLite: <code>json_each(json列)</code> で配列を行に展開'],
    bqNotes: `BigQuery の標準は <b>ARRAY 型 + UNNEST</b>:
<pre style="background:#11111b;padding:8px;border-radius:4px;margin-top:4px"><code>SELECT user_id, tag
FROM user_tags, UNNEST(tags) AS tag
ORDER BY user_id, tag</code></pre>
カンマ+UNNEST は<b>暗黙の CROSS JOIN</b>。空配列の行も残したい場合は <code>LEFT JOIN UNNEST(tags) AS tag</code>。`
  },

  // ====================================================
  // 実践応用
  // ====================================================
  {
    id: 'ap01', category: '実践応用', difficulty: '★★★',
    title: '月次売上の前月比成長率',
    description: '<code>sales</code> と <code>products</code> から <b>月別の売上金額 (quantity × price の合計)</b> を出し、<b>前月比成長率 (%)</b> を計算してください。<br>列は <code>month, revenue, prev_revenue, growth_pct</code>、<code>month</code> 昇順。<code>growth_pct</code> は小数1桁に丸める。初月は NULL でOK。',
    tables: ['sales', 'products'],
    setup: PRODUCTS + SALES,
    expected: `WITH monthly AS (
  SELECT strftime('%Y-%m', s.sold_at) AS month,
         SUM(s.quantity * p.price) AS revenue
  FROM sales s
  JOIN products p ON s.product_id = p.product_id
  GROUP BY month
)
SELECT month, revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
  ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0 / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly
ORDER BY month`,
    ordered: true,
    hints: ['CTE で月次集計', '<code>LAG(revenue) OVER (ORDER BY month)</code> で前月値', '<code>100.0</code> を掛けないと整数除算になる'],
    bqNotes: 'BigQuery でも完全に同じパターン。実務では同じ <code>LAG</code> を3回書く代わりに CTE をもう一段噛ます方が読みやすい。'
  },
  {
    id: 'ap02', category: '実践応用', difficulty: '★★★',
    title: 'コホート分析: 登録月 × アクティブ月',
    description: '<b>登録月 (cohort_month) ごとに、各月のアクティブユーザー数</b> を集計してください。アクティブ=その月に乗車記録がある乗客。<br>列は <code>cohort_month, active_month, active_users</code>、<code>cohort_month, active_month</code> 昇順。',
    tables: ['passengers', 'rides'],
    setup: PASSENGERS + RIDES,
    expected: `WITH cohort AS (
  SELECT passenger_id, strftime('%Y-%m', registered_at) AS cohort_month
  FROM passengers
),
activity AS (
  SELECT DISTINCT passenger_id, strftime('%Y-%m', ride_date) AS active_month
  FROM rides
)
SELECT c.cohort_month, a.active_month, COUNT(DISTINCT a.passenger_id) AS active_users
FROM cohort c
JOIN activity a ON c.passenger_id = a.passenger_id
GROUP BY c.cohort_month, a.active_month
ORDER BY c.cohort_month, a.active_month`,
    ordered: true,
    hints: ['登録月で乗客を分類 (CTE1)', '乗車記録から月別ユニーク利用者 (CTE2)', '両者を結合してコホート×月で集計'],
    bqNotes: 'コホート分析はマーケ・継続率分析の定番。BigQuery では <code>DATE_DIFF(active_month, cohort_month, MONTH)</code> で「登録から何ヶ月後か」を出してピボットすると "横軸=経過月" の表になります。'
  }
];
