package database_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestDatabaseDirectoryStructure はdatabase/ディレクトリの構造を検証する
func TestDatabaseDirectoryStructure(t *testing.T) {
	tests := []struct {
		name     string
		path     string
		wantFile bool
	}{
		{
			name:     "database ディレクトリが存在する",
			path:     "database",
			wantFile: false,
		},
		{
			name:     "schema.sql が存在する",
			path:     "database/schema.sql",
			wantFile: true,
		},
		{
			name:     "README.md が存在する",
			path:     "database/README.md",
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

// TestSchemaSQL はschema.sqlの内容を検証する
func TestSchemaSQL(t *testing.T) {
	schemaPath := "database/schema.sql"
	content, err := os.ReadFile(schemaPath)
	if err != nil {
		t.Fatalf("schema.sql を読み込めません: %v", err)
	}

	sql := string(content)

	tests := []struct {
		name    string
		pattern string
		wantMsg string
	}{
		{
			name:    "CREATE TABLE todos 文が存在する",
			pattern: "CREATE TABLE todos",
			wantMsg: "CREATE TABLE todos 文が見つかりません",
		},
		{
			name:    "id カラムが SERIAL PRIMARY KEY として定義されている",
			pattern: "id SERIAL PRIMARY KEY",
			wantMsg: "id カラムが SERIAL PRIMARY KEY として定義されていません",
		},
		{
			name:    "title カラムが VARCHAR(200) NOT NULL として定義されている",
			pattern: "title VARCHAR(200) NOT NULL",
			wantMsg: "title カラムが VARCHAR(200) NOT NULL として定義されていません",
		},
		{
			name:    "completed カラムが BOOLEAN DEFAULT false として定義されている",
			pattern: "completed BOOLEAN DEFAULT false",
			wantMsg: "completed カラムが BOOLEAN DEFAULT false として定義されていません",
		},
		{
			name:    "created_at カラムが TIMESTAMP DEFAULT NOW() として定義されている",
			pattern: "created_at TIMESTAMP DEFAULT NOW()",
			wantMsg: "created_at カラムが TIMESTAMP DEFAULT NOW() として定義されていません",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 大文字小文字を区別せず、余分な空白を無視して比較
			normalizedSQL := strings.ToUpper(strings.Join(strings.Fields(sql), " "))
			normalizedPattern := strings.ToUpper(strings.Join(strings.Fields(tt.pattern), " "))

			if !strings.Contains(normalizedSQL, normalizedPattern) {
				t.Errorf("%s\n期待されるパターン: %s\n実際のSQL:\n%s", tt.wantMsg, tt.pattern, sql)
			}
		})
	}
}

// TestSchemaTableColumns はテーブルのカラム構成を検証する
func TestSchemaTableColumns(t *testing.T) {
	schemaPath := "database/schema.sql"
	content, err := os.ReadFile(schemaPath)
	if err != nil {
		t.Fatalf("schema.sql を読み込めません: %v", err)
	}

	sql := strings.ToUpper(string(content))

	requiredColumns := []string{"ID", "TITLE", "COMPLETED", "CREATED_AT"}

	for _, col := range requiredColumns {
		t.Run("カラム "+col+" が存在する", func(t *testing.T) {
			if !strings.Contains(sql, col) {
				t.Errorf("必須カラム %s が schema.sql に見つかりません", col)
			}
		})
	}
}

// TestREADME はREADME.mdの内容を検証する
func TestREADME(t *testing.T) {
	readmePath := "database/README.md"
	content, err := os.ReadFile(readmePath)
	if err != nil {
		t.Fatalf("README.md を読み込めません: %v", err)
	}

	readme := string(content)

	tests := []struct {
		name    string
		pattern string
		wantMsg string
	}{
		{
			name:    "データベース名の記載がある",
			pattern: "todo_db",
			wantMsg: "README.md にデータベース名 todo_db の記載がありません",
		},
		{
			name:    "PostgreSQL のバージョンが記載されている",
			pattern: "PostgreSQL",
			wantMsg: "README.md に PostgreSQL の記載がありません",
		},
		{
			name:    "テーブル名 todos の記載がある",
			pattern: "todos",
			wantMsg: "README.md にテーブル名 todos の記載がありません",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if !strings.Contains(readme, tt.pattern) {
				t.Errorf("%s\n実際の内容:\n%s", tt.wantMsg, readme)
			}
		})
	}
}

// TestSQLFileIsNotEmpty はschema.sqlが空でないことを確認する
func TestSQLFileIsNotEmpty(t *testing.T) {
	schemaPath := "database/schema.sql"

	absPath, err := filepath.Abs(schemaPath)
	if err != nil {
		t.Fatalf("絶対パスの取得に失敗: %v", err)
	}

	content, err := os.ReadFile(absPath)
	if err != nil {
		t.Fatalf("schema.sql を読み込めません: %v (パス: %s)", err, absPath)
	}

	if len(strings.TrimSpace(string(content))) == 0 {
		t.Error("schema.sql が空です。SQL文を記述してください")
	}
}
