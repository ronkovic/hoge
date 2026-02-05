#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

if [ -z "$FILE_PATH" ]; then exit 0; fi

EXT="${FILE_PATH##*.}"

case "$EXT" in
  go)
    # Go: go vet で静的解析
    command -v go &>/dev/null && go vet ./... 2>&1 | head -5
    ;;
  ts|tsx)
    # TypeScript: tsc で型チェック
    [ -f "tsconfig.json" ] && npx tsc --noEmit 2>&1 | head -5
    ;;
  py)
    # Python: ruff または flake8 で静的解析
    if command -v ruff &>/dev/null; then
      ruff check "$FILE_PATH" 2>&1 | head -5
    elif command -v flake8 &>/dev/null; then
      flake8 "$FILE_PATH" --max-line-length=88 2>&1 | head -5
    elif command -v pylint &>/dev/null; then
      pylint "$FILE_PATH" --max-line-length=88 2>&1 | head -5
    fi
    ;;
  rs)
    # Rust: cargo check で型チェック
    command -v cargo &>/dev/null && cargo check 2>&1 | head -5
    ;;
  tf)
    # Terraform: terraform validate で構文チェック
    if command -v terraform &>/dev/null; then
      terraform init -backend=false >/dev/null 2>&1
      terraform validate 2>&1 | head -5
    fi
    ;;
esac

exit 0
