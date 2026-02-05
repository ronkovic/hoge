# Database Migrations

## 概要

このディレクトリには、データベースのマイグレーションファイルが含まれています。

## マイグレーション一覧

1. `001_create_users_table` - users テーブルの作成
2. `002_create_posts_table` - posts テーブルの作成
3. `003_create_comments_table` - comments テーブルの作成

## マイグレーション実行方法

### UP マイグレーション (テーブル作成)

```bash
# 全てのマイグレーションを実行
psql -U postgres -d your_database < database/migrations/001_create_users_table.up.sql
psql -U postgres -d your_database < database/migrations/002_create_posts_table.up.sql
psql -U postgres -d your_database < database/migrations/003_create_comments_table.up.sql
```

### DOWN マイグレーション (テーブル削除)

```bash
# 逆順でマイグレーションをロールバック
psql -U postgres -d your_database < database/migrations/003_create_comments_table.down.sql
psql -U postgres -d your_database < database/migrations/002_create_posts_table.down.sql
psql -U postgres -d your_database < database/migrations/001_create_users_table.down.sql
```

## テーブル構造

### users
- id: SERIAL PRIMARY KEY
- username: VARCHAR(255) NOT NULL UNIQUE
- email: VARCHAR(255) NOT NULL UNIQUE
- created_at: TIMESTAMP DEFAULT NOW()

### posts
- id: SERIAL PRIMARY KEY
- user_id: INTEGER NOT NULL (FK → users.id)
- title: VARCHAR(255) NOT NULL
- content: TEXT
- created_at: TIMESTAMP DEFAULT NOW()

### comments
- id: SERIAL PRIMARY KEY
- post_id: INTEGER NOT NULL (FK → posts.id)
- user_id: INTEGER NOT NULL (FK → users.id)
- content: TEXT NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()

## 注意事項

- マイグレーションは番号順に実行してください
- DOWN マイグレーションは逆順で実行してください
- 外部キー制約があるため、テーブルの削除順序に注意が必要です
