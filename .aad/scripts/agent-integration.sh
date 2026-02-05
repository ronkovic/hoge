#!/bin/bash
# tmux並列実行基盤: エージェント統合ヘルパー
#
# このスクリプトは、実際のエージェント呼び出しをラップし、
# task-executor.shから使用されます。
#
# 使用方法:
#   source scripts/agent-integration.sh
#   call_agent "tester" "red" "$TASK_ID"

set -euo pipefail

# エージェント呼び出し設定
AGENT_CALL_METHOD="${AGENT_CALL_METHOD:-claude-cli}"  # claude-cli | api | custom

# Claude CLIでエージェントを呼び出す
call_agent_claude_cli() {
  local agent_name="$1"
  local phase="$2"
  local task_id="$3"

  echo "📞 Calling agent: ${agent_name} (phase: ${phase})"

  # Claude CLIの呼び出し例
  # 実際の実装では、プロジェクトの構成に応じて調整してください

  case "$agent_name" in
    tester)
      # testerエージェントを呼び出し
      # claude --agent tester --phase "$phase" --task-id "$task_id"
      echo "  → claude --agent tester --phase ${phase} --task-id ${task_id}"
      ;;

    implementer)
      # implementerエージェントを呼び出し
      # claude --agent implementer --phase "$phase" --task-id "$task_id"
      echo "  → claude --agent implementer --phase ${phase} --task-id ${task_id}"
      ;;

    reviewer)
      # reviewerエージェントを呼び出し
      # claude --agent reviewer --task-id "$task_id"
      echo "  → claude --agent reviewer --task-id ${task_id}"
      ;;

    github-manager)
      # github-managerエージェントを呼び出し
      # claude --agent github-manager --action "$phase" --task-id "$task_id"
      echo "  → claude --agent github-manager --action ${phase} --task-id ${task_id}"
      ;;

    *)
      echo "❌ ERROR: Unknown agent: ${agent_name}"
      return 1
      ;;
  esac

  # TODO: 実際のClaude CLI呼び出しを実装
  # 現時点では、手動実行が必要です
  return 0
}

# Anthropic APIでエージェントを呼び出す
call_agent_api() {
  local agent_name="$1"
  local phase="$2"
  local task_id="$3"

  echo "📞 Calling agent via API: ${agent_name} (phase: ${phase})"

  # Anthropic APIの呼び出し例
  # curl を使用したAPI呼び出しの実装

  local api_key="${ANTHROPIC_API_KEY:-}"
  if [ -z "$api_key" ]; then
    echo "❌ ERROR: ANTHROPIC_API_KEY is not set"
    return 1
  fi

  # TODO: 実際のAPI呼び出しを実装
  echo "  → API call to ${agent_name}"
  return 0
}

# カスタムエージェント呼び出し
call_agent_custom() {
  local agent_name="$1"
  local phase="$2"
  local task_id="$3"

  echo "📞 Calling custom agent: ${agent_name} (phase: ${phase})"

  # カスタム実装のプレースホルダー
  # プロジェクト固有のエージェント呼び出し方法を実装

  case "$agent_name" in
    tester)
      # カスタムtester実装
      # ./custom-scripts/run-tester.sh "$phase" "$task_id"
      ;;
    implementer)
      # カスタムimplementer実装
      # ./custom-scripts/run-implementer.sh "$phase" "$task_id"
      ;;
    *)
      echo "❌ ERROR: Custom agent not implemented: ${agent_name}"
      return 1
      ;;
  esac

  return 0
}

# メインのエージェント呼び出し関数
call_agent() {
  local agent_name="$1"
  local phase="$2"
  local task_id="$3"

  case "$AGENT_CALL_METHOD" in
    claude-cli)
      call_agent_claude_cli "$agent_name" "$phase" "$task_id"
      ;;
    api)
      call_agent_api "$agent_name" "$phase" "$task_id"
      ;;
    custom)
      call_agent_custom "$agent_name" "$phase" "$task_id"
      ;;
    *)
      echo "❌ ERROR: Unknown AGENT_CALL_METHOD: ${AGENT_CALL_METHOD}"
      return 1
      ;;
  esac
}

# エージェント呼び出しが成功したかチェック
check_agent_result() {
  local agent_name="$1"
  local expected_output="$2"

  # 実装例: エージェントの出力ファイルをチェック
  # if [ -f ".aad/agent-output/${agent_name}.json" ]; then
  #   # 出力を検証
  #   return 0
  # else
  #   return 1
  # fi

  return 0
}

# このスクリプトがsourceされた場合のみ関数をエクスポート
if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  export -f call_agent
  export -f check_agent_result
fi

