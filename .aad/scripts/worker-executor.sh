#!/bin/bash
# tmux並列実行基盤: ワーカー実行ループ
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <run_id> <worker_id>"
  exit 1
fi

RUN_ID="$1"
WORKER_ID="$2"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
QUEUE_DIR="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/queue"
WORKER_FILE="${QUEUE_DIR}/workers/worker-${WORKER_ID}.json"
MAX_RETRIES=3
MERGE_LOCK_FILE="${QUEUE_DIR}/.merge.lock"
LOCK_TIMEOUT=300  # 5分タイムアウト
LOG_FILE="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/worker-${WORKER_ID}.log"

# 親ブランチ情報を取得
get_parent_branch() {
  local task_plan="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/task_plan.json"
  jq -r '.parent_branch' "$task_plan"
}

# マージロック取得
acquire_merge_lock() {
  local task_id="$1"
  local wait_count=0

  echo "🔒 Acquiring merge lock for ${task_id}..."

  while [ -f "$MERGE_LOCK_FILE" ]; do
    # タイムアウトチェック
    if [ "$wait_count" -ge "$LOCK_TIMEOUT" ]; then
      echo "⚠️  Lock timeout, force acquiring..."
      break
    fi

    # ロック所有者を表示
    local owner=$(cat "$MERGE_LOCK_FILE" 2>/dev/null || echo "unknown")
    echo "  ⏳ Waiting for lock (held by ${owner})... ${wait_count}s"

    sleep 1
    wait_count=$((wait_count + 1))
  done

  # ロック取得
  echo "${task_id}" > "$MERGE_LOCK_FILE"
  echo "🔓 Lock acquired for ${task_id}"
}

# マージロック解放
release_merge_lock() {
  rm -f "$MERGE_LOCK_FILE"
  echo "🔓 Lock released"
}

# マージコンフリクトを自動修正
resolve_merge_conflict() {
  local task_id="$1"
  local conflict_type="$2"  # "dependency" or "parent"

  echo "🔧 Resolving merge conflict for ${task_id} (${conflict_type})..."

  # コンフリクトしているファイルを取得
  local conflicted_files=$(git diff --name-only --diff-filter=U)

  if [ -z "$conflicted_files" ]; then
    return 0
  fi

  # Claude CLIでコンフリクト解決
  claude \
    --settings "./.aad/settings/settings.json" \
    --allowedTools "Read,Write,Edit,Glob,Grep,Bash" \
    -p "マージコンフリクトを解決してください。

コンフリクトタイプ: ${conflict_type}
Task ID: ${task_id}

コンフリクトしているファイル:
${conflicted_files}

実行内容:
1. 各コンフリクトファイルを読み込む
2. コンフリクトマーカー（<<<<<<< HEAD, =======, >>>>>>>）を解決
3. 両方の変更を適切にマージする
4. コンフリクトマーカーを削除

注意: 機能を壊さないように注意してください。" 2>&1 | tee -a "$LOG_FILE"

  # 解決後、ステージング
  git add .

  # コンフリクトが残っているかチェック
  if git diff --name-only --diff-filter=U | grep -q .; then
    echo "❌ Failed to resolve all conflicts"
    return 1
  fi

  echo "✅ Conflict resolved for ${task_id}"
  return 0
}

# 依存タスクの変更を取り込み
fetch_dependency_changes() {
  local task_id="$1"
  local worktree_dir="$2"

  local parent_branch=$(get_parent_branch)

  echo "📥 Fetching dependency changes for ${task_id}..."

  cd "$worktree_dir" || return 1

  # 親ブランチの最新を取得してマージ
  if git merge "$parent_branch" --no-edit 2>/dev/null; then
    echo "✅ Fetched latest changes from ${parent_branch}"
  else
    echo "⚠️  Merge conflict detected, attempting auto-resolve..."
    if resolve_merge_conflict "$task_id" "dependency"; then
      git commit --no-edit
      echo "✅ Dependency merge completed with auto-resolved conflicts"
    else
      git merge --abort
      return 1
    fi
  fi

  return 0
}

