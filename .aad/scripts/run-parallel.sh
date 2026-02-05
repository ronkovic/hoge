#!/bin/bash
# run-parallel.sh - tmux並列実行の自動化スクリプト
# Usage: ./.aad/scripts/run-parallel.sh <requirement_file> [num_workers] [options]

set -euo pipefail

# プロジェクトルートの取得
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
export PROJECT_ROOT

# ヘルプ表示
show_help() {
  cat << EOF
Usage: ./.aad/scripts/run-parallel.sh <requirement_file> [num_workers] [options]

Arguments:
  requirement_file  要件定義ファイルのパス (デフォルト: sample_requirement.md)
  num_workers       並列ワーカー数 (デフォルト: 3, 最大: 8)

Options:
  --help, -h        このヘルプメッセージを表示
  --dry-run         実行せずに計画のみ表示
  --no-cleanup      完了後もWorktreeを残す
  --attach          tmuxセッションにアタッチ
  --background      バックグラウンド実行

Examples:
  ./.aad/scripts/run-parallel.sh sample_requirement.md            # デフォルト3ワーカーで実行
  ./.aad/scripts/run-parallel.sh sample_requirement.md 4          # 4ワーカーで実行
  ./.aad/scripts/run-parallel.sh sample_requirement.md 2 --attach # 2ワーカー、セッションにアタッチ
  ./.aad/scripts/run-parallel.sh --help                           # ヘルプ表示

Environment Variables:
  AAD_MAX_WORKERS   最大ワーカー数 (デフォルト: 8)

EOF
  exit 0
}

# オプション処理
DRY_RUN=false
NO_CLEANUP=false
ATTACH=false
BACKGROUND=false

# 引数パース
REQUIREMENT_FILE=""
NUM_WORKERS="4"

while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      show_help
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-cleanup)
      NO_CLEANUP=true
      shift
      ;;
    --attach)
      ATTACH=true
      shift
      ;;
    --background)
      BACKGROUND=true
      shift
      ;;
    *)
      if [ -z "$REQUIREMENT_FILE" ]; then
        REQUIREMENT_FILE="$1"
      elif [ "$1" -eq "$1" ] 2>/dev/null; then
        NUM_WORKERS="$1"
      else
        echo "❌ ERROR: 不明なオプション: $1"
        show_help
      fi
      shift
      ;;
  esac
done

# デフォルト値設定
REQUIREMENT_FILE="${REQUIREMENT_FILE:-sample_requirement.md}"

# ワーカー数のバリデーション
MAX_WORKERS_LIMIT="${AAD_MAX_WORKERS:-8}"
if [ "$NUM_WORKERS" -gt "$MAX_WORKERS_LIMIT" ]; then
  echo "⚠️  WARNING: ワーカー数が上限を超えています。${MAX_WORKERS_LIMIT}に制限します。"
  NUM_WORKERS="$MAX_WORKERS_LIMIT"
fi

# エラーハンドリング
trap 'echo "❌ エラーが発生しました (exit code: $?)"; exit 1' ERR

# 前提条件チェック
check_prerequisites() {
  echo "🔍 前提条件チェック中..."

  if ! command -v tmux >/dev/null 2>&1; then
    echo "❌ ERROR: tmux が見つかりません。インストールしてください。"
    exit 1
  fi

  if ! command -v jq >/dev/null 2>&1; then
    echo "❌ ERROR: jq が見つかりません。インストールしてください。"
    exit 1
  fi

  if ! command -v git >/dev/null 2>&1; then
    echo "❌ ERROR: git が見つかりません。インストールしてください。"
    exit 1
  fi

  if ! command -v claude >/dev/null 2>&1; then
    echo "❌ ERROR: claude CLI が見つかりません。インストールしてください。"
    exit 1
  fi

  if [ ! -f "$REQUIREMENT_FILE" ]; then
    echo "❌ ERROR: 要件ファイルが見つかりません: ${REQUIREMENT_FILE}"
    exit 1
  fi

  echo "✅ 前提条件チェック完了"
}

# 要件定義タイトルを抽出
extract_requirement_title() {
  local req_file="$1"

  if [ ! -f "$req_file" ]; then
    echo "default"
    return
  fi

  # 最初の # 見出しを抽出
  local title=$(grep -m 1 '^# ' "$req_file" | sed 's/^# *//' | head -n 1)

  if [ -z "$title" ]; then
    echo "default"
    return
  fi

  # サニタイズ: 小文字化、スペース→ハイフン、特殊文字除去
  echo "$title" | \
    tr '[:upper:]' '[:lower:]' | \
    tr ' ' '-' | \
    tr -s '-' | \
    sed 's/[^a-z0-9-]//g' | \
    sed 's/^-*//;s/-*$//'
}

