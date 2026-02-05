---
name: master-pipeline
description: 要件解析から親ブランチ作成、個別PRの集約までを全自動で統括するワークフロー。エラーハンドリング、進捗管理、ロールバック機能を含む。
---

# Master Pipeline - 自律型Orchestratorワークフロー

## 概要

要件定義ファイルから完全なアプリケーションを自動生成する、エンドツーエンドのワークフローです。

## ワークフローフェーズ

### Phase 1: 準備とタスク分割 (5-15分)

**実行内容**:
0. **要件サイズ判定**: 大規模要件の場合は Sub-SPEC に分割
1. **要件ファイル読み取り**: 指定された要件定義ファイルを解析
2. **コードベース分析**: 既存のプロジェクト構造を把握
3. **タスク分割**: @splitter を使用して実装可能な粒度のタスクに分割
4. **run_id生成**: `run_YYYYMMDD_HHMMSS` 形式でユニークIDを生成
5. **ドキュメント生成**:
   - `.aad/docs/[run_id]/refined_requirements.md`
   - `.aad/docs/[run_id]/task_plan.json`
   - `.aad/docs/[run_id]/progress.json` (初期化)

#### Phase 1.0: 要件サイズ判定と分割（新規）

大規模要件を検出し、管理可能な Sub-SPEC に分割します。

```bash
# 要件ファイルの行数を取得
REQUIREMENTS_FILE="requirements.md"  # またはユーザー指定のパス
LINE_COUNT=$(wc -l < "$REQUIREMENTS_FILE")

echo "要件ファイル: $REQUIREMENTS_FILE ($LINE_COUNT 行)"

# 分割判定（200行以上）
if [ $LINE_COUNT -gt 200 ]; then
  echo "🔍 大規模要件を検出。Sub-SPEC に分割します..."
  DECOMPOSE_NEEDED=true
else
  echo "✅ 通常サイズの要件。分割は不要です。"
  DECOMPOSE_NEEDED=false
fi
```

**分割が必要な場合（200行以上）**:

1. **@spec-decomposer を実行**:
   - Phase 構造を分析
   - Phase グループ化による Sub-SPEC 生成
   - `decomposition_plan.json` 生成
   - 各 Sub-SPEC の `requirements.md` 生成

2. **Sub-SPEC ディレクトリ構造**:
```
.aad/docs/[run_id]/
├── decomposition_plan.json       # 分割計画
├── original_requirements.md      # 元の要件（参照用）
└── sub-specs/
    ├── SPEC-001-foundation/
    │   └── requirements.md
    ├── SPEC-002-core-logic/
    │   └── requirements.md
    └── ...
```

3. **各 Sub-SPEC に対してループ実行**:
   - 並列グループ単位で実行
   - 同一グループ内の Sub-SPEC は並列実行可能
   - グループ間は順次実行（依存関係に従う）

4. **進捗管理**:
```bash
# decomposition_plan.json を読み込み
jq -r '.sub_specs[] | .spec_id' .aad/docs/${RUN_ID}/decomposition_plan.json | while read SPEC_ID; do
  echo "📦 Processing Sub-SPEC: $SPEC_ID"

  # この Sub-SPEC に対して Phase 1.1 以降を実行
  # （タスク分割 → Git セットアップ → タスクループ）
done
```

**成功判定基準**:
- ✅ `decomposition_plan.json` が有効な JSON 形式
- ✅ 循環依存がない
- ✅ 各 Sub-SPEC が 8-15 タスク程度
- ✅ すべての Phase が Sub-SPEC に含まれる

**失敗時の対応**:
- Phase 構造不明: デフォルトのグループ化を適用
- 循環依存検出: 保守的に順次実行を設定
- 分割が不適切: 分割をスキップして通常フローへ

**成功判定基準**:
- ✅ task_plan.json が有効なJSON形式
- ✅ 全タスクに task_id が割り当てられている
- ✅ 循環依存がない
- ✅ 各タスクに acceptance_criteria がある

**失敗時の対応**:
- 要件が不明瞭な場合: `.aad/docs/[run_id]/questions.md` を生成し、ユーザーに質問
- JSON生成エラー: タスク分割を再試行(最大3回)
- 循環依存検出: タスクの依存関係を修正

#### 【必須】progress.json の初期化

> ⚠️ **この初期化は省略不可。Phase 1開始時に必ず実行すること。**

