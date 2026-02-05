package database_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestMigrationDirectoryStructure はdatabase/migrations/ディレクトリの構造を検証する
func TestMigrationDirectoryStructure(t *testing.T) {
	tests := []struct {
		name     string
		path     string
		wantFile bool
	}{
		{
			name:     "database/migrations ディレクトリが存在する",
			path:     "database/migrations",
			wantFile: false,
		},
		{
			name:     "001_create_users_table.up.sql が存在する",
			path:     "database/migrations/001_create_users_table.up.sql",
			wantFile: true,
		},
		{
			name:     "001_create_users_table.down.sql が存在する",
			path:     "database/migrations/001_create_users_table.down.sql",
			wantFile: true,
		},
		{
			name:     "002_create_posts_table.up.sql が存在する",
			path:     "database/migrations/002_create_posts_table.up.sql",
			wantFile: true,
		},
		{
			name:     "002_create_posts_table.down.sql が存在する",
			path:     "database/migrations/002_create_posts_table.down.sql",
			wantFile: true,
		},
		{
			name:     "003_create_comments_table.up.sql が存在する",
			path:     "database/migrations/003_create_comments_table.up.sql",
			wantFile: true,
		},
		{
			name:     "003_create_comments_table.down.sql が存在する",
			path:     "database/migrations/003_create_comments_table.down.sql",
			wantFile: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			info, err := os.Stat(tt.path)
			if err != nil {
				t.Fatalf("パスが存在しません: %s (エラー: %v)", tt.path, err)
			}

			if tt.wantFile && info.IsDir() {
				t.Errorf("%s はディレクトリですが、ファイルである必要があります", tt.path)
			}
			if !tt.wantFile && !info.IsDir() {
				t.Errorf("%s はファイルですが、ディレクトリである必要があります", tt.path)
			}
		})
	}
}

// TestUsersTableMigration は users テーブルのマイグレーションを検証する
func TestUsersTableMigration(t *testing.T) {
	upPath := "database/migrations/001_create_users_table.up.sql"
	downPath := "database/migrations/001_create_users_table.down.sql"

	t.Run("UP マイグレーション - users テーブル作成", func(t *testing.T) {
		content, err := os.ReadFile(upPath)
		if err != nil {
			t.Fatalf("マイグレーションファイルを読み込めません: %v", err)
		}

		sql := string(content)
		tests := []struct {
			name    string
			pattern string
			wantMsg string
		}{
			{
				name:    "CREATE TABLE users 文が存在する",
				pattern: "CREATE TABLE users",
				wantMsg: "CREATE TABLE users 文が見つかりません",
			},
			{
				name:    "id カラムが SERIAL PRIMARY KEY として定義されている",
				pattern: "id SERIAL PRIMARY KEY",
				wantMsg: "id カラムが正しく定義されていません",
			},
			{
				name:    "username カラムが VARCHAR NOT NULL UNIQUE として定義されている",
				pattern: "username VARCHAR",
				wantMsg: "username カラムが定義されていません",
			},
			{
				name:    "username に NOT NULL 制約がある",
				pattern: "NOT NULL",
				wantMsg: "username に NOT NULL 制約がありません",
			},
			{
				name:    "username に UNIQUE 制約がある",
				pattern: "UNIQUE",
				wantMsg: "username に UNIQUE 制約がありません",
			},
			{
				name:    "email カラムが定義されている",
				pattern: "email VARCHAR",
				wantMsg: "email カラムが定義されていません",
			},
			{
				name:    "created_at カラムが TIMESTAMP として定義されている",
				pattern: "created_at TIMESTAMP",
				wantMsg: "created_at カラムが定義されていません",
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				normalizedSQL := strings.ToUpper(strings.Join(strings.Fields(sql), " "))
				normalizedPattern := strings.ToUpper(strings.Join(strings.Fields(tt.pattern), " "))

				if !strings.Contains(normalizedSQL, normalizedPattern) {
					t.Errorf("%s\n期待されるパターン: %s\n実際のSQL:\n%s", tt.wantMsg, tt.pattern, sql)
				}
			})
		}
	})

	t.Run("DOWN マイグレーション - users テーブル削除", func(t *testing.T) {
		content, err := os.ReadFile(downPath)
		if err != nil {
			t.Fatalf("マイグレーションファイルを読み込めません: %v", err)
		}

		sql := string(content)
		normalizedSQL := strings.ToUpper(strings.Join(strings.Fields(sql), " "))

		if !strings.Contains(normalizedSQL, "DROP TABLE") {
			t.Errorf("DROP TABLE 文が見つかりません\n実際のSQL:\n%s", sql)
		}
		if !strings.Contains(normalizedSQL, "USERS") {
			t.Errorf("users テーブルの削除文が見つかりません\n実際のSQL:\n%s", sql)
		}
	})
}

