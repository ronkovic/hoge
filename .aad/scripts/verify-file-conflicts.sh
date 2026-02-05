#!/bin/bash
# tmux並列実行基盤: ファイル衝突検証スクリプト
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <run_id>"
  exit 1
fi

RUN_ID="$1"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TASK_PLAN="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/task_plan.json"

# タスクプランの存在確認
if [ ! -f "$TASK_PLAN" ]; then
  echo "❌ ERROR: task_plan.json not found at ${TASK_PLAN}"
  exit 1
fi

echo "🔍 Verifying file conflicts in task plan..."

# 推移的な依存関係をチェックする関数
check_transitive_dependency() {
  local task_id="$1"
  local target_task="$2"
  local visited="$3"

  # 循環参照防止
  if echo "$visited" | grep -q ",${task_id},"; then
    return 1
  fi

  # 直接依存をチェック
  local direct_deps=$(jq -r --arg tid "$task_id" '.tasks[] | select(.task_id == $tid) | .depends_on[]? // empty' "$TASK_PLAN")

  for dep in $direct_deps; do
    if [ "$dep" = "$target_task" ]; then
      return 0  # 見つかった
    fi

    # 再帰的にチェック
    if check_transitive_dependency "$dep" "$target_task" "${visited},${task_id},"; then
      return 0
    fi
  done

  return 1  # 見つからなかった
}

# 一時ファイルでファイル所有者を管理
FILE_OWNERS_TMP=$(mktemp)
ERROR_FLAG=$(mktemp)
trap "rm -f $FILE_OWNERS_TMP $ERROR_FLAG" EXIT

# タスクをpriority順に処理（プロセス置換でサブシェル問題を回避）
while IFS= read -r task_json; do
  # フィールド名は "task_id" を使用
  task_id=$(echo "$task_json" | jq -r '.task_id')

  # files_to_modify を配列として取得 (bash 3.x compatible)
  files_to_modify=()
  while IFS= read -r file; do
    files_to_modify+=("$file")
  done < <(echo "$task_json" | jq -r '.files_to_modify[]? // empty')

  if [ ${#files_to_modify[@]} -eq 0 ]; then
    continue
  fi

  # 各ファイルをチェック
  for file_path in "${files_to_modify[@]}"; do
    # 空の要素をスキップ
    if [ -z "$file_path" ]; then
      continue
    fi
    # このファイルが既に他のタスクに割り当てられているかチェック
    owner_task=$(grep "^${file_path}:" "$FILE_OWNERS_TMP" 2>/dev/null | cut -d: -f2 || echo "")

    if [ -n "$owner_task" ]; then
      # ファイル衝突を検出
      echo "⚠️  File conflict detected:"
      echo "    File: ${file_path}"
      echo "    Owner: ${owner_task}"
      echo "    Conflicting task: ${task_id}"

      # 直接的または推移的な依存関係をチェック
      if check_transitive_dependency "$task_id" "$owner_task" ","; then
        echo "✅ Dependency set (direct or transitive): ${task_id} depends on ${owner_task}"
      else
        echo "❌ ERROR: Task ${task_id} should depend on ${owner_task} but doesn't"
        echo "Please update task_plan.json to add this dependency"
        echo "1" > "$ERROR_FLAG"
      fi
    else
      # ファイルの所有者を記録
      echo "${file_path}:${task_id}" >> "$FILE_OWNERS_TMP"
    fi
  done
done < <(jq -r '.tasks | sort_by(.priority) | .[] | @json' "$TASK_PLAN")

# エラーがあった場合は終了
if [ -s "$ERROR_FLAG" ]; then
  echo ""
  echo "❌ File conflict verification failed"
  exit 1
fi

echo "✅ File conflict verification passed"
exit 0

