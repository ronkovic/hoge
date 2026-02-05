#!/bin/bash
# tmux並列実行基盤: Orchestratorディスパッチループ
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <run_id> <max_workers>"
  exit 1
fi

RUN_ID="$1"
MAX_WORKERS="$2"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
QUEUE_DIR="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/queue"
TASK_PLAN="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/task_plan.json"
PROGRESS_FILE="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/progress.json"
PARENT_WORKTREE="${PROJECT_ROOT}/../worktrees/parent-${RUN_ID}"

# Draft PRメッセージ更新
update_draft_pr() {
  echo "📝 Updating Draft PR..."

  if [ ! -d "${PARENT_WORKTREE}" ]; then
    echo "⚠️  WARNING: Parent worktree not found at ${PARENT_WORKTREE}"
    return 1
  fi

  # 完了したタスクと残タスクを取得
  local completed_tasks=$(jq -r '.tasks[] | select(.status == "completed") | .task_id' "${PROGRESS_FILE}" 2>/dev/null || echo "")
  local pending_tasks=$(jq -r '.tasks[] | select(.status != "completed") | .task_id' "${PROGRESS_FILE}" 2>/dev/null || echo "")

  # 完了タスク一覧を生成
  local completed_list=""
  for task_id in $completed_tasks; do
    local task_title=$(jq -r ".tasks[] | select(.task_id == \"$task_id\") | .title" "$TASK_PLAN" 2>/dev/null || echo "Unknown")
    completed_list="${completed_list}- [x] ${task_id}: ${task_title}\n"
  done

  # 残タスク一覧を生成
  local pending_list=""
  for task_id in $pending_tasks; do
    local task_title=$(jq -r ".tasks[] | select(.task_id == \"$task_id\") | .title" "$TASK_PLAN" 2>/dev/null || echo "Unknown")
    pending_list="${pending_list}- [ ] ${task_id}: ${task_title}\n"
  done

  # 親Worktree内でPR更新
  cd "${PARENT_WORKTREE}"

  # PRが存在するかチェック
  if ! gh pr view --json number >/dev/null 2>&1; then
    echo "📝 Creating Draft PR..."
    local parent_branch=$(jq -r '.parent_branch' "$TASK_PLAN")
    local pr_title=$(jq -r '.title // "Feature implementation"' "$TASK_PLAN")

    gh pr create --draft \
      --title "$pr_title" \
      --body "## 概要\n\n進行中...\n" \
      --base main \
      --head "$parent_branch"

    if [ $? -ne 0 ]; then
      echo "❌ Failed to create Draft PR"
      cd -
      return 1
    fi
    echo "✅ Draft PR created"
  fi

  # 変更ファイル一覧（最大20件）
  local changed_files=$(git diff --name-only main...HEAD 2>/dev/null | head -20 | sed 's/^/- /' || echo "")

  # PRメッセージを更新
  gh pr edit --body "$(cat <<EOF
## 概要

$(jq -r '.description // "機能実装"' "$TASK_PLAN")

## 実装済みタスク

$(echo -e "$completed_list")

## 残タスク

$(echo -e "$pending_list")

## 変更ファイル

${changed_files}
EOF
)" 2>&1

  if [ $? -eq 0 ]; then
    echo "✅ Draft PR updated successfully"
  else
    echo "⚠️  WARNING: Failed to update Draft PR"
  fi

  cd -
}