# 初期化
initialize() {
  echo "🚀 初期化中..."

  # run_id生成: タイトル_タイムスタンプ
  local req_title=$(extract_requirement_title "${REQUIREMENT_FILE}")
  local timestamp=$(date +%Y%m%d_%H%M%S)
  RUN_ID="${req_title}_${timestamp}"
  export RUN_ID

  # ディレクトリ作成
  DOCS_DIR=".aad/docs/${RUN_ID}"
  mkdir -p "${DOCS_DIR}"

  # 実行開始時刻を記録
  START_TIME=$(date +%s)
  export START_TIME

  echo "📂 Run ID: ${RUN_ID}"
  echo "📂 ドキュメントディレクトリ: ${DOCS_DIR}"
  echo "👷 ワーカー数: ${NUM_WORKERS}"
}

# テンプレートをworktreeにコピーする関数
copy_templates() {
  local target_dir="$1"

  echo "  📋 テンプレートをコピー中: ${target_dir}"

  # CLAUDE.md をコピー
  cp "${PROJECT_ROOT}/.aad/templates/CLAUDE.md" "${target_dir}/CLAUDE.md"

  # .claude/ をコピー（agents, rules, skills, hooks を含む）
  cp -r "${PROJECT_ROOT}/.aad/templates/.claude" "${target_dir}/.claude"

  # settings.json をコピー
  mkdir -p "${target_dir}/.aad/settings"
  cp "${PROJECT_ROOT}/.aad/templates/settings.json" "${target_dir}/.aad/settings/settings.json"

  echo "  ✅ テンプレートコピー完了"
}

# 親ブランチ作成 + 親worktree作成
create_parent_branch() {
  echo "🌳 親ブランチ & 親worktree作成中..."

  # gitリポジトリが初期化されているか確認
  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "  ⚠️  gitリポジトリが初期化されていません。初期化します..."
    git init 2>&1 | sed 's/^/  /'
    echo "  ✅ gitリポジトリ初期化完了"
  fi

  # コミットが存在するか確認
  if ! git rev-parse HEAD >/dev/null 2>&1; then
    echo "  ⚠️  初期コミットが存在しません。自動作成します..."
    # .gitkeep を作成して初期コミット
    touch .gitkeep
    git add .gitkeep
    git commit -m "Initial commit" --allow-empty 2>&1 | sed 's/^/  /'
    echo "  ✅ 初期コミット作成完了"
  fi

  # ブランチ名: feature/{RUN_ID}
  PARENT_BRANCH="feature/${RUN_ID}"
  export PARENT_BRANCH

  # 親worktreeパス
  PARENT_WORKTREE="../worktrees/parent-${RUN_ID}"
  export PARENT_WORKTREE

  # 現在のブランチを保存（参照用）
  ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  export ORIGINAL_BRANCH

  # 親ブランチを作成してworktreeとして展開
  # 注: 現在のブランチ（main または master）から分岐
  git worktree add "${PARENT_WORKTREE}" -b "${PARENT_BRANCH}" "${ORIGINAL_BRANCH}" 2>&1 | sed 's/^/  /'

  # テンプレートをコピー
  copy_templates "${PARENT_WORKTREE}"

  echo "✅ 親ブランチ & worktree作成完了: ${PARENT_BRANCH}"
  echo "   親worktree: ${PARENT_WORKTREE}"
  echo "   (現在のブランチ: ${ORIGINAL_BRANCH} - 変更なし)"
}

