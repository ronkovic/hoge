package project_test

import (
	"os"
	"path/filepath"
	"testing"
)

// TestProjectStructure はプロジェクトの基本構造を検証する
func TestProjectStructure(t *testing.T) {
	// プロジェクトルートディレクトリを取得
	projectRoot, err := filepath.Abs("../..")
	if err != nil {
		t.Fatalf("プロジェクトルートの取得に失敗: %v", err)
	}

	// テーブル駆動テスト: 必要なディレクトリの存在確認
	tests := []struct {
		name string
		path string
	}{
		{
			name: "backend ディレクトリが存在すること",
			path: "backend",
		},
		{
			name: "frontend ディレクトリが存在すること",
			path: "frontend",
		},
		{
			name: "database ディレクトリが存在すること",
			path: "database",
		},
		{
			name: "shared ディレクトリが存在すること",
			path: "shared",
		},
		{
			name: "docker ディレクトリが存在すること",
			path: "docker",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dirPath := filepath.Join(projectRoot, tt.path)
			info, err := os.Stat(dirPath)

			if err != nil {
				if os.IsNotExist(err) {
					t.Errorf("ディレクトリが存在しません: %s", tt.path)
				} else {
					t.Errorf("ディレクトリの確認中にエラー: %v", err)
				}
				return
			}

			if !info.IsDir() {
				t.Errorf("%s はディレクトリではありません", tt.path)
			}
		})
	}
}

// TestRootReadme はルートディレクトリのREADME.mdの存在を検証する
func TestRootReadme(t *testing.T) {
	projectRoot, err := filepath.Abs("../..")
	if err != nil {
		t.Fatalf("プロジェクトルートの取得に失敗: %v", err)
	}

	readmePath := filepath.Join(projectRoot, "README.md")
	info, err := os.Stat(readmePath)

	if err != nil {
		if os.IsNotExist(err) {
			t.Error("README.md が存在しません")
		} else {
			t.Errorf("README.md の確認中にエラー: %v", err)
		}
		return
	}

	if info.IsDir() {
		t.Error("README.md がディレクトリになっています")
	}

	// ファイルサイズが0でないことを確認
	if info.Size() == 0 {
		t.Error("README.md が空ファイルです")
	}
}