```bash
# run_idを生成（例: run_20260203_184654)
RUN_ID="run_$(date +%Y%m%d_%H%M%S)"

# ディレクトリ作成
mkdir -p .aad/docs/${RUN_ID}

# progress.json初期化
cat > .aad/docs/${RUN_ID}/progress.json << PROGRESSEOF
{
  "run_id": "${RUN_ID}",
  "status": "phase1_in_progress",
  "current_phase": "準備とタスク分割",
  "progress": 10,
  "tasks_total": 0,
  "tasks_completed": 0,
  "start_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
PROGRESSEOF
```

#### 【必須】Phase 1 終了時の進捗更新

> ⚠️ **この進捗更新は省略不可。タスク分割完了後に必ず実行すること。**

```bash
jq '.status = "phase1_completed" | .progress = 15 | .current_phase = "タスク分割完了"' \
  .aad/docs/${RUN_ID}/progress.json > tmp.json && mv tmp.json .aad/docs/${RUN_ID}/progress.json
```

---

### Phase 2: Git環境セットアップ (1-2分)

**実行内容**:
1. **親ブランチ作成**: @github-manager を使用
   - **重要**: Worktree として作成（プロジェクトルートで checkout しない）
   - 命名規則: `feature/YYYY-MM-DD-brief-description`
   - mainブランチから作成
2. **リモートpush**: 親ブランチをリモートにpush
3. **Draft PR作成**: mainをベースにしたDraft PRを作成
4. **ブランチ保護**: mainブランチへの直接コミット防止(settings.jsonで設定済み)

**Phase 2の実装例**:

```bash
# プロジェクトルートで実行（checkout しない）
PARENT_BRANCH="feature/$(date +%Y-%m-%d)-${FEATURE_NAME}"
PARENT_WORKTREE="../worktrees/parent-${RUN_ID}"

# 親ブランチを Worktree として作成
git worktree add ${PARENT_WORKTREE} -b ${PARENT_BRANCH} main

# 親 Worktree 内でプッシュ + Draft PR作成
cd ${PARENT_WORKTREE}
git push -u origin ${PARENT_BRANCH}
gh pr create --draft --base main \
  --title "${PR_TITLE}" \
  --body "${PR_BODY}"
cd -
```

**成功判定基準**:
- ✅ 親ブランチが作成されている
- ✅ ブランチ名が命名規則に準拠
- ✅ リモートにpush成功(リモートリポジトリがある場合)

**失敗時の対応**:
- ブランチ名の衝突: 日時サフィックスを追加（例: `-v2`)
- リモートpush失敗: ローカルのみで続行(警告ログ出力)
- 権限エラー: 保護機構が動作していることを確認

**進捗更新**:
```json
{
  "status": "phase2_completed",
  "current_phase": "Git環境セットアップ",
  "progress": 20,
  "parent_branch": "feature/2026-02-03-user-management-api"
}
```

**Phase 2 終了時の進捗更新**:
```bash
jq '.status = "phase2_completed" | .progress = 20 | .current_phase = "Git環境準備完了"' \
  .aad/docs/${RUN_ID}/progress.json > tmp.json && mv tmp.json .aad/docs/${RUN_ID}/progress.json
```

---

### Phase 3: タスクループ (タスク数 × 10-20分)

**各タスクの実行フロー**:

#### 3.1. Worktree作成 (@github-manager)
```bash
git worktree add ../worktrees/wt-${TASK_ID} \
  -b ${PARENT_BRANCH}/${TASK_ID} \
  ${PARENT_BRANCH}
```

**成功判定**: Worktreeディレクトリが存在

#### 【必須】タスク開始時の進捗更新

> ⚠️ **この進捗更新は省略不可。必ず実行すること。**

```bash
jq --arg task "$TASK_ID" \
   '.status = "phase3_in_progress" | .current_task.task_id = $task | .tasks[$task].status = "in_progress"' \
   .aad/docs/${RUN_ID}/progress.json > tmp.json && mv tmp.json .aad/docs/${RUN_ID}/progress.json
```

#### 3.1.5. GraphQLスキーマ生成（gqlgenプロジェクト）

GraphQLスキーマファイル（.graphqls）が変更された場合、コード生成を実行します。

