#!/bin/bash
# tmux並列実行基盤: タスク実行スクリプト（TDDフロー）
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <task_id> <worktree_dir>"
  exit 1
fi

TASK_ID="$1"
WORKTREE_DIR="$2"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/logs/${TASK_ID}.log"

# ログディレクトリ作成
mkdir -p "$(dirname "$LOG_FILE")"

# ログ記録開始
{
  echo "=== Task Execution Log ==="
  echo "Task ID: ${TASK_ID}"
  echo "Worker ID: ${WORKER_ID}"
  echo "Worktree: ${WORKTREE_DIR}"
  echo "Start Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""

  # Worktreeディレクトリに移動
  cd "$WORKTREE_DIR" || {
    echo "❌ ERROR: Failed to cd to worktree"
    exit 1
  }

  # 現在のブランチを確認
  CURRENT_BRANCH=$(git branch --show-current)
  echo "📍 Current branch: ${CURRENT_BRANCH}"
  echo ""

  # コミットヘルパー関数
  commit_phase() {
    local phase_name="$1"
    local phase_type="$2"  # test, feat, refactor, chore

    if [ -n "$(git status --porcelain)" ]; then
      echo "📝 Committing ${phase_name} changes..."
      git add .
      git commit -m "${phase_type}(${TASK_ID}): ${phase_name}

Task: ${TASK_ID}
Phase: ${phase_name}"
      echo "✅ Committed: ${phase_name}"
    else
      echo "⚠️ No changes to commit for ${phase_name}"
    fi
  }

  # task_plan.json から言語設定を取得
  TASK_PLAN="${PROJECT_ROOT}/.aad/docs/${RUN_ID}/task_plan.json"
  if [ -f "$TASK_PLAN" ]; then
    WORKSPACE=$(jq -r '.workspace // "."' "${PROJECT_ROOT}/.aad/docs/${RUN_ID}/queue/running/${TASK_ID}.json" 2>/dev/null || echo ".")
    LANGUAGE=$(jq -r ".workspaces[\"$WORKSPACE\"].language // \"unknown\"" "$TASK_PLAN" 2>/dev/null || echo "unknown")
    TEST_FRAMEWORK=$(jq -r ".workspaces[\"$WORKSPACE\"].test_framework // \"unknown\"" "$TASK_PLAN" 2>/dev/null || echo "unknown")
    PKG_MGR=$(jq -r ".workspaces[\"$WORKSPACE\"].package_manager // \"unknown\"" "$TASK_PLAN" 2>/dev/null || echo "unknown")

    echo "📦 Workspace: ${WORKSPACE}"
    echo "🔤 Language: ${LANGUAGE}"
    echo "🧪 Test Framework: ${TEST_FRAMEWORK}"
    echo "📦 Package Manager: ${PKG_MGR}"
  else
    WORKSPACE="."
    LANGUAGE="unknown"
    TEST_FRAMEWORK="unknown"
    PKG_MGR="unknown"
  fi

  # ===== Phase 1: Tester - Red (失敗するテストを作成) =====
  echo "🧪 Phase 1: Tester (Red) - Creating failing tests"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # testerエージェントを呼び出し（Redフェーズ）
  claude \
    --settings "./.aad/settings/settings.json" \
    --allowedTools "Read,Write,Edit,Glob,Grep,Bash" \
    -p "testerエージェントとして、TDD Red フェーズを実行してください。

Task ID: ${TASK_ID}
Task Title: ${TASK_TITLE}
Task Description: ${TASK_DESCRIPTION}

プロジェクト情報:
- Workspace: ${WORKSPACE}
- Language: ${LANGUAGE}
- Test Framework: ${TEST_FRAMEWORK}
- Package Manager: ${PKG_MGR}

実行内容:
1. タスクの要件を理解する
2. 失敗するテストを作成する（言語に応じた適切なパターンを使用）
   - Go: テーブル駆動テスト
   - Python: pytest parametrize
   - Rust: テストケースベクター
   - TypeScript: it.each (Vitest/Jest)
   - Terraform: terraform validate
3. テストを実行して失敗することを確認する

注意: このフェーズでは実装コードは書かないでください。テストのみ作成してください。" 2>&1 | tee -a "$LOG_FILE"

  # Phase 1 終了後のコミット
  commit_phase "Red phase - failing tests" "test"
  echo ""

  # ===== Phase 2: Implementer - Green (最小限の実装) =====
  echo "🔧 Phase 2: Implementer (Green) - Minimal implementation"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # implementerエージェントを呼び出し（Greenフェーズ）
  claude \
    --settings "./.aad/settings/settings.json" \
    --allowedTools "Read,Write,Edit,Glob,Grep,Bash" \
    -p "implementerエージェントとして、TDD Green フェーズを実行してください。

Task ID: ${TASK_ID}
Task Title: ${TASK_TITLE}
Task Description: ${TASK_DESCRIPTION}

プロジェクト情報:
- Workspace: ${WORKSPACE}
- Language: ${LANGUAGE}
- Test Framework: ${TEST_FRAMEWORK}
- Package Manager: ${PKG_MGR}

実行内容:
1. 作成されたテストを確認する
2. テストをパスするための最小限の実装を書く（言語別のコーディング規約に従う）
3. テストを実行してパスすることを確認する

注意: 過度な最適化やリファクタリングは行わず、テストをパスするための最小限のコードを書いてください。" 2>&1 | tee -a "$LOG_FILE"

  # Phase 2 終了後のコミット
  commit_phase "Green phase - implementation" "feat"
  echo ""

  # ===== Phase 3: Tester - Verify (テスト検証) =====
  echo "✅ Phase 3: Tester (Verify) - Running all tests"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # ワークスペースディレクトリに移動
  if [ "$WORKSPACE" != "." ]; then
    cd "$WORKSPACE" || {
      echo "⚠️  WARNING: Failed to cd to workspace ${WORKSPACE}"
    }
  fi

  # テスト実行
  run_tests() {
    case "$TEST_FRAMEWORK" in
      go-test)
        echo "Running Go tests..."
        if go test ./... -v -cover 2>&1 | tee -a "$LOG_FILE"; then
          echo "✅ All tests passed (Green state)"
        else
          echo "❌ Tests failed"
          return 1
        fi
        ;;
      pytest)
        echo "Running Python tests (pytest)..."
        case "$PKG_MGR" in
          uv)
            if uv run pytest -v 2>&1 | tee -a "$LOG_FILE"; then
              echo "✅ All tests passed (Green state)"
            else
              echo "❌ Tests failed"
              return 1
            fi
            ;;
          poetry)
            if poetry run pytest -v 2>&1 | tee -a "$LOG_FILE"; then
              echo "✅ All tests passed (Green state)"
            else
              echo "❌ Tests failed"
              return 1
            fi
            ;;
          *)
            if pytest -v 2>&1 | tee -a "$LOG_FILE"; then
              echo "✅ All tests passed (Green state)"
            else
              echo "❌ Tests failed"
              return 1
            fi
            ;;
        esac
        ;;
      cargo-test)
        echo "Running Rust tests..."
        if cargo test 2>&1 | tee -a "$LOG_FILE"; then
          echo "✅ All tests passed (Green state)"
        else
          echo "❌ Tests failed"
          return 1
        fi
        ;;
      vitest)
        echo "Running Vitest tests..."
        if npx vitest run 2>&1 | tee -a "$LOG_FILE"; then
          echo "✅ All tests passed (Green state)"
        else
          echo "❌ Tests failed"
          return 1
        fi
        ;;
      jest)
        echo "Running Jest tests..."
        if npx jest 2>&1 | tee -a "$LOG_FILE"; then
          echo "✅ All tests passed (Green state)"
        else
          echo "❌ Tests failed"
          return 1
        fi
        ;;
      playwright)
        echo "Running Playwright tests..."
        if npx playwright test 2>&1 | tee -a "$LOG_FILE"; then
          echo "✅ All tests passed (Green state)"
        else
          echo "❌ Tests failed"
          return 1
        fi
        ;;
      terraform-validate)
        echo "Running Terraform validation..."
        terraform init -backend=false >/dev/null 2>&1
        if terraform validate 2>&1 | tee -a "$LOG_FILE"; then
          echo "✅ Terraform validation passed"
        else
          echo "❌ Terraform validation failed"
          return 1
        fi
        ;;
      npm-test)
        echo "Running npm test..."
        if npm test 2>&1 | tee -a "$LOG_FILE"; then
          echo "✅ All tests passed (Green state)"
        else
          echo "❌ Tests failed"
          return 1
        fi
        ;;
      unknown)
        # フォールバック: 従来のロジック
        if [ -f "go.mod" ]; then
          echo "Running Go tests (fallback)..."
          if go test ./... -v -cover 2>&1 | tee -a "$LOG_FILE"; then
            echo "✅ All tests passed (Green state)"
          else
            echo "❌ Tests failed"
            return 1
          fi
        elif [ -f "package.json" ]; then
          echo "Running npm test (fallback)..."
          if npm test 2>&1 | tee -a "$LOG_FILE"; then
            echo "✅ All tests passed (Green state)"
          else
            echo "❌ Tests failed"
            return 1
          fi
        else
          echo "⚠️  WARNING: Unknown test framework, skipping tests"
        fi
        ;;
      *)
        echo "⚠️  WARNING: Unknown test framework: $TEST_FRAMEWORK, skipping tests"
        ;;
    esac
  }

  run_tests || exit 1
  echo ""

  # ===== Phase 4: Reviewer - Code Review =====
  echo "👀 Phase 4: Reviewer - Code quality check"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # reviewerエージェントを呼び出し
  claude \
    --settings "./.aad/settings/settings.json" \
    --allowedTools "Read,Write,Edit,Glob,Grep,Bash" \
    -p "reviewerエージェントとして、コードレビューを実行してください。

