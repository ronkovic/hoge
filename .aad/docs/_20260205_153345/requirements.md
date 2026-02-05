# ブログシステムの構築

## 概要

認証機能付きのブログシステムを構築する。ユーザー管理、記事投稿、コメント機能を含む。

## プロジェクト構成

既存のプロジェクト構造を確認し、以下の構成で実装する：

```
blog-system/
├── backend/          # バックエンドAPI
├── frontend/         # フロントエンドアプリ
├── database/         # DB関連
├── shared/           # 共通型定義
└── docker/           # Docker設定
```

## 要件

### 1. データベース設計

PostgreSQL 16を使用し、以下のテーブルを作成：

#### users テーブル
- id (uuid primary key)
- username (varchar(50) unique not null)
- email (varchar(255) unique not null)
- password_hash (varchar(255) not null)
- created_at (timestamp default now())
- updated_at (timestamp default now())

#### posts テーブル
- id (uuid primary key)
- user_id (uuid references users(id))
- title (varchar(200) not null)
- content (text not null)
- slug (varchar(200) unique not null)
- published (boolean default false)
- created_at (timestamp default now())
- updated_at (timestamp default now())

#### comments テーブル
- id (uuid primary key)
- post_id (uuid references posts(id))
- user_id (uuid references users(id))
- content (text not null)
- created_at (timestamp default now())

#### マイグレーション
- `database/migrations/` 配下にマイグレーションファイルを配置
- マイグレーション実行スクリプトを作成

### 2. バックエンドAPI（Node.js + Express + TypeScript）

#### 環境設定
- TypeScriptで実装
- ポート: 3001
- JWT認証を実装
- bcryptでパスワードハッシュ化
- 環境変数は`.env`で管理

#### 認証エンドポイント
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン（JWTトークン発行）
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - ログインユーザー情報取得（要認証）

#### 記事エンドポイント
- `GET /api/posts` - 記事一覧取得（公開記事のみ）
- `GET /api/posts/:slug` - 記事詳細取得
- `POST /api/posts` - 記事作成（要認証）
- `PUT /api/posts/:id` - 記事更新（要認証・本人のみ）
- `DELETE /api/posts/:id` - 記事削除（要認証・本人のみ）
- `GET /api/users/:id/posts` - ユーザーの記事一覧

#### コメントエンドポイント
- `GET /api/posts/:id/comments` - 記事のコメント一覧
- `POST /api/posts/:id/comments` - コメント投稿（要認証）
- `DELETE /api/comments/:id` - コメント削除（要認証・本人のみ）

#### バリデーション
- express-validatorで入力バリデーション
- エラーハンドリングミドルウェアを実装

#### テスト
- Jestでユニットテスト
- 主要なエンドポイントの統合テストを実装

### 3. フロントエンド（React + TypeScript + Vite）

#### 環境設定
- Viteでプロジェクト構築
- ポート: 5173
- TailwindCSSでスタイリング
- React RouterでSPA実装
- Zustandで状態管理

#### ページ構成
- `/` - トップページ（記事一覧）
- `/posts/:slug` - 記事詳細ページ
- `/login` - ログインページ
- `/register` - ユーザー登録ページ
- `/dashboard` - ダッシュボード（要認証）
- `/dashboard/posts/new` - 記事作成（要認証）
- `/dashboard/posts/:id/edit` - 記事編集（要認証）
- `/users/:id` - ユーザープロフィール

#### コンポーネント設計
- `components/common/` - 共通コンポーネント（Header, Footer, Button等）
- `components/posts/` - 記事関連（PostCard, PostList, PostForm等）
- `components/comments/` - コメント関連（CommentList, CommentForm等）
- `components/auth/` - 認証関連（LoginForm, RegisterForm等）

#### 認証フロー
- JWT TokenをlocalStorageに保存
- 認証が必要なページはProtectedRouteで保護
- トークン有効期限切れ時は自動ログアウト

#### API連携
- axiosでバックエンドAPIと通信
- API呼び出しは`services/api.ts`に集約
- エラーハンドリングを適切に実装

### 4. 共通型定義（TypeScript）

`shared/types/` 配下に以下の型定義を配置：
- `User.ts` - ユーザー型
- `Post.ts` - 記事型
- `Comment.ts` - コメント型
- `ApiResponse.ts` - APIレスポンス型

フロントエンドとバックエンドで共通の型を使用する。

### 5. Docker環境

#### docker-compose.yml
以下のサービスを定義：
- `postgres` - PostgreSQLデータベース
- `backend` - バックエンドAPI
- `frontend` - フロントエンドアプリ

#### Dockerfile
- バックエンド用のDockerfile
- フロントエンド用のDockerfile（マルチステージビルド）

#### 開発環境
- `docker-compose up`で全サービス起動
- ホットリロード対応

## 成果物

### ディレクトリ構造
```
blog-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.ts
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── schema.sql
│   └── README.md
├── shared/
│   └── types/
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── docker-compose.yml
└── README.md
```

### ドキュメント
- 各ディレクトリのREADME.md
- プロジェクトルートのREADME.md（セットアップ手順を記載）
- APIドキュメント（エンドポイント一覧）

## 技術スタック

### バックエンド
- Node.js 20
- Express.js 4
- TypeScript 5
- PostgreSQL 16
- JWT (jsonwebtoken)
- bcrypt
- Jest

### フロントエンド
- React 18
- TypeScript 5
- Vite 5
- React Router 6
- Zustand
- TailwindCSS 3
- axios

### 開発環境
- Docker & Docker Compose
- ESLint & Prettier

## 実装の優先順位

1. データベーススキーマとマイグレーション
2. バックエンドAPIの基本構造と認証機能
3. 記事とコメントのAPI実装
4. フロントエンドの基本構造とルーティング
5. 認証フローの実装
6. 記事一覧・詳細ページの実装
7. 記事作成・編集機能の実装
8. コメント機能の実装
9. Docker環境の構築
10. テストの実装

## 注意事項

- 既存のプロジェクト構造を確認し、それに従うこと
- セキュリティを考慮した実装（SQLインジェクション、XSS対策等）
- 適切なエラーハンドリングを実装
- コードの可読性と保守性を重視
- コミットメッセージは明確に記述
