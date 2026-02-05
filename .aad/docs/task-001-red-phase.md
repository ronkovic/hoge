# Task-001: データベーススキーマのセットアップ - TDD Red フェーズ

## タスク概要

**Task ID**: task-001
**タイトル**: データベーススキーマのセットアップ
**実行日時**: 2026-02-05

## 目的

PostgreSQL 16用のtodosテーブルを定義するSQLスキーマファイルを作成する。

## 要件

### 成果物
- `database/schema.sql`: テーブル定義
- `database/README.md`: ドキュメント

### テーブル仕様
- `id`: SERIAL PRIMARY KEY
- `title`: VARCHAR(200) NOT NULL
- `completed`: BOOLEAN DEFAULT false
- `created_at`: TIMESTAMP DEFAULT NOW()

## TDD Red フェーズ実行結果

### テスト戦略

Goのテーブル駆動テストを使用して以下を検証:

1. **ファイル存在チェック**: schema.sqlとREADME.mdが正しい場所に存在するか
2. **SQL構文検証**: schema.sqlが有効なPostgreSQL SQLであるか
3. **テーブル定義検証**: 必要なカラムと制約が正しく定義されているか

### 作成したテストファイル

- **パス**: `test/database/schema_test.go`
- **テストケース数**: 5つのテスト関数
  - `TestDatabaseDirectoryStructure`: ディレクトリ構造の検証
  - `TestSchemaSQL`: schema.sqlの内容検証
  - `TestSchemaTableColumns`: テーブルカラムの存在確認
  - `TestREADME`: README.mdの内容検証
  - `TestSQLFileIsNotEmpty`: schema.sqlが空でないことの確認

### テスト実行結果

```
go test ./test/database/... -v
```

**結果**: 全テストが失敗（期待通り）

```
=== RUN   TestDatabaseDirectoryStructure
=== RUN   TestDatabaseDirectoryStructure/database_ディレクトリが存在する
    schema_test.go:38: パスが存在しません: database (エラー: stat database: no such file or directory)
=== RUN   TestDatabaseDirectoryStructure/schema.sql_が存在する
    schema_test.go:38: パスが存在しません: database/schema.sql (エラー: stat database/schema.sql: no such file or directory)
=== RUN   TestDatabaseDirectoryStructure/README.md_が存在する
    schema_test.go:38: パスが存在しません: database/README.md (エラー: stat database/README.md: no such file or directory)
--- FAIL: TestDatabaseDirectoryStructure (0.00s)
    --- FAIL: TestDatabaseDirectoryStructure/database_ディレクトリが存在する (0.00s)
    --- FAIL: TestDatabaseDirectoryStructure/schema.sql_が存在する (0.00s)
    --- FAIL: TestDatabaseDirectoryStructure/README.md_が存在する (0.00s)
=== RUN   TestSchemaSQL
    schema_test.go:56: schema.sql を読み込めません: open database/schema.sql: no such file or directory
--- FAIL: TestSchemaSQL (0.00s)
=== RUN   TestSchemaTableColumns
    schema_test.go:111: schema.sql を読み込めません: open database/schema.sql: no such file or directory
--- FAIL: TestSchemaTableColumns (0.00s)
=== RUN   TestREADME
    schema_test.go:132: README.md を読み込めません: open database/README.md: no such file or directory
--- FAIL: TestREADME (0.00s)
=== RUN   TestSQLFileIsNotEmpty
    schema_test.go:179: schema.sql を読み込めません: open /Users/kazuki/workspace/sandbox/worktrees/wt-task-001/test/database/database/schema.sql: no such file or directory
--- FAIL: TestSQLFileIsNotEmpty (0.00s)
FAIL
FAIL	github.com/kazuki/aad-prototype-tmp/test/database	0.438s
FAIL
```

## 失敗理由の分析

### 1. ディレクトリ不在
- `database/` ディレクトリが存在しない

### 2. ファイル不在
- `database/schema.sql` が存在しない
- `database/README.md` が存在しない

### 3. 検証不可
- ファイルが存在しないため、SQL構文やテーブル定義の検証が実行できない

## 次のステップ (Green フェーズ)

implementerエージェントが以下を実装する必要がある:

1. `database/` ディレクトリの作成
2. `database/schema.sql` の作成
   - CREATE TABLE todos 文
   - id SERIAL PRIMARY KEY
   - title VARCHAR(200) NOT NULL
   - completed BOOLEAN DEFAULT false
   - created_at TIMESTAMP DEFAULT NOW()
3. `database/README.md` の作成
   - データベース名: todo_db
   - PostgreSQL バージョンの記載
   - テーブル名: todos の記載

## 結論

✅ **TDD Red フェーズは成功しました**

- 全テストが期待通り失敗している
- 失敗理由が明確（ファイル・ディレクトリ不在）
- 次の実装ステップが明確化された

これで実装フェーズ（Green）に進む準備が整いました。