Task ID: ${TASK_ID}
Task Title: ${TASK_TITLE}

実行内容:
1. 作成されたコードとテストを確認する
2. 品質・セキュリティ・パフォーマンスの観点からレビューする
3. 必要に応じて軽微な修正を行う
4. 重大な問題があれば報告する

注意: 軽微なスタイル問題は修正しても良いですが、機能を壊さないように注意してください。" 2>&1 | tee -a "$LOG_FILE"

  # Phase 4 終了後のコミット
  commit_phase "Review phase - code improvements" "refactor"
  echo ""

  # ===== Phase 5: タスク完了処理 =====
  echo "🚀 Phase 5: タスク完了処理（親ブランチへマージ）"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # 残りの変更があればコミット
  if [ -n "$(git status --porcelain)" ]; then
    commit_phase "Final cleanup" "chore"
  fi

  # コミット履歴を表示
  echo "📋 Commit history for this task:"
  git log --oneline -5

  echo "📝 Task branch stays local (no push to origin)"

  # 親 Worktree に移動してマージ
  PARENT_WORKTREE="${PROJECT_ROOT}/../worktrees/parent-${RUN_ID}"

  if [ ! -d "${PARENT_WORKTREE}" ]; then
    echo "⚠️  WARNING: Parent worktree not found at ${PARENT_WORKTREE}"
    echo "Skipping merge to parent branch"
  else
    cd "${PARENT_WORKTREE}"

    # マージ前に untracked files をクリーンアップ（テンプレートファイルなど）
    if [ -n "$(git status --porcelain)" ]; then
      echo "🧹 Cleaning up untracked files in parent worktree..."
      git add -A
      git commit -m "chore: add template files before merge" 2>&1 | tee -a "$LOG_FILE" || true
    fi

    # タスクブランチをマージ
    if git merge "${CURRENT_BRANCH}" --no-ff -m "Merge ${TASK_ID}: ${TASK_TITLE}" 2>&1 | tee -a "$LOG_FILE"; then
      echo "✅ Merged to parent branch"
    else
      echo "❌ ERROR: Failed to merge to parent branch"
      cd -
      exit 1
    fi

    # 親ブランチをプッシュ
    PARENT_BRANCH=$(git branch --show-current)
    if git remote get-url origin >/dev/null 2>&1; then
      if git push origin "${PARENT_BRANCH}" 2>&1 | tee -a "$LOG_FILE"; then
        echo "✅ Pushed parent branch to remote"
      else
        echo "⚠️  WARNING: Push failed (continuing)"
      fi
    else
      echo "⚠️  No remote repository configured"
    fi

    cd -
  fi
  echo ""

  # Draft PRのメッセージ更新は orchestrator-loop.sh で一括処理
  echo "📝 Draft PR will be updated by orchestrator"
  echo ""

  echo "End Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "✅ Task execution completed successfully"

  exit 0

} 2>&1 | tee "$LOG_FILE"

# ログ記録が失敗した場合もエラーを返す
exit ${PIPESTATUS[0]}