```bash
# GraphQLスキーマファイルの変更を検出
if [ -f "gqlgen.yaml" ] && git diff --name-only ${PARENT_BRANCH} | grep -q ".graphqls"; then
    echo "GraphQL schema changes detected, running code generation..."

    # コード生成
    go generate ./...
    # または
    task graphql-gen

    # 生成されたファイルをステージング
    git add generated.go models_gen.go
fi
```

**成功判定**:
- ✅ gqlgen.yamlが存在する場合のみ実行
- ✅ コード生成エラーなし
- ✅ 生成ファイルがコミットに含まれる

**失敗時の対応**:
- スキーマ定義エラー: エラーメッセージを記録、タスクを中断

#### 3.2. テスト作成 - Red (@tester)
- テーブル駆動テスト生成
- 初期実行で失敗することを確認(Red)
- `test_summary.md` 生成

**成功判定**:
- ✅ テストファイルが生成されている
- ✅ テストが失敗する(Red状態)
- ✅ テストケースが正常・異常系を網羅

**失敗時の対応**:
- テスト生成失敗: タスクを「要修正」状態にマーク、次のタスクへ
- コンパイルエラー: implementerに先に構造体定義を依頼

#### 3.2.5. Clean Architecture テスト順序

Clean Architectureプロジェクトでは、依存関係に従ってテストを実行します。

```bash
# 1. Entities層テスト（依存なし）
go test ./usecases/[domain]/[feature] -run TestEntity -v

# 2. UseCases層テスト（Entities層に依存、モック使用）
go test ./usecases/[domain]/[feature] -run TestInteractor -v

# 3. Gateways層統合テスト（実DB使用）
go test ./gateways/[domain]/[feature] -run TestRepository -v

# 4. Presenters層統合テスト（GraphQL全体フロー）
go test ./presenters/[domain]/graphql -run TestResolver -v
```

**テスト実行順序の原則**:
1. 内側の層から外側の層へ（Entities → UseCases → Gateways → Presenters）
2. 単体テストから統合テストへ
3. モックテストから実DBテストへ

**成功判定**:
- ✅ 各層のテストが順番にパス
- ✅ 依存する層のテストが先に成功している

**失敗時の対応**:
- 内側の層で失敗: その層の修正を優先
- 外側の層で失敗: 依存する内側の層を再確認

#### 3.3. 実装 - Green (@implementer)
- 最小限の実装でテストをパス
- リファクタリング
- コーディング規約準拠確認

**成功判定**:
- ✅ 全テストがパス(Green状態)
- ✅ カバレッジが基準を満たす(タスク依存)
- ✅ 静的解析でエラーなし

**失敗時の対応**:
- テストが通らない: 実装を再試行(最大3回)
- カバレッジ不足: 警告ログ出力、続行
- 静的解析エラー: 自動修正を試行

#### 3.4. テスト検証 (@tester)
- 全テスト実行
- カバレッジ計測
- test_summary.md 更新

**成功判定**:
- ✅ 全テストがパス
- ✅ カバレッジレポート生成

#### 3.5. コードレビュー (@reviewer) - Phase 3追加
- 品質・セキュリティ・パフォーマンスチェック
- `code_review.md` 生成
- 重大な問題がある場合は修正を要求

**成功判定**:
- ✅ レビュー完了
- ✅ 重大な問題(🔴)なし

**失敗時の対応**:
- 重大な問題検出: implementerに修正依頼、再レビュー

#### 3.6. コミットとPR作成 (@github-manager)
```bash
git add .
git commit -m "feat(task-X): タイトル

- 変更内容
- テスト結果

Refs: task-X"

git push -u origin ${PARENT_BRANCH}/${TASK_ID}

gh pr create --base ${PARENT_BRANCH} \
  --title "[task-X] タイトル" \
  --body "..."
```

**成功判定**:
- ✅ コミット成功
- ✅ PR作成成功(またはローカルのみでコミット)

#### 3.7. Worktree削除 (@github-manager)
```bash
# Worktree削除
git worktree remove ../worktrees/wt-${TASK_ID}

# ローカルのタスクブランチを削除(マージ済みの場合のみ成功)
git branch -d ${PARENT_BRANCH}/${TASK_ID} 2>/dev/null || echo "ブランチ削除スキップ(未マージまたは存在しない)"
```

#### 【必須】タスク完了時の進捗更新

> ⚠️ **この進捗更新は省略不可。必ず実行すること。**

