# Todo API Backend

Node.js + Express.js で構築された Todo API サーバー。

## セットアップ

1. 依存パッケージのインストール:
```bash
npm install
```

2. 環境変数の設定:
`env.example` を `.env` にコピーして、データベース接続情報を設定してください。

3. サーバーの起動:
```bash
npm start
```

開発モード（自動再起動）:
```bash
npm run dev
```

## API エンドポイント

- `GET /todos` - 全てのTodoを取得
- `POST /todos` - 新しいTodoを作成
- `PUT /todos/:id` - Todoを更新
- `DELETE /todos/:id` - Todoを削除

## 使用技術

- Node.js
- Express.js
- PostgreSQL (pg)
- dotenv

## ポート

デフォルト: 3001
