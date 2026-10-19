#!/usr/bin/env python3
"""sensitive-numbers-guard

PreToolUse で実行され、カード番号・口座番号・残高が Markdown に
書き込まれるのをブロックする。

正本は ops リポジトリ（ops/.claude/hooks/）。~/workspace/personal/ 配下の
各リポジトリにも同じファイルをコピーして使う（2026-08-30〜）。
コピー先で差を付けたいときはファイルを変えず、settings.json の起動引数で切り替える:
  --allow-balance  残高チェックを外す（personal-ai-context 用。自リポジトリの
                   meta/update-protocol.md が「資産残高は必要性を確認して記載可」のため）

CLAUDE.md の「口座番号・カード番号・残高は作業メモにも転記しない」は
Claude への"お願い"であり、見落とされうる。hooks は必ず実行されるため
ここに移した（2026-08-20 新設）。

仕様上の注意（既存フックと同じ）:
- ツール入力は stdin の JSON で渡される
- ブロックは permissionDecision:"deny" の JSON 出力＋ exit 0 で行う

bash ではなく python3 で書いている理由:
カード番号の判定に Luhn（チェックディジット計算）を使うため。
16桁の数字を全て弾くと日付の連結などで誤検知するが、Luhn を通せば
実在しうるカード番号だけに絞れる。

Bash も検査対象にしている理由:
`cat > file <<EOF` のヒアドキュメントで書かれるとファイル書き込み系の
ツールを経由しないため、Write/Edit だけを見ていると素通りする。
"""

import json
import re
import sys

# --- 検出ルール ---

# 13〜19桁。区切りはハイフン・スペースのみ許可（カンマは金額なので除外）
CARD_CANDIDATE = re.compile(r"(?<![0-9])(?:[0-9][ -]?){12,18}[0-9](?![0-9])")

# カード番号の判定の前に除く URL（2026-10-06 追加）。
# 2026-10-06 に、note 公式ヘルプの記事 URL（…/hc/ja/articles/ のあとの 14 桁）が偶然 Luhn を通って誤検知した。
# URL の外に書かれたカード番号は引き続き弾く（同じ行に URL があっても）
URL = re.compile(r"https?://[^\s)\]>」]+")

# 同一行にこの語があり、かつ4桁以上の数字が並んでいたら口座情報とみなす
ACCOUNT_KEYWORD = re.compile(r"口座番号|口座No|口座№|振込先|店番号|支店番号|カード番号")
FOUR_DIGITS = re.compile(r"[0-9]{4,}")

# 口座情報の判定の前に行から除く「口座番号ではない数字」（2026-10-04 追加）。
# 2026-10-04 に、この語を含む行の「runtime.mjs:1187-1194」「/tmp/claude-1000/…」「2026-10-04」で誤検知した。
# 本物の口座番号を見逃さないよう、形がはっきりした 3 種類だけに絞る:
#   日付（19xx・20xx の年で始まる 2026-10-04 / 2026/10 / 2026年10月4日）
#   ファイル名:行番号（英字の拡張子の直後の「:数字」。runtime.mjs:1187-1194）
#   英字を含むパス（/tmp/claude-1000/… 。「/1234567」のように数字だけのものは除かない）
BENIGN_NUMBERS = re.compile(
    r"(?<![0-9])(?:19|20)[0-9]{2}"
    r"(?:[-/.][0-9]{1,2}(?:[-/.][0-9]{1,2})?|年(?:[0-9]{1,2}月(?:[0-9]{1,2}日)?)?)(?![0-9])"
    r"|[A-Za-z0-9_./-]*\.[A-Za-z][A-Za-z0-9]*:[0-9]+(?:[-–,][0-9]+)*"
    r"|(?:~|\.{1,2})?/[A-Za-z0-9_.~-]*[A-Za-z][A-Za-z0-9_.~/-]*"
)

# 残高は「金額として書かれている」場合のみ弾く（¥ か 円 が同一行にある）
BALANCE_KEYWORD = re.compile(r"残高")
MONEY = re.compile(r"[0-9]{3,}[^\n]{0,10}[¥円]|[¥][^\n]{0,3}[0-9]{3,}")


def luhn_ok(digits: str) -> bool:
    """Luhn チェック。カード番号なら必ず通る。"""
    total = 0
    for i, ch in enumerate(reversed(digits)):
        n = int(ch)
        if i % 2 == 1:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    return total % 10 == 0


def find_violations(text: str, allow_balance: bool = False) -> list[str]:
    hits = []

    for m in CARD_CANDIDATE.finditer(URL.sub(" ", text)):
        digits = re.sub(r"[ -]", "", m.group())
        if 13 <= len(digits) <= 19 and luhn_ok(digits):
            hits.append(f"カード番号らしい数字列（下4桁 {digits[-4:]}）")

    for line in text.splitlines():
        if ACCOUNT_KEYWORD.search(line) and FOUR_DIGITS.search(BENIGN_NUMBERS.sub(" ", line)):
            hits.append(f"口座情報らしい行: {line.strip()[:40]}")
        if not allow_balance and BALANCE_KEYWORD.search(line) and MONEY.search(line):
            hits.append(f"残高らしい行: {line.strip()[:40]}")

    # 同じ指摘を重複させない
    return list(dict.fromkeys(hits))


def extract(tool_input: dict) -> tuple[str, str]:
    """(検査対象テキスト, 対象パス) を返す。検査不要なら ("", "")。"""
    path = tool_input.get("file_path", "")

    # data/ は .gitignore 済み。機密データの正規の置き場所なので検査しない
    if "/data/" in path or path.endswith("/data"):
        return "", ""

    if path.endswith(".md"):
        if "content" in tool_input:                      # Write
            return tool_input["content"], path
        if "new_string" in tool_input:                   # Edit
            return tool_input["new_string"], path
        if "edits" in tool_input:                        # MultiEdit
            return "\n".join(e.get("new_string", "") for e in tool_input["edits"]), path

    # ヒアドキュメント経由の書き込みを捕まえる
    command = tool_input.get("command", "")
    if command and ".md" in command:
        return command, "(Bash 経由の書き込み)"

    return "", ""


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        # 入力が読めないときは通さず止める（2026-10-19。以前は exit 0 で素通しだった。VS Code 設定見直し 2 回目の A9）
        print("sensitive-numbers-guard: 入力の JSON を読めなかったので止めました", file=sys.stderr)
        sys.exit(2)

    text, path = extract(payload.get("tool_input", {}))
    if not text:
        sys.exit(0)

    allow_balance = "--allow-balance" in sys.argv[1:]
    hits = find_violations(text, allow_balance)
    if not hits:
        sys.exit(0)

    reason = (
        f"機密の数字が含まれています（{path}）:\n"
        + "\n".join(f"  - {h}" for h in hits)
        + "\n\n口座番号・カード番号"
        + ("" if allow_balance else "・残高")
        + " は Markdown に書けません（各リポジトリの CLAUDE.md / 運用ルール参照）。"
        "\n集計結果や『下4桁以外は伏せる』形にするか、元データは Git 管理外（ops なら data/）に置いてください。"
    )

    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        },
        sys.stdout,
        ensure_ascii=False,
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
