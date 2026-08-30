# reading-log — Claude Code 向けの入口

## 最初に読むもの

1. `AI_RULES.md` 全文。ChatGPT・Codex・Claude 共通の正式ルール。**ここに書いてあることはこのファイルでは繰り返さない**
2. 依頼に応じて `templates/book.md`、対象の `books/*.md`、`inbox/*.md`、`reviews/latest.md`

## Claude Code の役割分担

- 日常の登録・進捗・感想の更新は ChatGPT プロジェクト「読書管理」（iPhone から）が担当
- Claude Code は **大量登録・構造変更・横断チェック** を担当（`README.md` の分担）。
  単発の更新を頼まれてもやってよいが、ChatGPT と同じルール（`AI_RULES.md`）で行う

## このリポジトリ固有の注意

- **public リポジトリ。GitHub Pages で誰でも読める。** 個人情報・家計・勤務先・長い引用を書かない（`AI_RULES.md` 10）
- カード番号・口座番号・残高は `.claude/hooks/sensitive-numbers-guard.py` が機械的にブロックする。
  正本は `~/workspace/ops/.claude/hooks/`。直すときは ops 側を直して配る（手順は `~/workspace/personal/CLAUDE.md`）
- Jekyll サイト。サイトに出したくないファイル・ディレクトリを追加したら `_config.yml` の `exclude` に足す
  （`.` 始まりのものは自動で除外される）
- 本ファイル先頭の front matter（`---` で囲まれた部分）はサイト表示とソートに使われる。
  `status` `progress` `reading_order` の型（`AI_RULES.md` 3・4）を崩さない

## Git 運用

- ChatGPT も `main` に直接コミットする。**作業前に `git pull`**。競合したら上書きせず止めて報告する（`AI_RULES.md` 11）
- 1依頼1コミット。コミット前に変更ファイルと内容を報告し、push は確認後
- ブランチ・PR は使わない（ChatGPT 側と揃える）

## 検証

- 構造変更・大量登録の後は、全 `books/*.md` の front matter が壊れていないかを機械的に確認する。
  検証スクリプトは未整備なので、整備するまでは下の一行で最低限を確認する（PyYAML は WSL に導入済み）

  ```bash
  python3 -c "
import glob, yaml
for f in sorted(glob.glob('books/*.md')):
    t = open(f, encoding='utf-8').read()
    if not t.startswith('---'): print('skip (front matter なし):', f); continue
    d = yaml.safe_load(t.split('---', 2)[1]); print('OK', f, d['status'], d['progress'], d['reading_order'])
"
  ```
