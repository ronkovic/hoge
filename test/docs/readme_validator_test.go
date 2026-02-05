package docs_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestREADMEContent は README.md の内容をテーブル駆動テストで検証する
func TestREADMEContent(t *testing.T) {
	// プロジェクトルートのREADME.mdを読み込む
	readmePath := filepath.Join("..", "..", "README.md")
	content, err := os.ReadFile(readmePath)
	if err != nil {
		t.Fatalf("README.md を読み込めませんでした: %v", err)
	}
	readme := string(content)

	tests := []struct {
		name        string
		description string
		validator   func(string) bool
	}{
		{
			name:        "プロジェクトタイトルが存在する",
			description: "README.mdの先頭にプロジェクトタイトル（# で始まる見出し）が存在すること",
			validator: func(content string) bool {
				lines := strings.Split(content, "\n")
				for i, line := range lines {
					if i > 10 { // 最初の10行以内にタイトルがあるはず
						break
					}
					if strings.HasPrefix(strings.TrimSpace(line), "# ") {
						return true
					}
				}
				return false
			},
		},
		{
			name:        "プロジェクト説明が存在する",
			description: "プロジェクトの概要説明が含まれていること",
			validator: func(content string) bool {
				// タイトルの後に説明文があることを確認
				lines := strings.Split(content, "\n")
				foundTitle := false
				for _, line := range lines {
					trimmed := strings.TrimSpace(line)
					if strings.HasPrefix(trimmed, "# ") {
						foundTitle = true
						continue
					}
					if foundTitle && len(trimmed) > 20 && !strings.HasPrefix(trimmed, "#") {
						return true
					}
				}
				return false
			},
		},
		{
			name:        "セットアップ手順が記載されている",
			description: "クイックスタート、インストール、セットアップのいずれかのセクションが存在すること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return strings.Contains(lower, "セットアップ") ||
					strings.Contains(lower, "setup") ||
					strings.Contains(lower, "インストール") ||
					strings.Contains(lower, "installation") ||
					strings.Contains(lower, "クイックスタート") ||
					strings.Contains(lower, "quick start") ||
					strings.Contains(lower, "getting started")
			},
		},
		{
			name:        "前提条件が記載されている",
			description: "必要な環境や依存関係（Node.js、PostgreSQLなど）が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "前提条件") ||
					strings.Contains(lower, "prerequisite") ||
					strings.Contains(lower, "requirements")) &&
					(strings.Contains(lower, "node.js") ||
						strings.Contains(lower, "nodejs")) &&
					strings.Contains(lower, "postgresql")
			},
		},
		{
			name:        "データベースセットアップ手順が記載されている",
			description: "PostgreSQLのセットアップ手順が具体的に記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return strings.Contains(lower, "database") &&
					(strings.Contains(lower, "create database") ||
						strings.Contains(lower, "データベース作成"))
			},
		},
		{
			name:        "バックエンドのセットアップ手順が記載されている",
			description: "バックエンドの起動手順（npm install、npm start など）が記載されていること",
			validator: func(content string) bool {
				return strings.Contains(content, "backend") &&
					strings.Contains(content, "npm install") &&
					(strings.Contains(content, "npm start") ||
						strings.Contains(content, "npm run dev"))
			},
		},
		{
			name:        "フロントエンドのセットアップ手順が記載されている",
			description: "フロントエンドの起動手順（npm install、npm run dev など）が記載されていること",
			validator: func(content string) bool {
				return strings.Contains(content, "frontend") &&
					strings.Contains(content, "npm install") &&
					(strings.Contains(content, "npm run dev") ||
						strings.Contains(content, "npm start"))
			},
		},
		{
			name:        "API仕様が記載されている",
			description: "REST APIのエンドポイント一覧（GET、POST、PUT、DELETE）が記載されていること",
			validator: func(content string) bool {
				upper := strings.ToUpper(content)
				return strings.Contains(content, "API") &&
					strings.Contains(upper, "GET") &&
					strings.Contains(upper, "POST") &&
					strings.Contains(upper, "PUT") &&
					strings.Contains(upper, "DELETE")
			},
		},
		{
			name:        "データ型/スキーマが記載されている",
			description: "Todoデータ型の定義（id、title、completedなど）が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "interface todo") ||
					strings.Contains(lower, "データ型")) &&
					strings.Contains(content, "id") &&
					strings.Contains(content, "title") &&
					strings.Contains(content, "completed")
			},
		},
		{
			name:        "機能一覧が記載されている",
			description: "実装済みの機能一覧（チェックマーク付き）が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "機能") ||
					strings.Contains(lower, "features")) &&
					strings.Count(content, "✅") >= 3
			},
		},
		{
			name:        "テスト実行方法が記載されている",
			description: "テストの実行コマンド（npm test、go test など）が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "テスト") ||
					strings.Contains(lower, "test")) &&
					(strings.Contains(content, "npm test") ||
						strings.Contains(content, "go test") ||
						strings.Contains(content, "npm run test"))
			},
		},
		{
			name:        "技術スタックが記載されている",
			description: "使用している主要な技術（React、Express.js、PostgreSQLなど）が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "技術スタック") ||
					strings.Contains(lower, "tech stack") ||
					strings.Contains(lower, "technology")) &&
					strings.Contains(lower, "react") &&
					strings.Contains(lower, "express") &&
					strings.Contains(lower, "postgresql")
			},
		},
		{
			name:        "トラブルシューティングが記載されている",
			description: "よくある問題とその解決方法が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return strings.Contains(lower, "トラブルシューティング") ||
					strings.Contains(lower, "troubleshooting") ||
					strings.Contains(lower, "common issues")
			},
		},
		{
			name:        "ポート番号が記載されている",
			description: "バックエンド（3001）とフロントエンド（5173）のポート番号が記載されていること",
			validator: func(content string) bool {
				return strings.Contains(content, "3001") &&
					strings.Contains(content, "5173")
			},
		},
		{
			name:        "関連ドキュメントへのリンクが記載されている",
			description: "backend/README.md、frontend/README.md、database/README.mdへのリンクが存在すること",
			validator: func(content string) bool {
				return strings.Contains(content, "backend/README.md") &&
					strings.Contains(content, "frontend/README.md") &&
					strings.Contains(content, "database/README.md")
			},
		},
		{
			name:        "プロジェクト構成が記載されている",
			description: "ディレクトリ構造やコンポーネントの説明が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "プロジェクト構成") ||
					strings.Contains(lower, "project structure")) &&
					strings.Contains(content, "backend") &&
					strings.Contains(content, "frontend") &&
					strings.Contains(content, "database")
			},
		},
		{
			name:        "開発ワークフローが記載されている",
			description: "TDD（Red-Green-Refactor）などの開発プロセスが記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "tdd") ||
					strings.Contains(lower, "test-driven development")) &&
					(strings.Contains(lower, "red") ||
						strings.Contains(lower, "green") ||
						strings.Contains(lower, "refactor"))
			},
		},
		{
			name:        "コードブロックが適切にフォーマットされている",
			description: "bashやtypescriptなどの言語指定付きコードブロックが使用されていること",
			validator: func(content string) bool {
				return strings.Contains(content, "```bash") &&
					(strings.Contains(content, "```typescript") ||
						strings.Contains(content, "```ts"))
			},
		},
		{
			name:        "Docker Composeによる一括起動手順が記載されている",
			description: "Docker Composeを使用した環境構築手順が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return strings.Contains(lower, "docker") &&
					(strings.Contains(content, "docker-compose up") ||
						strings.Contains(content, "docker compose up"))
			},
		},
		{
			name:        "環境変数の設定例が記載されている",
			description: ".envファイルの具体的な設定例が記載されていること",
			validator: func(content string) bool {
				return strings.Contains(content, ".env") &&
					(strings.Contains(content, "DB_HOST") ||
						strings.Contains(content, "DATABASE_URL"))
			},
		},
		{
			name:        "プロジェクトのライセンスが明記されている",
			description: "ライセンスセクションが存在すること（MIT、Apache 2.0など）",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return strings.Contains(lower, "ライセンス") ||
					strings.Contains(lower, "license")
			},
		},
		{
			name:        "貢献ガイドラインが記載されている",
			description: "プロジェクトへの貢献方法やプルリクエストのルールが記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "貢献") ||
					strings.Contains(lower, "contribution") ||
					strings.Contains(lower, "contributing")) &&
					(strings.Contains(lower, "プルリクエスト") ||
						strings.Contains(lower, "pull request"))
			},
		},
		{
			name:        "バージョン情報が記載されている",
			description: "主要な依存関係のバージョン番号が記載されていること",
			validator: func(content string) bool {
				// バージョン番号のパターン（例: 19.2.0, v18, 16.x）
				hasVersionPattern := strings.Contains(content, "React 19") ||
					strings.Contains(content, "Node.js (v18") ||
					strings.Contains(content, "PostgreSQL 16")
				return hasVersionPattern
			},
		},
		{
			name:        "アーキテクチャ図が記載されている",
			description: "システムアーキテクチャの説明図や構成図が記載されていること",
			validator: func(content string) bool {
				// アーキテクチャ図は通常、ASCII artやディレクトリツリー形式で記載される
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "architecture") ||
					strings.Contains(lower, "アーキテクチャ")) &&
					(strings.Contains(content, "```") ||
						strings.Contains(content, "├──") ||
						strings.Contains(content, "└──"))
			},
		},
		{
			name:        "CI/CD設定が記載されている",
			description: "GitHub ActionsやCI/CDパイプラインの説明が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return strings.Contains(lower, "ci/cd") ||
					strings.Contains(lower, "github actions") ||
					strings.Contains(lower, "continuous integration")
			},
		},
		{
			name:        "デプロイ手順が記載されている",
			description: "本番環境へのデプロイ方法が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return strings.Contains(lower, "deploy") ||
					strings.Contains(lower, "deployment") ||
					strings.Contains(lower, "デプロイ")
			},
		},
		{
			name:        "セキュリティベストプラクティスが記載されている",
			description: "環境変数の扱いやセキュリティに関する注意事項が記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return (strings.Contains(lower, "security") ||
					strings.Contains(lower, "セキュリティ")) &&
					(strings.Contains(content, ".env") ||
						strings.Contains(lower, "credential") ||
						strings.Contains(lower, "認証情報"))
			},
		},
		{
			name:        "パフォーマンス最適化に関する記載がある",
			description: "パフォーマンスチューニングや最適化のヒントが記載されていること",
			validator: func(content string) bool {
				lower := strings.ToLower(content)
				return strings.Contains(lower, "performance") ||
					strings.Contains(lower, "optimization") ||
					strings.Contains(lower, "パフォーマンス") ||
					strings.Contains(lower, "最適化")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if !tt.validator(readme) {
				t.Errorf("検証失敗: %s\n説明: %s", tt.name, tt.description)
			}
		})
	}
}

