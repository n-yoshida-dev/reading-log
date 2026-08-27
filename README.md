# Reading Log

ChatGPT・Claude・Claude Codeを横断して使う、個人用の読書管理リポジトリです。
本の書誌情報、進捗、読書メモ、感想、要約、読了後のアクションをMarkdownで管理します。

- 正本: このGitHubリポジトリ
- 日常の作業場所: ChatGPTプロジェクト「読書管理」
- 大量登録・構造変更: Claude Code
- 定期レビュー: ChatGPTの週次タスク
- 閲覧画面: [GitHub Pages](https://n-yoshida-dev.github.io/reading-log/)

## 運用の原則

1. 1冊につき `books/` 内のMarkdownを1ファイル作成します。
2. 書誌情報を推測で確定せず、不明項目は空欄のまま残します。
3. その場で整理できない入力だけを `inbox/` に置きます。
4. 読書メモは日付順に追記し、過去の本人の記述を勝手に要約・削除しません。
5. 公開リポジトリなので、個人情報、勤務先・案件の機密情報、書籍本文の長い引用は記録しません。

AIが更新する際の正式なルールは [AI_RULES.md](AI_RULES.md) を参照してください。

## ディレクトリ

```text
reading-log/
├── books/                       # 1冊につき1ファイル
├── inbox/                       # 未整理の入力
├── reviews/                     # 週次レビュー
│   └── latest.md                # 最新レビューへの固定URL
├── templates/                   # 本・週次レビューのテンプレート
├── assets/covers/               # 使用許可を確認した表紙画像のみ
├── AI_RULES.md                  # 全AI共通の正式ルール
├── CHATGPT_PROJECT_INSTRUCTIONS.md
├── AGENTS.md                    # Codex向け入口
└── CLAUDE.md                    # Claude Code向け入口
```

## ステータス

- `unread`: 未読・積読
- `reading`: 読書中
- `paused`: 一時停止
- `finished`: 読了
- `skimmed`: 必要箇所を拾い読みして完了
- `abandoned`: 読む価値が薄いと判断して中止

同時に `reading` にする本は原則2冊までです。読み切ること自体を目的にせず、`skimmed` と `abandoned` も正常な完了判断として扱います。

## iPhoneからの入力例

- 「この表紙とISBNの本を登録して。買った理由はGoの設計を学ぶため」
- 「今日は85ページまで。第3章の考え方をOrgFlowに試したい」
- 「読了。今週中にREADMEの設計判断を書き直す、をアクションに追加して」
- 「積読と今の90日目標を見て、次に読む本を1冊に絞って」

GitHubへ反映した場合は、AIから変更ファイルと変更内容の報告を受け取ります。

## GitHub Pagesの有効化

リポジトリの `Settings` → `Pages` → `Build and deployment` で、Sourceを `Deploy from a branch`、Branchを `main`、Folderを `/(root)` に設定します。以後はMarkdownの更新に追随してサイトが再生成されます。

## 外部からの変更について

これは個人の読書記録です。外部からのIssue、Pull Request、レビューは受け付けません。リポジトリ設定の `Features` で Pull requests・Issues・Discussions・Wikiを無効化して運用します。
