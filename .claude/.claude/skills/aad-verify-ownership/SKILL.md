---
name: verify-ownership
description: 編集前にファイルの責任範囲を確認し、誤編集を防止
argument-hint: [file-path]
allowed-tools: Read, Glob, Grep
---

# Verify Ownership

## 手順

1. ファイルパスから責任範囲を判定
2. 責任範囲外なら警告を表示
3. ユーザーに確認を求める

## 責任マッピング

| パターン | 責任者 |
|---------|--------|
| `.claude/*` | システム管理 |
| `*_test.go`, `*.spec.ts` | tester |
| `internal/*`, `cmd/*` | implementer |
| `docs/*`, `README.md` | documentor |

## 実装

```bash
# 引数からファイルパスを取得
FILE_PATH="$1"

# パターンマッチングで責任範囲を判定
case "$FILE_PATH" in
  .claude/*)
    echo "⚠️  警告: システム管理ファイル (.claude/*) です"
    echo "責任者: システム管理"
    ;;
  *_test.go|*.spec.ts)
    echo "✅ テストファイルです"
    echo "責任者: tester"
    ;;
  internal/*|cmd/*)
    echo "✅ 実装ファイルです"
    echo "責任者: implementer"
    ;;
  docs/*|README.md)
    echo "✅ ドキュメントファイルです"
    echo "責任者: documentor"
    ;;
  *)
    echo "❓ 責任範囲が不明なファイルです"
    echo "編集前にユーザーに確認してください"
    ;;
esac
```

## 使用例

```bash
/verify-ownership internal/handler/user.go
# → ✅ 実装ファイルです
# → 責任者: implementer

/verify-ownership .claude/settings.json
# → ⚠️  警告: システム管理ファイル (.claude/*) です
# → 責任者: システム管理
```
