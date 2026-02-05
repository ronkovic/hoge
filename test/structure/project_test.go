package structure

import (
	"os"
	"path/filepath"
	"testing"
)

// getProjectRoot returns the absolute path to the project root directory
func getProjectRoot(t *testing.T) string {
	t.Helper()
	// test/structure/ から ../../ でルートへ移動
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatalf("プロジェクトルートの取得に失敗: %v", err)
	}
	return root
}

// TestProjectRootStructure tests that the root directory has the expected structure
func TestProjectRootStructure(t *testing.T) {
	tests := []struct {
		name        string
		path        string
		shouldExist bool
		isDir       bool
	}{
		// ルートディレクトリの基本構造
		{"backend ディレクトリが存在する", "backend", true, true},
		{"frontend ディレクトリが存在する", "frontend", true, true},
		{"database ディレクトリが存在する", "database", true, true},
		{"shared ディレクトリが存在する", "shared", true, true},
		{"docker ディレクトリが存在する", "docker", true, true},
		{"README.md が存在する", "README.md", true, false},
	}

	projectRoot := getProjectRoot(t)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			absPath := filepath.Join(projectRoot, tt.path)

			info, err := os.Stat(absPath)
			if tt.shouldExist {
				if os.IsNotExist(err) {
					t.Errorf("パスが存在しません: %s (エラー: %v)", tt.path, err)
					return
				}
				if err != nil {
					t.Fatalf("ファイル情報の取得に失敗: %v", err)
				}

				if tt.isDir && !info.IsDir() {
					t.Errorf("%s はディレクトリであるべきですが、ファイルです", tt.path)
				}
				if !tt.isDir && info.IsDir() {
					t.Errorf("%s はファイルであるべきですが、ディレクトリです", tt.path)
				}
			} else {
				if !os.IsNotExist(err) {
					t.Errorf("パスが存在すべきではありません: %s", tt.path)
				}
			}
		})
	}
}

// TestBackendStructure tests the backend directory structure
func TestBackendStructure(t *testing.T) {
	tests := []struct {
		name        string
		path        string
		shouldExist bool
		isDir       bool
	}{
		{"backend/README.md が存在する", "backend/README.md", true, false},
		{"backend/package.json が存在する", "backend/package.json", true, false},
		{"backend/server.js が存在する", "backend/server.js", true, false},
		{"backend/.gitignore が存在する", "backend/.gitignore", true, false},
	}

	projectRoot := getProjectRoot(t)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			absPath := filepath.Join(projectRoot, tt.path)

			info, err := os.Stat(absPath)
			if tt.shouldExist {
				if os.IsNotExist(err) {
					t.Errorf("パスが存在しません: %s (エラー: %v)", tt.path, err)
					return
				}
				if err != nil {
					t.Fatalf("ファイル情報の取得に失敗: %v", err)
				}

				if tt.isDir && !info.IsDir() {
					t.Errorf("%s はディレクトリであるべきですが、ファイルです", tt.path)
				}
				if !tt.isDir && info.IsDir() {
					t.Errorf("%s はファイルであるべきですが、ディレクトリです", tt.path)
				}
			}
		})
	}
}

// TestFrontendStructure tests the frontend directory structure
func TestFrontendStructure(t *testing.T) {
	tests := []struct {
		name        string
		path        string
		shouldExist bool
		isDir       bool
	}{
		{"frontend/package.json が存在する", "frontend/package.json", true, false},
		{"frontend/index.html が存在する", "frontend/index.html", true, false},
		{"frontend/vite.config.js が存在する", "frontend/vite.config.js", true, false},
		{"frontend/src ディレクトリが存在する", "frontend/src", true, true},
		{"frontend/.gitignore が存在する", "frontend/.gitignore", true, false},
	}

	projectRoot := getProjectRoot(t)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			absPath := filepath.Join(projectRoot, tt.path)

			info, err := os.Stat(absPath)
			if tt.shouldExist {
				if os.IsNotExist(err) {
					t.Errorf("パスが存在しません: %s (エラー: %v)", tt.path, err)
					return
				}
				if err != nil {
					t.Fatalf("ファイル情報の取得に失敗: %v", err)
				}

				if tt.isDir && !info.IsDir() {
					t.Errorf("%s はディレクトリであるべきですが、ファイルです", tt.path)
				}
				if !tt.isDir && info.IsDir() {
					t.Errorf("%s はファイルであるべきですが、ディレクトリです", tt.path)
				}
			}
		})
	}
}