# splitter呼び出し
run_splitter() {
  echo "📋 タスク分割中 (splitter)..."

  if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] splitterエージェント呼び出しをスキップ"
    # dry-runモードでは仮のtask_plan.jsonをメインに作成
    mkdir -p ".aad/docs/${RUN_ID}"
    cat > ".aad/docs/${RUN_ID}/task_plan.json" << EOF
{
  "run_id": "${RUN_ID}",
  "parent_branch": "${PARENT_BRANCH}",
  "tasks": [
    {
      "task_id": "task-1",
      "title": "Example Task 1",
      "files_to_modify": ["test/file1.go"],
      "depends_on": [],
      "priority": 1
    },
    {
      "task_id": "task-2",
      "title": "Example Task 2",
      "files_to_modify": ["test/file2.go"],
      "depends_on": [],
      "priority": 2
    }
  ]
}
EOF
  else
    # 親worktreeに移動
    cd "${PARENT_WORKTREE}"

    # 親worktree内に .aad/docs/${RUN_ID}/ を作成
    mkdir -p ".aad/docs/${RUN_ID}"

    # 要件ファイル/ディレクトリを親worktreeにコピー
    REQ_TARGET_PATH=""
    if [ -f "${PROJECT_ROOT}/${REQUIREMENT_FILE}" ]; then
      # ファイルの場合
      cp "${PROJECT_ROOT}/${REQUIREMENT_FILE}" ".aad/docs/${RUN_ID}/requirements.md"
      REQ_TARGET_PATH=".aad/docs/${RUN_ID}/requirements.md"
      echo "  📋 要件ファイルをコピーしました: requirements.md"
    elif [ -d "${PROJECT_ROOT}/${REQUIREMENT_FILE}" ]; then
      # ディレクトリの場合
      cp -r "${PROJECT_ROOT}/${REQUIREMENT_FILE}" ".aad/docs/${RUN_ID}/requirements/"
      REQ_TARGET_PATH=".aad/docs/${RUN_ID}/requirements/"
      echo "  📋 要件ディレクトリをコピーしました: requirements/"
    else
      echo "  ❌ ERROR: 要件ファイル/ディレクトリが見つかりません: ${REQUIREMENT_FILE}"
      cd "${PROJECT_ROOT}"
      exit 1
    fi

    # 親worktree内で claude 実行（.claude/ と CLAUDE.md はここにある）
    claude \
      --settings "./.aad/settings/settings.json" \
      --allowedTools "Read,Write,Edit,Glob,Grep,Bash" \
      -p "splitterエージェントとして、以下の要件を分割してください:

要件: ${REQ_TARGET_PATH}
Run ID: ${RUN_ID}
親ブランチ: ${PARENT_BRANCH}

以下の手順を実行してください:
1. 要件ファイル/ディレクトリを読み込む（ディレクトリの場合は配下のファイルを全て読む）
2. タスクに分割し、task_plan.json を .aad/docs/${RUN_ID}/ に生成
   task_plan.jsonのフォーマット:
   {
     \"run_id\": \"${RUN_ID}\",
     \"parent_branch\": \"${PARENT_BRANCH}\",
     \"tasks\": [
       {
         \"task_id\": \"task-001\",  // ⚠️ 必ず \"task_id\" を使用してください（\"id\" ではない）
         \"title\": \"タスクのタイトル\",
         \"description\": \"詳細な説明\",
         \"files_to_modify\": [\"file1.js\", \"file2.js\"],
         \"depends_on\": [\"task-000\"],
         \"priority\": 1
       }
     ]
   }
3. 各タスクの files_to_modify を明確にする
4. 依存関係 (depends_on) を設定する
   ⚠️  重要: 同じファイルを変更する複数のタスクがある場合、必ず後のタスクを前のタスクに依存させてください
   これにより、ファイル衝突を防ぎます
5. priority を設定する

完了したら task_plan.json の生成を確認して終了してください。" 2>&1 | sed 's/^/  /'

    # ========================================
    # 重要: task_plan.json をメインにコピー
    # ========================================
    # 理由: その後の create_worktrees() などはメインから実行され、
    #       $TASK_PLAN（メインの .aad/docs/${RUN_ID}/task_plan.json）を参照するため
    if [ -f ".aad/docs/${RUN_ID}/task_plan.json" ]; then
      mkdir -p "${PROJECT_ROOT}/.aad/docs/${RUN_ID}"
      cp ".aad/docs/${RUN_ID}/task_plan.json" "${PROJECT_ROOT}/.aad/docs/${RUN_ID}/"
      echo "  ✅ task_plan.json をメインプロジェクトにコピーしました"
    fi

    # メインプロジェクトに戻る
    cd "${PROJECT_ROOT}"
  fi

  # task_plan.json の存在確認（メインプロジェクト内）
  TASK_PLAN=".aad/docs/${RUN_ID}/task_plan.json"
  export TASK_PLAN

  if [ ! -f "$TASK_PLAN" ]; then
    echo "❌ ERROR: task_plan.json が生成されませんでした"
    exit 1
  fi

  # タスク数を表示
  TOTAL_TASKS=$(jq '.tasks | length' "$TASK_PLAN")
  echo "✅ タスク分割完了: ${TOTAL_TASKS} タスク生成"

  # dry-runモードの場合は計画を表示して終了
  if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "========================================="
    echo "📋 実行計画 (DRY RUN)"
    echo "========================================="
    echo ""
    jq -r '.tasks[] | "Task: \(.task_id)\n  Title: \(.title)\n  Files: \(.files_to_modify | join(", "))\n  Depends: \(.depends_on | join(", ") // "none")\n  Priority: \(.priority)\n"' "$TASK_PLAN"
    echo "========================================="
    echo ""
    echo "dry-runモード: 実行せずに終了します"
    exit 0
  fi
}

