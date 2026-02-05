# Task-001: プロジェクト初期構造とディレクトリ構成の作成 - TDD Red フェーズ

## タスク概要

**Task ID**: task-001
**タイトル**: プロジェクト初期構造とディレクトリ構成の作成
**実行日時**: 2026-02-05
**ブランチ**: feature/_20260205_153345-task-001

## 目的

ルートディレクトリの構造を作成し、各サブディレクトリの基本構成を整備する。
backend/, frontend/, database/, shared/, docker/ のディレクトリとREADME.mdを作成する。

## 要件

### 成果物

1. **ルートディレクトリの基本構造**
   - `backend/` - バックエンドアプリケーション
   - `frontend/` - フロントエンドアプリケーション
   - `database/` - データベーススキーマ
   - `shared/` - 共有コード・型定義
   - `docker/` - Docker設定ファイル
   - `README.md` - プロジェクトドキュメント

2. **backend/ の基本構造**
   - `backend/README.md` - バックエンドドキュメント
   - `backend/package.json` - Node.js依存関係
   - `backend/server.js` - サーバーエントリーポイント
   - `backend/.gitignore` - Git除外設定

3. **frontend/ の基本構造**
   - `frontend/package.json` - フロントエンド依存関係
   - `frontend/index.html` - HTMLエントリーポイント
   - `frontend/vite.config.js` - Vite設定
   - `frontend/src/` - ソースコードディレクトリ
   - `frontend/.gitignore` - Git除外設定

4. **database/ の基本構造**
   - `database/schema.sql` - スキーマ定義
   - `database/README.md` - データベースドキュメント

5. **shared/ の基本構造**
   - `shared/` - ディレクトリ
   - `shared/README.md` - 共有コードドキュメント

6. **docker/ の基本構造**
   - `docker/` - ディレクトリ
   - `docker/docker-compose.yml` - Docker Compose設定
   - `docker/Dockerfile` - Dockerfile
   - `docker/README.md` - Dockerドキュメント

## TDD Red フェーズ実行結果

### テスト戦略

Goのテーブル駆動テストを使用して以下を検証:

1. **ルート構造チェック**: プロジェクトルートに必要なディレクトリとファイルが存在するか
2. **backend構造チェック**: backendディレクトリの基本ファイルが存在するか
3. **frontend構造チェック**: frontendディレクトリの基本ファイルが存在するか
4. **database構造チェック**: databaseディレクトリの基本ファイルが存在するか
5. **shared構造チェック**: sharedディレクトリとドキュメントが存在するか
6. **docker構造チェック**: dockerディレクトリと設定ファイルが存在するか
7. **README内容チェック**: ルートREADME.mdが存在し、内容を持つか

### 作成したテストファイル

**パス**: `test/structure/project_test.go`

**テスト関数**:
- `TestProjectRootStructure`: ルートディレクトリ構造の検証 (6ケース)
- `TestBackendStructure`: backendディレクトリ構造の検証 (4ケース)
- `TestFrontendStructure`: frontendディレクトリ構造の検証 (5ケース)
- `TestDatabaseStructure`: databaseディレクトリ構造の検証 (2ケース)
- `TestSharedStructure`: sharedディレクトリ構造の検証 (2ケース)
- `TestDockerStructure`: dockerディレクトリ構造の検証 (4ケース)
- `TestRootREADME`: ルートREADME.mdの存在と内容検証

**合計テストケース数**: 23ケース

### テスト実行結果

```bash
go test ./test/structure/... -v
```

**結果**: 一部テストが失敗（期待通り）