# タスクブランチを親ブランチにマージ
merge_task_to_parent() {
  local task_id="$1"
  local worktree_dir="$2"

  local parent_branch=$(get_parent_branch)
  local task_branch=$(git -C "$worktree_dir" branch --show-current)

  # 排他制御: マージロック取得
  acquire_merge_lock "$task_id"

  echo "🔀 Merging ${task_branch} into ${parent_branch}..."

  # 親ブランチ用worktreeのパス
  local parent_worktree="${PROJECT_ROOT}/../worktrees/parent-${RUN_ID}"

  # 親ブランチ用worktreeが存在しない場合は作成
  if [ ! -d "$parent_worktree" ]; then
    echo "📂 Creating parent branch worktree..."
    git -C "$PROJECT_ROOT" worktree add "$parent_worktree" "$parent_branch"
  fi

  # 親ブランチworktreeに移動してマージ
  cd "$parent_worktree" || { release_merge_lock; return 1; }

  # 最新の状態に更新
  git pull --ff-only 2>/dev/null || true

  # マージ前に untracked files をクリーンアップ（テンプレートファイルなど）
  if [ -n "$(git status --porcelain)" ]; then
    echo "🧹 Cleaning up untracked files in parent worktree..."
    git add -A
    git commit -m "chore: add template files before merge" 2>/dev/null || true
  fi

  # タスクブランチをマージ
  if git merge --no-ff "$task_branch" -m "Merge ${task_id}: completed"; then
    echo "✅ Merged ${task_id} into ${parent_branch}"
  else
    echo "⚠️  Merge conflict detected, attempting auto-resolve..."
    if resolve_merge_conflict "$task_id" "parent"; then
      git commit --no-edit -m "Merge ${task_id}: completed (conflict resolved)"
      echo "✅ Merged ${task_id} with auto-resolved conflicts"
    else
      git merge --abort
      release_merge_lock
      return 1
    fi
  fi

  release_merge_lock
  return 0
}

# タスク実行関数
execute_task() {
  local task_id="$1"
  local worktree_dir="$2"

  echo "📝 Starting task execution: ${task_id}"
  echo "📂 Worktree: ${worktree_dir}"

  # Worktreeが存在しない場合はエラー
  if [ ! -d "$worktree_dir" ]; then
    echo "❌ ERROR: Worktree not found: ${worktree_dir}"
    return 1
  fi

  # Worktreeディレクトリに移動
  cd "$worktree_dir" || {
    echo "❌ ERROR: Failed to cd to worktree"
    return 1
  }

  # タスク情報を読み取り
  local task_title=$(jq -r '.title' "$TASK_FILE")
  local task_type=$(jq -r '.type' "$TASK_FILE")
  local task_description=$(jq -r '.description' "$TASK_FILE")

  echo "  Title: ${task_title}"
  echo "  Type: ${task_type}"

  # 環境変数を設定（エージェントが参照）
  export RUN_ID="${RUN_ID}"
  export TASK_ID="${task_id}"
  export WORKER_ID="${WORKER_ID}"
  export TASK_TITLE="${task_title}"
  export TASK_TYPE="${task_type}"
  export TASK_DESCRIPTION="${task_description}"

  # タスク実行スクリプトを呼び出し
  # NOTE: 実際のエージェント呼び出しはこのスクリプト内で行う
  if [ -f "${PROJECT_ROOT}/.aad/scripts/task-executor.sh" ]; then
    "${PROJECT_ROOT}/.aad/scripts/task-executor.sh" "$task_id" "$worktree_dir"
    local exit_code=$?

    # Worktreeから元のディレクトリに戻る
    cd "$PROJECT_ROOT" || true

    return $exit_code
  else
    echo "⚠️  WARNING: task-executor.sh not found, using simplified execution"

    # Simplified execution（task-executor.shがない場合）
    # 1. Tester: テスト作成（Red）
    echo "🧪 Phase: Tester (Red)"
    # TODO: testerエージェント呼び出し

    # 2. Implementer: 実装（Green）
    echo "🔧 Phase: Implementer (Green)"
    # TODO: implementerエージェント呼び出し

    # 3. Tester: テスト検証
    echo "✅ Phase: Tester (Verify)"
    # TODO: testerエージェント呼び出し

    # 4. Reviewer: コードレビュー
    echo "👀 Phase: Reviewer"
    # TODO: reviewerエージェント呼び出し

    # 5. GitHub Manager: コミット&PR
    echo "🚀 Phase: GitHub Manager"
    # TODO: github-managerエージェント呼び出し

    # 仮の成功
    cd "$PROJECT_ROOT" || true
    return 0
  fi
}

