#!/bin/bash
# tmux並列実行基盤: 依存関係解決
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <run_id> <task_id>"
  exit 1
fi

RUN_ID="$1"
TASK_ID="$2"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
QUEUE_DIR="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/queue"

# タスクファイルの場所を特定
TASK_FILE=""
for dir in pending running completed failed; do
  if [ -f "${QUEUE_DIR}/${dir}/${TASK_ID}.json" ]; then
    TASK_FILE="${QUEUE_DIR}/${dir}/${TASK_ID}.json"
    break
  fi
done

if [ -z "$TASK_FILE" ]; then
  echo "❌ ERROR: Task ${TASK_ID} not found in queue" >&2
  exit 1
fi

# 依存タスクのリストを取得
depends_on=$(jq -r '.depends_on // [] | .[]' "$TASK_FILE")

# 依存タスクがない場合は実行可能
if [ -z "$depends_on" ]; then
  exit 0
fi

# 全ての依存タスクが完了しているかチェック
all_completed=true
for dep_task in $depends_on; do
  if [ ! -f "${QUEUE_DIR}/completed/${dep_task}.json" ]; then
    # 依存タスクが完了していない
    all_completed=false

    # 失敗している場合は警告
    if [ -f "${QUEUE_DIR}/failed/${dep_task}.json" ]; then
      echo "⚠️  WARNING: Dependency ${dep_task} has failed for task ${TASK_ID}" >&2
    fi
  fi
done

if [ "$all_completed" = true ]; then
  exit 0
else
  exit 1
fi