```
=== RUN   TestProjectRootStructure
=== RUN   TestProjectRootStructure/backend_ディレクトリが存在する
=== RUN   TestProjectRootStructure/frontend_ディレクトリが存在する
=== RUN   TestProjectRootStructure/database_ディレクトリが存在する
=== RUN   TestProjectRootStructure/shared_ディレクトリが存在する
    project_test.go:46: パスが存在しません: shared
=== RUN   TestProjectRootStructure/docker_ディレクトリが存在する
    project_test.go:46: パスが存在しません: docker
=== RUN   TestProjectRootStructure/README.md_が存在する
    project_test.go:46: パスが存在しません: README.md
--- FAIL: TestProjectRootStructure (0.00s)
    --- PASS: TestProjectRootStructure/backend_ディレクトリが存在する
    --- PASS: TestProjectRootStructure/frontend_ディレクトリが存在する
    --- PASS: TestProjectRootStructure/database_ディレクトリが存在する
    --- FAIL: TestProjectRootStructure/shared_ディレクトリが存在する
    --- FAIL: TestProjectRootStructure/docker_ディレクトリが存在する
    --- FAIL: TestProjectRootStructure/README.md_が存在する

=== RUN   TestBackendStructure
--- PASS: TestBackendStructure (0.00s)
    (全てパス)

=== RUN   TestFrontendStructure
=== RUN   TestFrontendStructure/frontend/vite.config.js_が存在する
    project_test.go:133: パスが存在しません: frontend/vite.config.js
--- FAIL: TestFrontendStructure (0.00s)
    --- FAIL: TestFrontendStructure/frontend/vite.config.js_が存在する

=== RUN   TestDatabaseStructure
--- PASS: TestDatabaseStructure (0.00s)
    (全てパス)

=== RUN   TestSharedStructure
=== RUN   TestSharedStructure/shared_ディレクトリが存在する
    project_test.go:211: パスが存在しません: shared
=== RUN   TestSharedStructure/shared/README.md_が存在する
    project_test.go:211: パスが存在しません: shared/README.md
--- FAIL: TestSharedStructure (0.00s)
    --- FAIL: TestSharedStructure/shared_ディレクトリが存在する
    --- FAIL: TestSharedStructure/shared/README.md_が存在する

=== RUN   TestDockerStructure
=== RUN   TestDockerStructure/docker_ディレクトリが存在する
    project_test.go:252: パスが存在しません: docker
=== RUN   TestDockerStructure/docker/docker-compose.yml_が存在する
    project_test.go:252: パスが存在しません: docker/docker-compose.yml
=== RUN   TestDockerStructure/docker/Dockerfile_が存在する
    project_test.go:252: パスが存在しません: docker/Dockerfile
=== RUN   TestDockerStructure/docker/README.md_が存在する
    project_test.go:252: パスが存在しません: docker/README.md
--- FAIL: TestDockerStructure (0.00s)
    --- FAIL: TestDockerStructure/docker_ディレクトリが存在する
    --- FAIL: TestDockerStructure/docker/docker-compose.yml_が存在する
    --- FAIL: TestDockerStructure/docker/Dockerfile_が存在する
    --- FAIL: TestDockerStructure/docker/README.md_が存在する

=== RUN   TestRootREADME
    project_test.go:277: README.md が存在しません
--- FAIL: TestRootREADME (0.00s)

FAIL
FAIL	github.com/kazuki/aad-prototype-tmp/test/structure	0.425s
FAIL
```

## 失敗理由の分析

### 1. 既存構造（テストパス）

以下のディレクトリとファイルは既に存在し、テストが正しくパスしています：
- ✅ `backend/` ディレクトリとその基本ファイル
- ✅ `frontend/` ディレクトリ（vite.config.js以外）
- ✅ `database/` ディレクトリとその基本ファイル

### 2. 不足している構造（テスト失敗）

以下のディレクトリとファイルが存在せず、テストが期待通り失敗しています：

#### ルートディレクトリ
- ❌ `shared/` ディレクトリが存在しない
- ❌ `docker/` ディレクトリが存在しない
- ❌ `README.md` が存在しない

#### frontend
- ❌ `frontend/vite.config.js` が存在しない

#### shared（全て不在）
- ❌ `shared/` ディレクトリが存在しない
- ❌ `shared/README.md` が存在しない

#### docker（全て不在）
- ❌ `docker/` ディレクトリが存在しない
- ❌ `docker/docker-compose.yml` が存在しない
- ❌ `docker/Dockerfile` が存在しない
- ❌ `docker/README.md` が存在しない

## 次のステップ (Green フェーズ)

implementerエージェントが以下を実装する必要がある:

### 1. ルートREADME.mdの作成
- プロジェクト概要
- ディレクトリ構造の説明
- セットアップ手順

### 2. shared/ ディレクトリの作成
- `shared/` ディレクトリの作成
- `shared/README.md` の作成（共有コード・型定義の説明）

### 3. docker/ ディレクトリの作成
- `docker/` ディレクトリの作成
- `docker/docker-compose.yml` の作成（PostgreSQL, backend, frontend）
- `docker/Dockerfile` の作成（基本的なNode.js環境）
- `docker/README.md` の作成（Dockerセットアップ手順）

### 4. frontend/vite.config.js の作成
- Vite設定ファイルの作成
- プロキシ設定など基本設定

## 結論

✅ **TDD Red フェーズは成功しました**

- 23個のテストケースを作成
- 必要な構造の一部が既に存在することを確認
- 不足している構造（shared, docker, README.md等）を明確に特定
- 失敗理由が明確（ディレクトリ・ファイル不在）
- 次の実装ステップが明確化された

これで実装フェーズ（Green）に進む準備が整いました。