# ファイル衝突検証
verify_conflicts() {
  echo "🔍 ファイル衝突検証中..."

  if ./.aad/scripts/verify-file-conflicts.sh "${RUN_ID}"; then
    echo "✅ ファイル衝突検証完了"
  else
    echo "❌ ERROR: ファイル衝突が検出されました"
    exit 1
  fi
}

# Worktree作成
create_worktrees() {
  echo "🌲 Worktree作成中..."

  # task_plan.jsonから各タスクのWorktreeを作成
  jq -r '.tasks[].task_id' "$TASK_PLAN" | while read -r task_id; do
    wt_path="../worktrees/wt-${task_id}"
    task_branch="${PARENT_BRANCH}-${task_id}"

    # Worktree作成
    git worktree add "$wt_path" -b "$task_branch" "$PARENT_BRANCH" 2>&1 | sed 's/^/    /'

    # テンプレートをコピー
    copy_templates "$wt_path"

    echo "  ✅ Worktree作成: ${task_id}"
  done

  echo "✅ 全Worktree作成完了"
}

# tmuxセッション起動
start_tmux() {
  echo "🖥️  tmuxセッション起動中..."

  # tmux-orchestrator.shを呼び出し
  ./.aad/scripts/tmux-orchestrator.sh "${RUN_ID}" "${NUM_WORKERS}"

  SESSION_NAME="aad-${RUN_ID}"
  export SESSION_NAME

  echo "✅ tmuxセッション起動完了: ${SESSION_NAME}"

  # アタッチモードの場合はセッションにアタッチ
  if [ "$ATTACH" = true ]; then
    echo "🔗 tmuxセッションにアタッチします..."
    echo "   (デタッチするには Ctrl+b d を押してください)"
    sleep 2
    tmux attach -t "${SESSION_NAME}"
  else
    echo "📊 セッションにアタッチ: tmux attach -t ${SESSION_NAME}"
    echo "🔧 デタッチ: Ctrl+b d"
    echo "🔄 ウィンドウ切り替え: Ctrl+b n / Ctrl+b p"
  fi
}

# 進捗監視
monitor_progress() {
  echo ""

  # バックグラウンドモードの場合はスキップ
  if [ "$BACKGROUND" = true ]; then
    echo "📈 バックグラウンド実行モード"
    echo "   進捗確認: cat .aad/docs/${RUN_ID}/progress.json | jq"
    echo "   tmuxアタッチ: tmux attach -t aad-${RUN_ID}"
    return
  fi

  echo "📈 進捗監視開始..."

  PROGRESS_FILE=".aad/docs/${RUN_ID}/progress.json"

  # progress.jsonが生成されるまで待機（最大2分）
  WAIT_COUNT=0
  while [ ! -f "$PROGRESS_FILE" ] && [ $WAIT_COUNT -lt 60 ]; do
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 1))
  done

  if [ ! -f "$PROGRESS_FILE" ]; then
    echo "⚠️  WARNING: progress.json が見つかりません"
    return
  fi

  echo "📂 監視ファイル: ${PROGRESS_FILE}"

  # ポーリングで進捗を表示
  LAST_PROGRESS=""
  while [ -f "$PROGRESS_FILE" ]; do
    if [ -f "$PROGRESS_FILE" ]; then
      pending=$(jq -r '.pending // 0' "$PROGRESS_FILE" 2>/dev/null)
      running=$(jq -r '.running // 0' "$PROGRESS_FILE" 2>/dev/null)
      completed=$(jq -r '.completed // 0' "$PROGRESS_FILE" 2>/dev/null)
      failed=$(jq -r '.failed // 0' "$PROGRESS_FILE" 2>/dev/null)
      total_tasks=$(jq -r '.total_tasks // 0' "$PROGRESS_FILE" 2>/dev/null)

      # 進捗情報を整形
      CURRENT_PROGRESS="待機: ${pending} | 実行中: ${running} | 完了: ${completed} | 失敗: ${failed} | 合計: ${total_tasks}"

      # 変更があった場合のみ表示
      if [ "$CURRENT_PROGRESS" != "$LAST_PROGRESS" ]; then
        echo "[$(date +%H:%M:%S)] ${CURRENT_PROGRESS}"
        LAST_PROGRESS="$CURRENT_PROGRESS"
      fi

      # 全タスク完了チェック
      if [ "$pending" -eq 0 ] && [ "$running" -eq 0 ]; then
        echo "✅ 全タスク完了"
        break
      fi
    fi

    sleep 5
  done
}