# タスクブランチのクリーンアップ
cleanup_task_branches() {
  echo "🧹 Cleaning up task branches..."

  local parent_branch=$(jq -r '.parent_branch' "$TASK_PLAN")

  # 完了したタスクのブランチを削除
  for task_file in "${QUEUE_DIR}/completed"/*.json; do
    [ -e "$task_file" ] || continue

    local task_id=$(basename "$task_file" .json)
    local task_branch="${parent_branch}/${task_id}"

    # Worktree削除
    local wt_path="${PROJECT_ROOT}/../worktrees/wt-${task_id}"
    if [ -d "$wt_path" ]; then
      git worktree remove "$wt_path" --force 2>/dev/null || true
      echo "  ✅ Removed worktree: wt-${task_id}"
    fi

    # ローカルブランチ削除
    if git branch -d "$task_branch" 2>/dev/null; then
      echo "  ✅ Deleted branch: ${task_branch}"
    fi
  done

  # Draft PRをReady状態に変更
  echo "📝 Marking Draft PR as ready..."
  if [ -d "${PARENT_WORKTREE}" ]; then
    cd "${PARENT_WORKTREE}"
    gh pr ready 2>&1 || echo "⚠️  WARNING: Failed to mark PR as ready"
    cd -

    # 親Worktreeを削除
    git worktree remove "${PARENT_WORKTREE}" --force 2>/dev/null || true
    echo "  ✅ Removed parent worktree: parent-${RUN_ID}"
  fi

  echo "📌 Parent branch ready for review: ${parent_branch}"
}

# タスクプランが存在しない場合はエラー
if [ ! -f "${TASK_PLAN}" ]; then
  echo "❌ ERROR: task_plan.json not found at ${TASK_PLAN}"
  exit 1
fi

# 初期化: pending/にタスクを配置（再開モードの場合はスキップ）
if [ "${RESUME_MODE:-}" = "true" ]; then
  echo "🔄 再開モード: 既存のキュー状態を使用します"
  # pending/completed/failed の現在の状態を表示
  pending_count=$(find "${QUEUE_DIR}/pending" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  completed_count=$(find "${QUEUE_DIR}/completed" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  failed_count=$(find "${QUEUE_DIR}/failed" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  echo "  📊 現状: pending=${pending_count}, completed=${completed_count}, failed=${failed_count}"
else
  echo "📋 Initializing task queue..."
  jq -c '.tasks[]' "${TASK_PLAN}" | while read -r task; do
    task_id=$(echo "$task" | jq -r '.task_id')
    echo "$task" > "${QUEUE_DIR}/pending/${task_id}.json"
    echo "  - Queued: ${task_id}"
  done
fi

# 進捗ファイル初期化（再開モードの場合はスキップ）
if [ "${RESUME_MODE:-}" != "true" ]; then
  total_tasks=$(jq '.tasks | length' "${TASK_PLAN}")
  cat > "${PROGRESS_FILE}" <<EOF
{
  "run_id": "${RUN_ID}",
  "total_tasks": ${total_tasks},
  "pending": ${total_tasks},
  "running": 0,
  "completed": 0,
  "failed": 0,
  "start_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
else
  echo "🔄 再開モード: 既存の進捗ファイルを使用します"
  if [ ! -f "${PROGRESS_FILE}" ]; then
    echo "⚠️  WARNING: 進捗ファイルが見つかりません。新規作成します。"
    total_tasks=$(jq '.tasks | length' "${TASK_PLAN}")
    cat > "${PROGRESS_FILE}" <<EOF
{
  "run_id": "${RUN_ID}",
  "total_tasks": ${total_tasks},
  "pending": 0,
  "running": 0,
  "completed": 0,
  "failed": 0,
  "start_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
  fi
fi

echo "🚀 Orchestrator loop starting..."

# メインループ
while true; do
  # 完了チェック
  pending_count=$(find "${QUEUE_DIR}/pending" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  running_count=$(find "${QUEUE_DIR}/running" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  completed_count=$(find "${QUEUE_DIR}/completed" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  failed_count=$(find "${QUEUE_DIR}/failed" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')

  # 進捗更新
  jq --arg p "$pending_count" \
     --arg r "$running_count" \
     --arg c "$completed_count" \
     --arg f "$failed_count" \
     '.pending = ($p|tonumber) | .running = ($r|tonumber) | .completed = ($c|tonumber) | .failed = ($f|tonumber)' \
     "${PROGRESS_FILE}" > "${PROGRESS_FILE}.tmp" && mv "${PROGRESS_FILE}.tmp" "${PROGRESS_FILE}"

  # タスク完了時に Draft PR を更新
  if [ "$completed_count" -gt 0 ]; then
    # 前回の完了数と比較して、新たに完了したタスクがあれば更新
    prev_completed=$(jq -r '.prev_completed // 0' "${PROGRESS_FILE}")
    if [ "$completed_count" != "$prev_completed" ]; then
      update_draft_pr
      # 前回の完了数を記録
      jq --arg pc "$completed_count" '.prev_completed = ($pc|tonumber)' \
         "${PROGRESS_FILE}" > "${PROGRESS_FILE}.tmp" && mv "${PROGRESS_FILE}.tmp" "${PROGRESS_FILE}"
    fi
  fi

  # 全タスク完了チェック
  if [ "$pending_count" -eq 0 ] && [ "$running_count" -eq 0 ]; then
    echo "✅ All tasks completed!"

    # タスクブランチのクリーンアップ
    cleanup_task_branches

    jq '.end_time = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' "${PROGRESS_FILE}" \
      > "${PROGRESS_FILE}.tmp" && mv "${PROGRESS_FILE}.tmp" "${PROGRESS_FILE}"
    break
  fi

  # 実行可能なタスクをディスパッチ
  for task_file in "${QUEUE_DIR}/pending"/*.json; do
    [ -e "$task_file" ] || continue

    task_id=$(basename "$task_file" .json)

    # 依存関係チェック
    if ./.aad/scripts/dependency-resolver.sh "${RUN_ID}" "$task_id"; then
      # アイドルワーカーを探す
      for worker_file in "${QUEUE_DIR}/workers"/*.json; do
        worker_status=$(jq -r '.status' "$worker_file")
        if [ "$worker_status" = "idle" ]; then
          worker_id=$(jq -r '.worker_id' "$worker_file")
          echo "🔄 Dispatching ${task_id} to worker-${worker_id}"

          # タスクをrunningに移動
          mv "$task_file" "${QUEUE_DIR}/running/${task_id}.json"

          # ワーカーに割り当て
          jq --arg tid "$task_id" \
             '.status = "busy" | .current_task = $tid' \
             "$worker_file" > "${worker_file}.tmp" && mv "${worker_file}.tmp" "$worker_file"

          break
        fi
      done
    fi
  done

  # ポーリング間隔
  sleep 2
done

echo "🎉 Orchestrator loop finished"

