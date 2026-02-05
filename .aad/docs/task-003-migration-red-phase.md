# Task-003: データベーススキーマとマイグレーションの作成 - TDD Red フェーズ

## タスク概要

PostgreSQL用のusers, posts, commentsテーブルのマイグレーションファイルを作成する。

### 要件

#### 1. users テーブル
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR NOT NULL UNIQUE)
- `email` (VARCHAR NOT NULL UNIQUE)
- `created_at` (TIMESTAMP DEFAULT NOW())

#### 2. posts テーブル
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY → users.id)
- `title` (VARCHAR NOT NULL)
- `content` (TEXT)
- `created_at` (TIMESTAMP DEFAULT NOW())

#### 3. comments テーブル
- `id` (SERIAL PRIMARY KEY)
- `post_id` (INTEGER, FOREIGN KEY → posts.id)
- `user_id` (INTEGER, FOREIGN KEY → users.id)
- `content` (TEXT NOT NULL)
- `created_at` (TIMESTAMP DEFAULT NOW())

### マイグレーションファイル構成
- UPマイグレーション: テーブル作成
- DOWNマイグレーション: テーブル削除
- README.md: マイグレーション実行方法の説明

## 実施内容

### 1. Goテストの作成

#### test/database/migration_test.go

Goのテーブル駆動テストパターンで以下のテストケースを作成:

##### TestMigrationDirectoryStructure (7テスト)
1. `database/migrations/` ディレクトリが存在する
2. `001_create_users_table.up.sql` が存在する
3. `001_create_users_table.down.sql` が存在する
4. `002_create_posts_table.up.sql` が存在する
5. `002_create_posts_table.down.sql` が存在する
6. `003_create_comments_table.up.sql` が存在する
7. `003_create_comments_table.down.sql` が存在する

##### TestUsersTableMigration (9テスト)
**UP マイグレーション:**
1. CREATE TABLE users 文が存在する
2. id カラムが SERIAL PRIMARY KEY として定義されている
3. username カラムが VARCHAR として定義されている
4. username に NOT NULL 制約がある
5. username に UNIQUE 制約がある
6. email カラムが定義されている
7. created_at カラムが TIMESTAMP として定義されている

**DOWN マイグレーション:**
8. DROP TABLE 文が存在する
9. users テーブルの削除文が存在する

##### TestPostsTableMigration (10テスト)
**UP マイグレーション:**
1. CREATE TABLE posts 文が存在する
2. id カラムが SERIAL PRIMARY KEY として定義されている
3. user_id カラムが INTEGER として定義されている
4. user_id に外部キー制約がある
5. user_id が users テーブルを参照している
6. title カラムが VARCHAR NOT NULL として定義されている
7. content カラムが TEXT として定義されている
8. created_at カラムが TIMESTAMP として定義されている

**DOWN マイグレーション:**
9. DROP TABLE 文が存在する
10. posts テーブルの削除文が存在する

##### TestCommentsTableMigration (10テスト)
**UP マイグレーション:**
1. CREATE TABLE comments 文が存在する
2. id カラムが SERIAL PRIMARY KEY として定義されている
3. post_id カラムが INTEGER として定義されている
4. post_id が posts テーブルを参照している
5. user_id カラムが INTEGER として定義されている
6. user_id が users テーブルを参照している
7. content カラムが TEXT NOT NULL として定義されている
8. created_at カラムが TIMESTAMP として定義されている

**DOWN マイグレーション:**
9. DROP TABLE 文が存在する
10. comments テーブルの削除文が存在する

##### TestMigrationFilesNotEmpty (6テスト)
各マイグレーションファイルが空でないことを確認:
1. `001_create_users_table.up.sql`
2. `001_create_users_table.down.sql`
3. `002_create_posts_table.up.sql`
4. `002_create_posts_table.down.sql`
5. `003_create_comments_table.up.sql`
6. `003_create_comments_table.down.sql`

##### TestMigrationREADME (4テスト)
1. README.md が存在する
2. マイグレーションの記載がある
3. 実行方法の記載がある
4. データベースの記載がある

### 2. テスト実行結果

#### Red フェーズ - 失敗確認

```bash
cd test/database && go test -v migration_test.go
```

#### 結果サマリー
- **合計テスト関数**: 6個
- **合計サブテスト**: 46個
- **失敗**: 46個 ✓ (期待通り)
- **成功**: 0個
- **実行時間**: 0.368秒

#### 失敗理由

すべての失敗は以下の理由による:

**1. ディレクトリとファイルが存在しない**
```
パスが存在しません: database/migrations (エラー: stat database/migrations: no such file or directory)
```

**2. マイグレーションファイルが読み込めない**
```
マイグレーションファイルを読み込めません: open database/migrations/001_create_users_table.up.sql: no such file or directory
```

**3. README.mdが存在しない**
```
README.md が存在しません: stat database/migrations/README.md: no such file or directory
```

これは**期待通りの動作**です。実装前なので、テストが失敗するのは正しいTDD Redフェーズです。

### 失敗したテストの詳細

#### 必要なファイル構成

```
database/
└── migrations/
    ├── README.md
    ├── 001_create_users_table.up.sql
    ├── 001_create_users_table.down.sql
    ├── 002_create_posts_table.up.sql
    ├── 002_create_posts_table.down.sql
    ├── 003_create_comments_table.up.sql
    └── 003_create_comments_table.down.sql
```

## 次のステップ (Green フェーズ)

implementerエージェントが以下を実装する必要があります:

### 1. ディレクトリ作成
```bash
mkdir -p database/migrations
```

### 2. users テーブルマイグレーション

**database/migrations/001_create_users_table.up.sql:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**database/migrations/001_create_users_table.down.sql:**
```sql
DROP TABLE IF EXISTS users;
```

### 3. posts テーブルマイグレーション

**database/migrations/002_create_posts_table.up.sql:**
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**database/migrations/002_create_posts_table.down.sql:**
```sql
DROP TABLE IF EXISTS posts;
```

### 4. comments テーブルマイグレーション

**database/migrations/003_create_comments_table.up.sql:**
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**database/migrations/003_create_comments_table.down.sql:**
```sql
DROP TABLE IF EXISTS comments;
```

### 5. README.md

**database/migrations/README.md:**
マイグレーションの実行方法、必要な環境、データベース接続情報を記載する。

## TDD Red フェーズ完了

✅ テストが失敗することを確認しました。
✅ 実装コードは一切書いていません。
✅ 次のGreenフェーズでテストをパスさせる実装を行います。

## テスト実行コマンド

```bash
# プロジェクトルートから実行
cd test/database && go test -v migration_test.go

# または特定のテストのみ実行
cd test/database && go test -v -run TestUsersTableMigration migration_test.go
cd test/database && go test -v -run TestPostsTableMigration migration_test.go
cd test/database && go test -v -run TestCommentsTableMigration migration_test.go
```

## ファイル構成

- **テストファイル**: `test/database/migration_test.go` (作成完了)
- **実装ファイル**: `database/migrations/*.sql` (未作成 - Green フェーズで作成)
- **ドキュメント**: `database/migrations/README.md` (未作成 - Green フェーズで作成)