# クリーンアップ
cleanup() {
  echo ""
  echo "🧹 クリーンアップ中..."

  # --no-cleanupオプションがある場合はスキップ
  if [ "$NO_CLEANUP" = true ]; then
    echo "  [NO CLEANUP] クリーンアップをスキップしました"
    echo "  📂 Worktreeは以下に残っています: ../worktrees/"
    if [ -n "${SESSION_NAME:-}" ]; then
      echo "  🖥️  tmuxセッション: ${SESSION_NAME}"
    fi
    return
  fi

  # Worktree削除
  echo "  - Worktree削除中..."
  jq -r '.tasks[].task_id' "$TASK_PLAN" 2>/dev/null | while read -r task_id; do
    wt_path="../worktrees/wt-${task_id}"
    if [ -d "$wt_path" ]; then
      git worktree remove "$wt_path" --force 2>&1 | sed 's/^/    /'
      echo "    ✅ Worktree削除: ${task_id}"
    fi
  done

  # tmuxセッション終了
  if [ -n "${SESSION_NAME:-}" ]; then
    echo "  - tmuxセッション終了中..."
    tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true
    echo "    ✅ tmuxセッション終了: ${SESSION_NAME}"
  fi

  echo "✅ クリーンアップ完了"
}

# 最終結果表示
show_final_results() {
  echo ""
  echo "========================================="
  echo "🏁 並列実行完了"
  echo "========================================="

  if [ -f "$PROGRESS_FILE" ]; then
    completed=$(jq -r '.completed // 0' "$PROGRESS_FILE" 2>/dev/null)
    failed=$(jq -r '.failed // 0' "$PROGRESS_FILE" 2>/dev/null)
    total_tasks=$(jq -r '.total_tasks // 0' "$PROGRESS_FILE" 2>/dev/null)

    echo "📊 完了: ${completed}/${total_tasks}"
    echo "❌ 失敗: ${failed}"

    # 失敗タスクがある場合は詳細を表示
    if [ "$failed" -gt 0 ]; then
      echo ""
      echo "失敗したタスク:"
      QUEUE_DIR=".aad/docs/${RUN_ID}/queue"
      for failed_task in "${QUEUE_DIR}"/failed/*.json; do
        if [ -e "$failed_task" ]; then
          task_id=$(basename "$failed_task" .json)
          echo "  - ${task_id}"
        fi
      done
    fi

    # サマリーファイルがあれば表示
    SUMMARY_FILE=".aad/docs/${RUN_ID}/final_summary.md"
    if [ -f "$SUMMARY_FILE" ]; then
      echo ""
      echo "📄 サマリー: ${SUMMARY_FILE}"
    fi
  fi

  echo ""
  echo "Run ID: ${RUN_ID}"
  echo "親ブランチ: ${PARENT_BRANCH}"
}

# メイン実行
main() {
  echo "🤖 tmux並列実行モードで起動します..."
  echo "📂 要件ファイル: ${REQUIREMENT_FILE}"
  echo ""

  check_prerequisites
  initialize
  create_parent_branch
  run_splitter
  verify_conflicts
  create_worktrees
  start_tmux
  monitor_progress
  cleanup
  show_final_results

  echo ""
  echo "✅ 全処理完了"

  # 終了コード判定
  if [ -f "$PROGRESS_FILE" ]; then
    failed=$(jq -r '.failed // 0' "$PROGRESS_FILE" 2>/dev/null)
    if [ "$failed" -gt 0 ]; then
      exit 1
    fi
  fi

  exit 0
}

# スクリプト実行
main

