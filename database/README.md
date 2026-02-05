# Database Schema

## データベース情報

- **データベース名**: todo_db
- **RDBMS**: PostgreSQL 16

## テーブル

### todos

TODOアイテムを管理するテーブルです。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | SERIAL | PRIMARY KEY | 自動採番されるID |
| title | VARCHAR(200) | NOT NULL | TODOのタイトル |
| completed | BOOLEAN | DEFAULT false | 完了状態 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

## セットアップ

```bash
psql -U postgres -d todo_db -f schema.sql
```