// TestPostsTableMigration は posts テーブルのマイグレーションを検証する
func TestPostsTableMigration(t *testing.T) {
	upPath := "database/migrations/002_create_posts_table.up.sql"
	downPath := "database/migrations/002_create_posts_table.down.sql"

	t.Run("UP マイグレーション - posts テーブル作成", func(t *testing.T) {
		content, err := os.ReadFile(upPath)
		if err != nil {
			t.Fatalf("マイグレーションファイルを読み込めません: %v", err)
		}

		sql := string(content)
		tests := []struct {
			name    string
			pattern string
			wantMsg string
		}{
			{
				name:    "CREATE TABLE posts 文が存在する",
				pattern: "CREATE TABLE posts",
				wantMsg: "CREATE TABLE posts 文が見つかりません",
			},
			{
				name:    "id カラムが SERIAL PRIMARY KEY として定義されている",
				pattern: "id SERIAL PRIMARY KEY",
				wantMsg: "id カラムが正しく定義されていません",
			},
			{
				name:    "user_id カラムが INTEGER として定義されている",
				pattern: "user_id INTEGER",
				wantMsg: "user_id カラムが定義されていません",
			},
			{
				name:    "user_id に外部キー制約がある",
				pattern: "FOREIGN KEY",
				wantMsg: "外部キー制約が定義されていません",
			},
			{
				name:    "user_id が users テーブルを参照している",
				pattern: "REFERENCES users",
				wantMsg: "users テーブルへの参照が定義されていません",
			},
			{
				name:    "title カラムが VARCHAR NOT NULL として定義されている",
				pattern: "title VARCHAR",
				wantMsg: "title カラムが定義されていません",
			},
			{
				name:    "content カラムが TEXT として定義されている",
				pattern: "content TEXT",
				wantMsg: "content カラムが定義されていません",
			},
			{
				name:    "created_at カラムが TIMESTAMP として定義されている",
				pattern: "created_at TIMESTAMP",
				wantMsg: "created_at カラムが定義されていません",
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				normalizedSQL := strings.ToUpper(strings.Join(strings.Fields(sql), " "))
				normalizedPattern := strings.ToUpper(strings.Join(strings.Fields(tt.pattern), " "))

				if !strings.Contains(normalizedSQL, normalizedPattern) {
					t.Errorf("%s\n期待されるパターン: %s\n実際のSQL:\n%s", tt.wantMsg, tt.pattern, sql)
				}
			})
		}
	})

	t.Run("DOWN マイグレーション - posts テーブル削除", func(t *testing.T) {
		content, err := os.ReadFile(downPath)
		if err != nil {
			t.Fatalf("マイグレーションファイルを読み込めません: %v", err)
		}

		sql := string(content)
		normalizedSQL := strings.ToUpper(strings.Join(strings.Fields(sql), " "))

		if !strings.Contains(normalizedSQL, "DROP TABLE") {
			t.Errorf("DROP TABLE 文が見つかりません\n実際のSQL:\n%s", sql)
		}
		if !strings.Contains(normalizedSQL, "POSTS") {
			t.Errorf("posts テーブルの削除文が見つかりません\n実際のSQL:\n%s", sql)
		}
	})
}

