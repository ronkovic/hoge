---
name: implement-plan
description: 計画に基づいた実装ワークフローを実行
argument-hint: [run-id]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Implement Plan

## 概要

`.aad/docs/[run-id]/task_plan.json` に基づいて、TDDサイクルを実行しながら実装を進めます。

## 手順

1. **計画の読み込み**: `task_plan.json` を読み込み、タスク一覧と依存関係を把握
2. **実行順序の決定**: 依存関係を解決して、実行可能なタスクから順に処理
3. **TDDサイクルの実行**: 各タスクで以下を実行
   - 🔴 **Red**: 失敗するテストを書く
   - 🟢 **Green**: 最小限の実装でテストをパスさせる
   - 🔵 **Refactor**: コードをリファクタリング
4. **進捗の記録**: `progress.json` を更新
5. **完了確認**: 全タスクが完了したら、コミットとWorktreeクリーンアップ

## チェックポイント

### 優先順位

- ✅ **機能的正しさ優先**: テストがパスすることを最優先
- ❌ **修飾的問題は後回し**: 全角/半角、コメント体裁は後で対応

### タスク完了の徹底

- [ ] 未コミットの変更をコミット
- [ ] 失敗したテストを記録
- [ ] Worktreeをクリーンアップ

## 使用例

```bash
# 計画に基づいた実装を開始
/implement-plan 2026-02-04-user-auth

# 実行される処理:
# 1. .aad/docs/2026-02-04-user-auth/task_plan.json を読み込み
# 2. タスクを依存関係順に実行
# 3. 各タスクでTDDサイクルを実行
# 4. 完了後に progress.json を更新
```

## エラーハンドリング

- **計画ファイルが見つからない**: ユーザーに run-id を確認
- **依存関係の循環**: エラーを報告し、ユーザーに修正を依頼
- **テスト失敗**: 失敗内容を `.aad/docs/[run-id]/test_results.md` に記録

## 出力

```markdown
## 実装完了レポート

### タスク: task-001
- 状態: ✅ 完了
- テスト: 5/5 パス
- コミット: abc1234

### タスク: task-002
- 状態: ⚠️  警告: 1件のテスト失敗
- テスト: 4/5 パス
- 失敗: TestUserLogin - invalid credentials not handled
- コミット: def5678

### 次のアクション
- task-002 のテスト失敗を修正
- Worktree をクリーンアップ
```
