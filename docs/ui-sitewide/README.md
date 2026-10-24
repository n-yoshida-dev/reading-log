# サイト全体のUI改善

2026-10-24。PR #1の全体改修に対して、PC・スマートフォン幅の比較と主要操作を確認しました。

## 比較条件

- 変更前：コミット `3a2627a9f2683172081dfa6942155ecc5bcac9f8`。以前の本棚改善を含む比較元です。
- 変更後：コミット `adfb99ae4144044482d726997ffd1b0c5f5336a6`。全体改修後のソースとローカル作業ファイルの一致を確認（書籍詳細の空白差分のみ除外）。
- 両方ともローカルプレビュー（LiquidJS + Markdown）。Jekyllの公開配信画面とは区別します。
- PC：1440×1000、スマートフォン幅：390×844。フォームは全ページ撮影、それ以外は先頭の表示範囲です。
- 画像出力はブラウザ側で縮小される場合があります。フォームの高さは内容量に応じて変わります。比較元のレビュー一覧には横はみ出しがあります。
- 今回は実機のスマートフォンではなく、ブラウザの画面幅を変更して検証しています。
- 以前の公開mainと本棚改善の比較は [こちら](../ui-pr-1/README.md)。

## PCの比較

| 画面 | 変更前 | 変更後 |
| --- | --- | --- |
| 本棚 | ![本棚 変更前](before/bookshelf-pc.jpg) | ![本棚 変更後](after/bookshelf-pc.jpg) |
| 本の詳細：読書中 | ![本の詳細：読書中 変更前](before/book-reading-pc.jpg) | ![本の詳細：読書中 変更後](after/book-reading-pc.jpg) |
| 本の詳細：読了 | ![本の詳細：読了 変更前](before/book-finished-pc.jpg) | ![本の詳細：読了 変更後](after/book-finished-pc.jpg) |
| 記録：新しい本 | ![記録：新しい本 変更前](before/record-new-pc.jpg) | ![記録：新しい本 変更後](after/record-new-pc.jpg) |
| 記録：読書中メモ | ![記録：読書中メモ 変更前](before/record-progress-pc.jpg) | ![記録：読書中メモ 変更後](after/record-progress-pc.jpg) |
| 記録：読了・感想 | ![記録：読了・感想 変更前](before/record-review-pc.jpg) | ![記録：読了・感想 変更後](after/record-review-pc.jpg) |
| レビュー一覧 | ![レビュー一覧 変更前](before/reviews-pc.jpg) | ![レビュー一覧 変更後](after/reviews-pc.jpg) |
| 最新レビュー | ![最新レビュー 変更前](before/review-pc.jpg) | ![最新レビュー 変更後](after/review-pc.jpg) |
| 404 | ![404 変更前](before/404-pc.jpg) | ![404 変更後](after/404-pc.jpg) |

## スマートフォン幅の比較

| 画面 | 変更前 | 変更後 |
| --- | --- | --- |
| 本棚 | ![本棚 変更前](before/bookshelf-mobile.jpg) | ![本棚 変更後](after/bookshelf-mobile.jpg) |
| 本の詳細：読書中 | ![本の詳細：読書中 変更前](before/book-reading-mobile.jpg) | ![本の詳細：読書中 変更後](after/book-reading-mobile.jpg) |
| 本の詳細：読了 | ![本の詳細：読了 変更前](before/book-finished-mobile.jpg) | ![本の詳細：読了 変更後](after/book-finished-mobile.jpg) |
| 記録：新しい本 | ![記録：新しい本 変更前](before/record-new-mobile.jpg) | ![記録：新しい本 変更後](after/record-new-mobile.jpg) |
| 記録：読書中メモ | ![記録：読書中メモ 変更前](before/record-progress-mobile.jpg) | ![記録：読書中メモ 変更後](after/record-progress-mobile.jpg) |
| 記録：読了・感想 | ![記録：読了・感想 変更前](before/record-review-mobile.jpg) | ![記録：読了・感想 変更後](after/record-review-mobile.jpg) |
| レビュー一覧 | ![レビュー一覧 変更前](before/reviews-mobile.jpg) | ![レビュー一覧 変更後](after/reviews-mobile.jpg) |
| 最新レビュー | ![最新レビュー 変更前](before/review-mobile.jpg) | ![最新レビュー 変更後](after/review-mobile.jpg) |
| 404 | ![404 変更前](before/404-mobile.jpg) | ![404 変更後](after/404-mobile.jpg) |