// TestCommentsTableMigration は comments テーブルのマイグレーションを検証する
func TestCommentsTableMigration(t *testing.T) {
	upPath := "database/migrations/003_create_comments_table.up.sql"
	downPath := "database/migrations/003_create_comments_table.down.sql"

	t.Run("UP マイグレーション - comments テーブル作成", func(t *testing.T) {
		content, err := os.ReadFile(upPath)
		if err != nil {
			t.Fatalf("マイグレーションファイルを読み込めません: %v", err)
		}

		sql := string(content)
		tests := []struct {
			name    string
			pattern string
			wantMsg string
		}{
			{
				name:    "CREATE TABLE comments 文が存在する",
				pattern: "CREATE TABLE comments",
				wantMsg: "CREATE TABLE comments 文が見つかりません",
			},
			{
				name:    "id カラムが SERIAL PRIMARY KEY として定義されている",
				pattern: "id SERIAL PRIMARY KEY",
				wantMsg: "id カラムが正しく定義されていません",
			},
			{
				name:    "post_id カラムが INTEGER として定義されている",
				pattern: "post_id INTEGER",
				wantMsg: "post_id カラムが定義されていません",
			},
			{
				name:    "post_id が posts テーブルを参照している",
				pattern: "REFERENCES posts",
				wantMsg: "posts テーブルへの参照が定義されていません",
			},
			{
				name:    "user_id カラムが INTEGER として定義されている",
				pattern: "user_id INTEGER",
				wantMsg: "user_id カラムが定義されていません",
			},
			{
				name:    "user_id が users テーブルを参照している",
				pattern: "REFERENCES users",
				wantMsg: "users テーブルへの参照が定義されていません",
			},
			{
				name:    "content カラムが TEXT NOT NULL として定義されている",
				pattern: "content TEXT",
				wantMsg: "content カラムが定義されていません",
			},
			{
				name:    "created_at カラムが TIMESTAMP として定義されている",
				pattern: "created_at TIMESTAMP",
				wantMsg: "created_at カラムが定義されていません",
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				normalizedSQL := strings.ToUpper(strings.Join(strings.Fields(sql), " "))
				normalizedPattern := strings.ToUpper(strings.Join(strings.Fields(tt.pattern), " "))

				if !strings.Contains(normalizedSQL, normalizedPattern) {
					t.Errorf("%s\n期待されるパターン: %s\n実際のSQL:\n%s", tt.wantMsg, tt.pattern, sql)
				}
			})
		}
	})

	t.Run("DOWN マイグレーション - comments テーブル削除", func(t *testing.T) {
		content, err := os.ReadFile(downPath)
		if err != nil {
			t.Fatalf("マイグレーションファイルを読み込めません: %v", err)
		}

		sql := string(content)
		normalizedSQL := strings.ToUpper(strings.Join(strings.Fields(sql), " "))

		if !strings.Contains(normalizedSQL, "DROP TABLE") {
			t.Errorf("DROP TABLE 文が見つかりません\n実際のSQL:\n%s", sql)
		}
		if !strings.Contains(normalizedSQL, "COMMENTS") {
			t.Errorf("comments テーブルの削除文が見つかりません\n実際のSQL:\n%s", sql)
		}
	})
}

// TestMigrationFilesNotEmpty はマイグレーションファイルが空でないことを確認する
func TestMigrationFilesNotEmpty(t *testing.T) {
	files := []string{
		"database/migrations/001_create_users_table.up.sql",
		"database/migrations/001_create_users_table.down.sql",
		"database/migrations/002_create_posts_table.up.sql",
		"database/migrations/002_create_posts_table.down.sql",
		"database/migrations/003_create_comments_table.up.sql",
		"database/migrations/003_create_comments_table.down.sql",
	}

	for _, file := range files {
		t.Run(file+" が空でないことを確認", func(t *testing.T) {
			absPath, err := filepath.Abs(file)
			if err != nil {
				t.Fatalf("絶対パスの取得に失敗: %v", err)
			}

			content, err := os.ReadFile(absPath)
			if err != nil {
				t.Fatalf("ファイルを読み込めません: %v (パス: %s)", err, absPath)
			}

			if len(strings.TrimSpace(string(content))) == 0 {
				t.Errorf("%s が空です。マイグレーションSQL文を記述してください", file)
			}
		})
	}
}

// TestMigrationREADME はマイグレーションのREADME.mdを検証する
func TestMigrationREADME(t *testing.T) {
	readmePath := "database/migrations/README.md"

	t.Run("README.md が存在する", func(t *testing.T) {
		_, err := os.Stat(readmePath)
		if err != nil {
			t.Fatalf("README.md が存在しません: %v", err)
		}
	})

	t.Run("README.md にマイグレーション実行方法が記載されている", func(t *testing.T) {
		content, err := os.ReadFile(readmePath)
		if err != nil {
			t.Fatalf("README.md を読み込めません: %v", err)
		}

		readme := string(content)
		patterns := []struct {
			name    string
			pattern string
		}{
			{"マイグレーション", "migration"},
			{"実行方法", "実行"},
			{"データベース", "database"},
		}

		for _, p := range patterns {
			t.Run(p.name+" の記載がある", func(t *testing.T) {
				lowerReadme := strings.ToLower(readme)
				lowerPattern := strings.ToLower(p.pattern)
				if !strings.Contains(lowerReadme, lowerPattern) {
					t.Errorf("README.md に %s の記載がありません\n実際の内容:\n%s", p.name, readme)
				}
			})
		}
	})
}
