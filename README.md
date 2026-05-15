# BigQuery SQL 学習アプリ

ブラウザで動くローカル SQL 練習アプリ。BigQuery 風の SQL を実際に実行・採点しながら、書く力を鍛えます。

## 特徴

- **20問の練習問題**(基礎 → 集約 → 結合 → CTE → ウィンドウ関数 → 日付/文字列 → 配列/UNNEST まで段階的に)
- **JR西日本テーマのサンプルデータ**(駅・乗客・乗車・物販)
- **自動採点**: 実行結果が期待結果と一致したら ✓
- **BigQuery / DuckDB 文法対応表**を内蔵(構文の差分を一覧で確認可)
- **進捗保存**(LocalStorage)
- 各問題に「ヒント」「BigQuery メモ」付き

## 起動方法

`start.bat` をダブルクリック。

裏で何が起きるか:
1. Python (または Node.js) のローカル HTTP サーバが起動 (port 8765)
2. ブラウザで `http://localhost:8765` が開く
3. DuckDB WASM が読み込まれる(初回は数十秒)

> **なぜローカルサーバが必要?**
> ブラウザのセキュリティ制約で、`file://` から ES モジュール CDN を読み込めません。`start.bat` がこれを自動回避します。

## 技術スタック

- **DuckDB WASM** (ブラウザ内で動く SQL エンジン)
- ES Modules (CDN: jsDelivr)
- Vanilla JavaScript (フレームワーク無し)

## DuckDB と BigQuery の違いについて

採点用に DuckDB で実行していますが、目的は BigQuery の SQL 力向上です。**構文が異なる場合**は問題画面下の「📘 BigQuery メモ」と、サイドバーの「文法対応表」で BQ 流の書き方を確認できます。

特に違いの大きい関数:
- `DATE_TRUNC` の引数順
- `EXTRACT(DAYOFWEEK ...)` の曜日番号
- `REGEXP_CONTAINS` vs `regexp_matches`
- `UNNEST` の書き方(`CROSS JOIN` 有無)

## ファイル構成

```
sql_study_app/
├── index.html       # UI
├── style.css        # スタイル
├── app.js           # メインロジック (DuckDB初期化・採点)
├── problems.js      # 問題データ
├── cheatsheet.js    # 文法対応表
├── start.bat        # サーバ起動
└── README.md
```

## 問題の追加方法

`problems.js` の配列に追加するだけ。1問の形式:

```javascript
{
  id: 'x99',
  category: '集約',
  difficulty: '★★',
  title: '問題タイトル',
  description: '<b>HTML可</b>な問題文',
  tables: ['rides'],            // 表示するテーブル
  setup: STATIONS + RIDES,      // セットアップ用 SQL
  expected: 'SELECT ...',        // 模範解答
  ordered: true,                 // true なら行の順序も評価
  hints: ['ヒント1', 'ヒント2'],
  bqNotes: 'BigQuery での書き方など'
}
```

## トラブルシュート

- **「DuckDB 読み込み中…」のまま進まない**: 通信環境を確認。CDN(jsdelivr.net)へのアクセスが必要です。
- **`start.bat` でエラー**: Python (3.x) か Node.js のインストールが必要。
- **進捗をリセットしたい**: ブラウザの開発者ツール → Application → Local Storage → `sql_study_*` を削除。

## ライセンス

個人学習用。自由に改変してください。
