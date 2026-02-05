#!/bin/bash
# tmux並列実行基盤: 進捗監視ダッシュボード
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <run_id>"
  exit 1
fi

RUN_ID="$1"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
QUEUE_DIR="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/queue"
PROGRESS_FILE="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/progress.json"

echo "📊 Progress Dashboard for run_id: ${RUN_ID}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

while true; do
  # ターミナルクリア
  clear

  echo "📊 Progress Dashboard for run_id: ${RUN_ID}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  if [ ! -f "$PROGRESS_FILE" ]; then
    echo "⚠️  Waiting for progress file..."
    sleep 2
    continue
  fi

  # 進捗情報を表示
  total=$(jq -r '.total_tasks' "$PROGRESS_FILE")
  pending=$(jq -r '.pending' "$PROGRESS_FILE")
  running=$(jq -r '.running' "$PROGRESS_FILE")
  completed=$(jq -r '.completed' "$PROGRESS_FILE")
  failed=$(jq -r '.failed' "$PROGRESS_FILE")
  start_time=$(jq -r '.start_time' "$PROGRESS_FILE")
  end_time=$(jq -r '.end_time // "running"' "$PROGRESS_FILE")

  echo "📋 Total Tasks: ${total}"
  echo "⏳ Pending:     ${pending}"
  echo "🔄 Running:     ${running}"
  echo "✅ Completed:   ${completed}"
  echo "❌ Failed:      ${failed}"
  echo ""
  echo "🕐 Start Time:  ${start_time}"
  echo "🕑 End Time:    ${end_time}"
  echo ""

  # 進捗バー
  if [ "$total" -gt 0 ]; then
    progress=$((completed * 100 / total))
    bar_length=50
    filled_length=$((progress * bar_length / 100))
    bar=$(printf "%${filled_length}s" | tr ' ' '█')
    empty=$(printf "%$((bar_length - filled_length))s" | tr ' ' '░')
    echo "Progress: [${bar}${empty}] ${progress}%"
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # ワーカー状態を表示
  echo "🤖 Worker Status:"
  echo ""
  for worker_file in "${QUEUE_DIR}/workers"/*.json; do
    [ -e "$worker_file" ] || continue
    worker_id=$(jq -r '.worker_id' "$worker_file")
    worker_status=$(jq -r '.status' "$worker_file")
    current_task=$(jq -r '.current_task' "$worker_file")

    if [ "$worker_status" = "busy" ]; then
      echo "  Worker-${worker_id}: 🔄 ${worker_status} (${current_task})"
    else
      echo "  Worker-${worker_id}: 💤 ${worker_status}"
    fi
  done

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # 実行中タスクの詳細
  if [ "$running" -gt 0 ]; then
    echo "🔄 Running Tasks:"
    echo ""
    for task_file in "${QUEUE_DIR}/running"/*.json; do
      [ -e "$task_file" ] || continue
      task_id=$(basename "$task_file" .json)
      task_title=$(jq -r '.title' "$task_file")
      echo "  - ${task_id}: ${task_title}"
    done
    echo ""
  fi

  # 失敗タスクの詳細
  if [ "$failed" -gt 0 ]; then
    echo "❌ Failed Tasks:"
    echo ""
    for task_file in "${QUEUE_DIR}/failed"/*.json; do
      [ -e "$task_file" ] || continue
      task_id=$(basename "$task_file" .json)
      task_title=$(jq -r '.title' "$task_file")
      retry_count=$(jq -r '.retry_count // 0' "$task_file")
      echo "  - ${task_id}: ${task_title} (retries: ${retry_count})"
    done
    echo ""
  fi

  echo "🔄 Refreshing in 2 seconds... (Ctrl+C to exit)"

  # 更新間隔
  sleep 2
done

