#!/bin/bash

# 引数: 要件定義ファイルのパス
IFILE=${1:-"sample_requirement.md"}

if [ ! -f "$IFILE" ]; then
  echo "Error: File $IFILE not found."
  exit 1
fi

echo "🤖 自律モードでOrchestratorを起動します..."
echo "📂 要件ファイル: $IFILE"
echo ""

# Claude Code CLI の実行（バックグラウンド）
# -p: 非インタラクティブモードでプロンプトを実行
# --settings: .aad/templates/settings.json で権限とフックを制御
# --allowedTools: 使用ツールを制限して精度を向上
claude \
  --settings "${PROJECT_ROOT}/.aad/templates/settings.json" \
  --allowedTools "Bash,Read,Write,Edit,Glob,Grep,Task" \
  -p "master-pipeline を ${IFILE} に対して開始してください。以下の手順は私の許可なく自律的に進めてください：1. 計画の保存と親ブランチの作成。2. 全てのgit worktree操作、ブランチ作成、削除。3. 全てのテスト実行とコード実装。4. 親ブランチに向けたPR作成。最後に結果だけ報告してください。" &

CLAUDE_PID=$!
echo "📊 Claude PID: $CLAUDE_PID"

# 実行開始時刻を記録（この時刻以降に作成されたファイルのみを対象）
START_TIME=$(date +%s)

# progress.json が生成されるまで待機（最大5分）
echo "⏳ 進捗ファイルを待機中..."
WAIT_COUNT=0
PROGRESS_FILE=""
while [ -z "$PROGRESS_FILE" ] && [ $WAIT_COUNT -lt 150 ]; do
  # 実行開始時刻以降に作成されたprogress.jsonの中で一番古いものを選択
  OLDEST_FILE=""
  OLDEST_TIME=999999999999

  for file in .aad/docs/run_*/progress.json; do
    if [ -f "$file" ]; then
      FILE_TIME=$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null)
      if [ "$FILE_TIME" -ge "$START_TIME" ] && [ "$FILE_TIME" -lt "$OLDEST_TIME" ]; then
        OLDEST_FILE="$file"
        OLDEST_TIME="$FILE_TIME"
      fi
    fi
  done

  if [ -n "$OLDEST_FILE" ]; then
    PROGRESS_FILE="$OLDEST_FILE"
  else
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 1))
    if ! kill -0 $CLAUDE_PID 2>/dev/null; then
      echo "❌ Claudeプロセスが予期せず終了しました"
      exit 1
    fi
  fi
done

if [ -z "$PROGRESS_FILE" ]; then
  echo "⚠️ 進捗ファイルが見つかりません。出力なしで実行を継続..."
fi

# ポーリングで進捗を表示
echo ""
echo "📈 進捗監視開始..."
echo "📂 監視ファイル: $PROGRESS_FILE"
LAST_PROGRESS=""
while kill -0 $CLAUDE_PID 2>/dev/null; do
  # 特定のprogress.jsonファイルを監視

  if [ -n "$PROGRESS_FILE" ] && [ -f "$PROGRESS_FILE" ]; then
    STATUS=$(jq -r '.status // "unknown"' "$PROGRESS_FILE" 2>/dev/null)
    PROGRESS=$(jq -r '.progress // 0' "$PROGRESS_FILE" 2>/dev/null)
    COMPLETED=$(jq -r '.completed_tasks // .tasks_completed // 0' "$PROGRESS_FILE" 2>/dev/null)
    TOTAL=$(jq -r '.total_tasks // .tasks_total // 0' "$PROGRESS_FILE" 2>/dev/null)
    PHASE=$(jq -r '.current_phase // "N/A"' "$PROGRESS_FILE" 2>/dev/null)

    # 進捗情報を整形
    CURRENT_PROGRESS="[${PROGRESS}%] ${STATUS} | Tasks: ${COMPLETED}/${TOTAL} | Phase: ${PHASE}"

    # 変更があった場合のみ表示（改行付き）
    if [ "$CURRENT_PROGRESS" != "$LAST_PROGRESS" ]; then
      echo "$CURRENT_PROGRESS"
      LAST_PROGRESS="$CURRENT_PROGRESS"
    fi

    # ステータスが完了状態になったらループを抜ける
    if [ "$STATUS" = "completed" ] || [ "$STATUS" = "rolled_back" ] || [ "$STATUS" = "failed" ]; then
      echo "✅ パイプラインが終了状態になりました: $STATUS"
      break
    fi
  fi
  sleep 5
done

# 最終結果を表示
echo ""
echo ""
echo "========================================="
echo "🏁 Pipeline 完了"
echo "========================================="

if [ -n "$PROGRESS_FILE" ] && [ -f "$PROGRESS_FILE" ]; then
  FINAL_STATUS=$(jq -r '.status // "unknown"' "$PROGRESS_FILE" 2>/dev/null)
  echo "最終ステータス: $FINAL_STATUS"

  # 最終サマリーがあれば表示
  SUMMARY_FILE=$(dirname "$PROGRESS_FILE")/final_summary.md
  if [ -f "$SUMMARY_FILE" ]; then
    echo ""
    echo "📄 サマリー: $SUMMARY_FILE"
  fi
fi

# claudeプロセスの終了コードを取得
wait $CLAUDE_PID
EXIT_CODE=$?

echo ""
echo "終了コード: $EXIT_CODE"
exit $EXIT_CODE