```bash
# タスク番号とタスク総数から進捗を計算
PROGRESS=$((20 + (TASK_NUM * 70 / TOTAL_TASKS)))

# progress.json更新
jq --arg task "$TASK_ID" --argjson prog $PROGRESS \
   '.tasks[$task].status = "completed" | .completed_tasks += 1 | .progress = $prog' \
   .aad/docs/${RUN_ID}/progress.json > tmp.json && mv tmp.json .aad/docs/${RUN_ID}/progress.json
```

**進捗更新** (各タスク完了後):
```json
{
  "status": "phase3_in_progress",
  "current_phase": "タスクループ",
  "progress": 30 + (タスク番号 / タスク総数 * 60),
  "tasks_completed": X,
  "current_task": "task-Y",
  "tasks": [
    {
      "task_id": "task-1",
      "status": "completed",
      "duration_minutes": 12,
      "test_coverage": 100.0,
      "review_score": 4.5
    },
    {
      "task_id": "task-2",
      "status": "in_progress",
      "start_time": "2026-02-03T15:45:00Z"
    }
  ]
}
```

---

### Phase 4: ドキュメント生成 (2-5分) - Phase 3追加

**実行内容**: @documentor を使用
1. README.md 生成
2. API.md 生成
3. ARCHITECTURE.md 生成
4. OpenAPI/Swagger仕様生成(オプション)

**成功判定基準**:
- ✅ README.mdが存在し、セットアップ手順が記載されている
- ✅ API.mdが存在し、全エンドポイントが記載されている

**失敗時の対応**:
- ドキュメント生成失敗: 警告ログ出力、続行

**Phase 4 終了時の進捗更新**:
```bash
jq '.status = "phase4_completed" | .progress = 95 | .current_phase = "ドキュメント生成完了"' \
  .aad/docs/${RUN_ID}/progress.json > tmp.json && mv tmp.json .aad/docs/${RUN_ID}/progress.json
```

---

### Phase 5: 完了報告とクリーンアップ (1分)

**実行内容**:
1. **実行レポート生成**: `.aad/docs/[run_id]/execution_report.md`
2. **統計情報集計**:
   - 総実行時間
   - 生成ファイル数
   - 総コード行数
   - テストカバレッジ
   - タスク完了率
3. **親ブランチPR URLの提示**:
   ```bash
   echo "親ブランチ: ${PARENT_BRANCH}"
   echo "mainへのPR作成コマンド:"
   echo "gh pr create --base main --title '...' --body '...'"
   ```

**進捗更新** (最終):
```json
{
  "status": "completed",
  "current_phase": "完了",
  "progress": 100,
  "tasks_total": 7,
  "tasks_completed": 7,
  "tasks_failed": 0,
  "total_duration_minutes": 25,
  "total_files_created": 20,
  "total_lines_of_code": 2643,
  "average_test_coverage": 90.0,
  "completed_at": "2026-02-03T15:50:00Z"
}
```

**Phase 5 終了時の進捗更新**:
```bash
jq '.status = "completed" | .progress = 100 | .current_phase = "完了"' \
  .aad/docs/${RUN_ID}/progress.json > tmp.json && mv tmp.json .aad/docs/${RUN_ID}/progress.json
```

---

## エラーハンドリングとロールバック

### エラーレベル

#### 🔴 Critical Error(即中断)
- タスク分割の完全失敗(3回リトライ後)
- 親ブランチ作成失敗
- Git致命的エラー

**対応**: パイプライン即中断、ロールバック実行

#### 🟡 Warning(続行可能)
- 個別タスクの失敗
- カバレッジ基準未達
- リモートpush失敗(ローカルは成功)

**対応**: 警告ログ出力、該当タスクをスキップ、続行

#### 🟢 Info(情報のみ)
- 最適化の提案
- ドキュメント生成のスキップ

### ロールバック手順

#### ロールバックトリガー
- 🔴 Critical Error発生時
- ユーザーの明示的な中断(Ctrl+C)
- 3つ以上の連続したタスク失敗

#### ロールバック実行内容

1. **Worktreeのクリーンアップ**:
   ```bash
   git worktree list | grep wt- | awk '{print $1}' | xargs -I {} git worktree remove {}
   ```

2. **作成したブランチの削除**(オプション、デフォルトは保持):
   ```bash
   git branch | grep "task/task-" | xargs git branch -D
   git branch -D ${PARENT_BRANCH}
   ```