// TestDatabaseStructure tests the database directory structure
func TestDatabaseStructure(t *testing.T) {
	tests := []struct {
		name        string
		path        string
		shouldExist bool
		isDir       bool
	}{
		{"database/schema.sql が存在する", "database/schema.sql", true, false},
		{"database/README.md が存在する", "database/README.md", true, false},
	}

	projectRoot := getProjectRoot(t)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			absPath := filepath.Join(projectRoot, tt.path)

			info, err := os.Stat(absPath)
			if tt.shouldExist {
				if os.IsNotExist(err) {
					t.Errorf("パスが存在しません: %s (エラー: %v)", tt.path, err)
					return
				}
				if err != nil {
					t.Fatalf("ファイル情報の取得に失敗: %v", err)
				}

				if tt.isDir && !info.IsDir() {
					t.Errorf("%s はディレクトリであるべきですが、ファイルです", tt.path)
				}
				if !tt.isDir && info.IsDir() {
					t.Errorf("%s はファイルであるべきですが、ディレクトリです", tt.path)
				}
			}
		})
	}
}

// TestSharedStructure tests the shared directory structure
func TestSharedStructure(t *testing.T) {
	tests := []struct {
		name        string
		path        string
		shouldExist bool
		isDir       bool
	}{
		{"shared ディレクトリが存在する", "shared", true, true},
		{"shared/README.md が存在する", "shared/README.md", true, false},
	}

	projectRoot := getProjectRoot(t)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			absPath := filepath.Join(projectRoot, tt.path)

			info, err := os.Stat(absPath)
			if tt.shouldExist {
				if os.IsNotExist(err) {
					t.Errorf("パスが存在しません: %s (エラー: %v)", tt.path, err)
					return
				}
				if err != nil {
					t.Fatalf("ファイル情報の取得に失敗: %v", err)
				}

				if tt.isDir && !info.IsDir() {
					t.Errorf("%s はディレクトリであるべきですが、ファイルです", tt.path)
				}
				if !tt.isDir && info.IsDir() {
					t.Errorf("%s はファイルであるべきですが、ディレクトリです", tt.path)
				}
			}
		})
	}
}

// TestDockerStructure tests the docker directory structure
func TestDockerStructure(t *testing.T) {
	tests := []struct {
		name        string
		path        string
		shouldExist bool
		isDir       bool
	}{
		{"docker ディレクトリが存在する", "docker", true, true},
		{"docker/docker-compose.yml が存在する", "docker/docker-compose.yml", true, false},
		{"docker/Dockerfile が存在する", "docker/Dockerfile", true, false},
		{"docker/README.md が存在する", "docker/README.md", true, false},
	}

	projectRoot := getProjectRoot(t)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			absPath := filepath.Join(projectRoot, tt.path)

			info, err := os.Stat(absPath)
			if tt.shouldExist {
				if os.IsNotExist(err) {
					t.Errorf("パスが存在しません: %s (エラー: %v)", tt.path, err)
					return
				}
				if err != nil {
					t.Fatalf("ファイル情報の取得に失敗: %v", err)
				}

				if tt.isDir && !info.IsDir() {
					t.Errorf("%s はディレクトリであるべきですが、ファイルです", tt.path)
				}
				if !tt.isDir && info.IsDir() {
					t.Errorf("%s はファイルであるべきですが、ディレクトリです", tt.path)
				}
			}
		})
	}
}

// TestRootREADME tests that the root README.md exists and has content
func TestRootREADME(t *testing.T) {
	projectRoot := getProjectRoot(t)
	absPath := filepath.Join(projectRoot, "README.md")

	info, err := os.Stat(absPath)
	if os.IsNotExist(err) {
		t.Errorf("README.md が存在しません: %v", err)
		return
	}
	if err != nil {
		t.Fatalf("ファイル情報の取得に失敗: %v", err)
	}

	if info.IsDir() {
		t.Error("README.md はファイルであるべきですが、ディレクトリです")
		return
	}

	if info.Size() == 0 {
		t.Error("README.md が空です")
	}
}