echo "🤖 Worker ${WORKER_ID} started"

# ワーカーループ
while true; do
  # 現在の状態を取得
  if [ ! -f "$WORKER_FILE" ]; then
    echo "❌ ERROR: Worker file not found: ${WORKER_FILE}"
    exit 1
  fi

  worker_status=$(jq -r '.status' "$WORKER_FILE")
  current_task=$(jq -r '.current_task' "$WORKER_FILE")

  # タスクが割り当てられている場合
  if [ "$worker_status" = "busy" ] && [ "$current_task" != "null" ]; then
    TASK_FILE="${QUEUE_DIR}/running/${current_task}.json"

    if [ ! -f "$TASK_FILE" ]; then
      echo "⚠️  WARNING: Task file not found: ${TASK_FILE}"
      # ワーカーをアイドルに戻す
      jq '.status = "idle" | .current_task = null' "$WORKER_FILE" \
        > "${WORKER_FILE}.tmp" && mv "${WORKER_FILE}.tmp" "$WORKER_FILE"
      continue
    fi

    echo "📝 Worker ${WORKER_ID} executing: ${current_task}"

    # タスク情報を取得
    task_title=$(jq -r '.title' "$TASK_FILE")
    retry_count=$(jq -r '.retry_count // 0' "$TASK_FILE")

    # Worktreeディレクトリ
    WORKTREE_DIR="${PROJECT_ROOT}/../worktrees/wt-${current_task}"

    # 実行前の準備
    jq '.status = "running" | .worker_id = "'${WORKER_ID}'" | .start_time = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
      "$TASK_FILE" > "${TASK_FILE}.tmp" && mv "${TASK_FILE}.tmp" "$TASK_FILE"

    # 依存タスクの実装を取り込み
    fetch_dependency_changes "$current_task" "$WORKTREE_DIR"

    # タスク実行 (implementerエージェント呼び出し)
    # MEMO: 実際にはClaude CLIを使ってimplementerを起動
    # 仮実装としてダミーコマンドを実行
    if execute_task "$current_task" "$WORKTREE_DIR"; then
      # 成功: completedに移動
      echo "✅ Worker ${WORKER_ID} completed: ${current_task}"

      # タスクブランチを親ブランチにマージ
      merge_task_to_parent "$current_task" "$WORKTREE_DIR"

      jq '.status = "completed" | .end_time = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
        "$TASK_FILE" > "${TASK_FILE}.tmp" && mv "${TASK_FILE}.tmp" "$TASK_FILE"
      mv "$TASK_FILE" "${QUEUE_DIR}/completed/${current_task}.json"
    else
      # 失敗: リトライまたはfailedに移動
      retry_count=$((retry_count + 1))
      echo "❌ Worker ${WORKER_ID} failed: ${current_task} (retry ${retry_count}/${MAX_RETRIES})"

      if [ "$retry_count" -lt "$MAX_RETRIES" ]; then
        # リトライ: pendingに戻す
        jq '.status = "pending" | .retry_count = '${retry_count} \
          "$TASK_FILE" > "${TASK_FILE}.tmp" && mv "${TASK_FILE}.tmp" "$TASK_FILE"
        mv "$TASK_FILE" "${QUEUE_DIR}/pending/${current_task}.json"
      else
        # 最大リトライ回数到達: failedに移動
        jq '.status = "failed" | .retry_count = '${retry_count}' | .end_time = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
          "$TASK_FILE" > "${TASK_FILE}.tmp" && mv "${TASK_FILE}.tmp" "$TASK_FILE"
        mv "$TASK_FILE" "${QUEUE_DIR}/failed/${current_task}.json"
      fi
    fi

    # ワーカーをアイドルに戻す
    jq '.status = "idle" | .current_task = null' "$WORKER_FILE" \
      > "${WORKER_FILE}.tmp" && mv "${WORKER_FILE}.tmp" "$WORKER_FILE"
  fi

  # ポーリング間隔
  sleep 1
done