3. **ロールバックレポート生成**:
   `.aad/docs/[run_id]/rollback_report.md`

4. **進捗状態の更新**:
   ```json
   {
     "status": "rolled_back",
     "reason": "Critical error in task-3",
     "rollback_completed_at": "2026-02-03T16:00:00Z"
   }
   ```

---

## 進捗監視

### progress.json の構造

```json
{
  "run_id": "run_20260203_154139",
  "status": "phase3_in_progress",
  "current_phase": "タスクループ",
  "progress": 50,
  "start_time": "2026-02-03T15:41:39Z",
  "estimated_completion": "2026-02-03T16:10:00Z",
  "parent_branch": "feature/2026-02-03-user-management-api",
  "tasks_total": 7,
  "tasks_completed": 3,
  "tasks_in_progress": 1,
  "tasks_failed": 0,
  "current_task": {
    "task_id": "task-4",
    "title": "リポジトリ層実装",
    "status": "in_progress",
    "start_time": "2026-02-03T15:55:00Z"
  },
  "tasks": [
    {
      "task_id": "task-1",
      "status": "completed",
      "duration_minutes": 2,
      "test_coverage": 100.0
    }
  ],
  "warnings": [
    "task-2: No remote repository, local only"
  ],
  "errors": []
}
```

### 監視コマンド

別ターミナルで進捗を確認:
```bash
# 進捗状態を監視
watch -n 5 'cat .aad/docs/run_*/progress.json | jq'

# 現在のフェーズを表示
jq -r '.current_phase' .aad/docs/run_*/progress.json

# 進捗率を表示
jq -r '.progress' .aad/docs/run_*/progress.json
```

---

## 実行例

### 成功パターン

```
🤖 Phase 1: 準備とタスク分割 [進捗: 10%]
   ✅ 要件ファイル読み取り完了
   ✅ タスク分割完了(7タスク)

🤖 Phase 2: Git環境セットアップ [進捗: 20%]
   ✅ 親ブランチ作成: feature/2026-02-03-user-management-api

🤖 Phase 3: タスクループ [進捗: 30-90%]
   ✅ task-1: プロジェクト構造とGo初期化 (2分, 100%カバレッジ)
   ✅ task-2: データベースマイグレーション (1分)
   ✅ task-3: ドメインモデル定義 (3分, 100%カバレッジ)
   ...

🤖 Phase 4: ドキュメント生成 [進捗: 95%]
   ✅ README.md生成
   ✅ API.md生成

🤖 Phase 5: 完了報告 [進捗: 100%]
   ✅ 全7タスク完了
   📊 総実行時間: 25分
   📊 生成コード: 2,643行
```

### エラー発生パターン

```
🤖 Phase 3: タスクループ [進捗: 45%]
   ✅ task-1: 完了
   ✅ task-2: 完了
   🟡 task-3: カバレッジ75% (目標80%未達) - 警告
   ✅ task-4: 完了
   🔴 task-5: Critical error - ロールバック開始

🔄 ロールバック実行中...
   ✅ Worktreeクリーンアップ完了
   ✅ ブランチ保持(削除しない)
   📄 ロールバックレポート生成: .aad/docs/run_*/rollback_report.md
```

---

## パイプライン設定

### タイムアウト設定

- Phase 1: 10分
- Phase 2: 5分
- Phase 3(各タスク): 30分
- Phase 4: 10分
- Phase 5: 5分

**総タイムアウト**: 3時間(タスク数により変動)

### リトライ設定

- タスク分割失敗: 最大3回
- テスト作成失敗: 最大2回
- 実装失敗: 最大3回
- コミット失敗: 最大2回

### 並列実行設定(将来実装)

現在は順次実行ですが、依存関係のないタスクは並列実行可能にする予定:

```json
{
  "parallel_execution": false,
  "max_parallel_tasks": 3
}
```

---

## 使用例

### 基本的な実行

```bash
./.aad/scripts/run-auto.sh sample_requirement.md
```

### 進捗監視付き実行

```bash
# ターミナル1: 実行
./.aad/scripts/run-auto.sh sample_requirement.md

# ターミナル2: 進捗監視
watch -n 5 'cat .aad/docs/run_*/progress.json | jq'
```

### エラー時のロールバック

```bash
# 自動ロールバック(Critical Error時)
# または手動ロールバック
git worktree list | grep wt- | awk '{print $1}' | xargs -I {} git worktree remove {}
```
