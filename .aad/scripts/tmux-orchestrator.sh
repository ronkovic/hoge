#!/bin/bash
# tmux並列実行基盤: セッション初期化スクリプト
set -euo pipefail

# 引数チェック
if [ $# -lt 1 ]; then
  echo "Usage: $0 <run_id> [max_workers]"
  exit 1
fi

RUN_ID="$1"
MAX_WORKERS="${2:-4}"
SESSION_NAME="aad-${RUN_ID}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
QUEUE_DIR="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/queue"

# キューディレクトリ構造を作成
mkdir -p "${QUEUE_DIR}"/{pending,running,completed,failed,workers}

# 既存セッションがあれば削除
tmux kill-session -t "${SESSION_NAME}" 2>/dev/null || true

# tmuxセッション作成
tmux new-session -d -s "${SESSION_NAME}" -n orchestrator -c "${PROJECT_ROOT}"

# Window 0: Orchestratorディスパッチループ
tmux send-keys -t "${SESSION_NAME}:orchestrator" \
  "echo 'Orchestrator starting for run_id: ${RUN_ID}'" C-m
tmux send-keys -t "${SESSION_NAME}:orchestrator" \
  "./.aad/scripts/orchestrator-loop.sh ${RUN_ID} ${MAX_WORKERS}" C-m

# Window 1-N: Worker実行窓
for i in $(seq 1 "${MAX_WORKERS}"); do
  WORKER_NAME="worker-${i}"
  tmux new-window -t "${SESSION_NAME}" -n "${WORKER_NAME}" -c "${PROJECT_ROOT}"

  # ワーカー状態ファイルを初期化
  echo '{"worker_id":"'${i}'","status":"idle","current_task":null}' \
    > "${QUEUE_DIR}/workers/worker-${i}.json"

  # ワーカー実行ループを起動
  tmux send-keys -t "${SESSION_NAME}:${WORKER_NAME}" \
    "echo 'Worker ${i} ready'" C-m
  tmux send-keys -t "${SESSION_NAME}:${WORKER_NAME}" \
    "./.aad/scripts/worker-executor.sh ${RUN_ID} ${i}" C-m
done

# Window N+1: 進捗ダッシュボード
tmux new-window -t "${SESSION_NAME}" -n monitor -c "${PROJECT_ROOT}"
tmux send-keys -t "${SESSION_NAME}:monitor" \
  "./.aad/scripts/monitor-dashboard.sh ${RUN_ID}" C-m

# 最初のウィンドウに移動
tmux select-window -t "${SESSION_NAME}:orchestrator"

echo "✅ tmux session '${SESSION_NAME}' created with ${MAX_WORKERS} workers"
echo "📊 Attach with: tmux attach -t ${SESSION_NAME}"
echo "🔧 Detach with: Ctrl+b d"
echo "🔄 Switch windows: Ctrl+b n / Ctrl+b p"