## 主な改善

- 本文16px、補助14px、見出し22px、タイトル32pxを基本とする4段階に整理。
- 生成りと緑の配色を保ち、背景・文字・リンク・境界・主要操作・フォーカスの用途を統一。
- 重複する英語小見出し、大きすぎる紹介文、装飾的な影やホバー移動を削減。
- 詳細ページはスマートフォンでも書影と書名を並べ、書誌情報と読書履歴を開閉式に変更。
- フォームは文言と入力欄を整理。必須エラーでは対象入力へフォーカスし、入力変更後は古い生成結果を無効化。
- レビューの共通レイアウト、一覧と最新レビューへの導線を追加。狭い画面の折り返しと重複掲載を修正。
- スキップリンク、現在位置、進捗バーのアクセシブルな属性を追加。
- 書籍データ・読書ログ・感想・週次レビュー本文は編集していません。

## 検証結果

| 確認内容 | 結果 |
| --- | --- |
| PC・390px幅の9画面 | 撮影済み。変更後に横はみ出しなし |
| 320px幅 | 本棚、読書中/読了の詳細、レビュー一覧/最新、フォーム初期画面、404で横はみ出しなし |
| レビュー一覧 | 変更前は390px幅に対してscrollWidth 568px。変更後は375pxで画面内に収まる |
| 新規・進捗・感想の文章生成 | 入力した書名、進捗、評価が出力に含まれることを確認 |
| 必須項目エラー | 3モードで表示。新規登録では対象入力へのフォーカスとaria-invalidも確認 |
| 本の検索・選択 | 書名で絞り込み、候補選択、矢印キーとEnterによる選択を確認 |
| 入力変更後 | 以前の出力が空になりコピーボタンが無効になることを確認 |
| コピー | 「コピーしました。」の表示を確認 |
| 書籍情報 | 開閉とISBNの表示を確認 |
| レビュー移動 | 一覧→過去レビュー→一覧を確認 |
| 旧record.html | /record/へのリダイレクトを確認 |
| Jekyllビルド | [Validate Pages](https://github.com/n-yoshida-dev/reading-log/actions/runs/40038929915)成功。JS構文、全書籍/レビューの生成HTML、見出し・ID・参照を検証 |

詳細な幅の測定値は [通常幅](after/layout-checks.json) / [320px幅](after/narrow-checks.json)。

## ダーク配色

ローカルプレビューで既存のダーク用CSSのメディア条件を強制適用して確認しました。OS設定の切り替えや実機での検証とは区別します。

| 本棚 | 詳細 | フォーム | レビュー |
| --- | --- | --- | --- |
| ![ダーク本棚](after/bookshelf-dark-mobile.jpg) | ![ダーク詳細](after/book-reading-dark-mobile.jpg) | ![ダークフォーム](after/record-new-dark-mobile.jpg) | ![ダークレビュー](after/review-dark-mobile.jpg) |

## 未確認事項

- クリア確認ダイアログの最終操作は、Chromeの自動操作接続が応答しなくなったため確認未完了。フォームの初期化は再訪時に確認。
- ChatGPTのリンク設定の保存・削除と、コピー後のChatGPTへの実際の遷移は未実施。
- 実機、スクリーンリーダー、すべてのブラウザでの検証は未実施。
- 上記はローカルの画面比較です。公開Pagesへの配信確認は別途行います。