// TestSubREADMEsExist はサブディレクトリのREADME.mdが存在することを検証する
func TestSubREADMEsExist(t *testing.T) {
	tests := []struct {
		name     string
		path     string
		required bool
	}{
		{
			name:     "バックエンドREADMEが存在する",
			path:     "../../backend/README.md",
			required: true,
		},
		{
			name:     "フロントエンドREADMEが存在する",
			path:     "../../frontend/README.md",
			required: true,
		},
		{
			name:     "データベースREADMEが存在する",
			path:     "../../database/README.md",
			required: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if _, err := os.Stat(tt.path); os.IsNotExist(err) {
				if tt.required {
					t.Errorf("必須のREADME.mdが存在しません: %s", tt.path)
				}
			}
		})
	}
}

// TestREADMELinks はREADME.md内のリンクが有効かを検証する
func TestREADMELinks(t *testing.T) {
	readmePath := filepath.Join("..", "..", "README.md")
	content, err := os.ReadFile(readmePath)
	if err != nil {
		t.Fatalf("README.md を読み込めませんでした: %v", err)
	}
	readme := string(content)

	// Markdown リンクを抽出する簡易的なパターン [text](path)
	links := []struct {
		name string
		path string
	}{
		{"バックエンドREADMEリンク", "./backend/README.md"},
		{"フロントエンドREADMEリンク", "./frontend/README.md"},
		{"データベースREADMEリンク", "./database/README.md"},
	}

	for _, link := range links {
		t.Run(link.name, func(t *testing.T) {
			if !strings.Contains(readme, link.path) {
				t.Errorf("READMEに必要なリンクが含まれていません: %s", link.path)
			}

			// リンク先のファイルが実際に存在するか確認
			fullPath := filepath.Join("..", "..", link.path)
			if _, err := os.Stat(fullPath); os.IsNotExist(err) {
				t.Errorf("リンク先のファイルが存在しません: %s", link.path)
			}
		})
	}
}
