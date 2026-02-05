#!/bin/bash
# validate-command.sh - Bashコマンド実行前の検証フック

# 標準入力からJSON形式のツール入力を読み取る
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# コマンドが空の場合は許可
if [ -z "$COMMAND" ]; then
  exit 0
fi

# mainブランチでの直接コミット禁止
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
if [ "$CURRENT_BRANCH" = "main" ] && echo "$COMMAND" | grep -qE 'git commit'; then
  echo "BLOCKED: mainブランチでの直接コミットは禁止されています" >&2
  exit 2
fi

# 強制pushの検出(denyで漏れた場合のバックアップ)
if echo "$COMMAND" | grep -qE 'git push.*(--force|-f)'; then
  echo "BLOCKED: 強制pushは禁止されています" >&2
  exit 2
fi

# 危険なrm -rfコマンドの追加検出
if echo "$COMMAND" | grep -qE 'rm\s+-rf\s+(/|~|\.\.)'; then
  echo "BLOCKED: 危険なrm -rfコマンドが検出されました" >&2
  exit 2
fi

# 許可
exit 0
