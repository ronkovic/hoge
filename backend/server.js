import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// In-memory storage for todos
let todos = [];
let nextId = 1;

// In-memory storage for users and tokens
let users = [];
let userNextId = 1;
let tokens = new Map();

// In-memory storage for articles
let articles = [
  {
    id: 1,
    user_id: 1,
    title: 'サンプル記事',
    content: 'これはサンプル記事の本文です。',
    published: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
let nextArticleId = 2;

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  const userId = tokens.get(token);
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.userId = userId;
  next();
};

// POST /api/auth/register - ユーザー登録
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const newUser = {
    id: userNextId++,
    username,
    email,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// POST /api/auth/login - ログイン
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = `token_${Date.now()}_${Math.random()}`;
  tokens.set(token, user.id);

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json({ token, user: userWithoutPassword });
});

// GET /api/auth/me - ユーザー情報取得
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

// POST /api/auth/logout - ログアウト
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.substring(7);
  tokens.delete(token);

  res.status(200).json({ message: 'Logged out successfully' });
});

// GET /todos - すべてのTodoを取得
app.get('/todos', (req, res) => {
  res.status(200).json(todos);
});

// GET /todos/:id - 特定のTodoを取得
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  res.status(200).json(todo);
});

// POST /todos - 新しいTodoを作成
app.post('/todos', (req, res) => {
  const { title, completed } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newTodo = {
    id: nextId++,
    title,
    completed: completed || false
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /todos/:id - Todoを更新
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed } = req.body;
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todos[todoIndex] = {
    id,
    title: title !== undefined ? title : todos[todoIndex].title,
    completed: completed !== undefined ? completed : todos[todoIndex].completed
  };

  res.status(200).json(todos[todoIndex]);
});

// DELETE /todos/:id - Todoを削除
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todos.splice(todoIndex, 1);
  res.status(200).json({ message: 'Todo deleted successfully' });
});

// GET /api/articles - すべての記事を取得
app.get('/api/articles', (req, res) => {
  res.status(200).json(articles);
});

// GET /api/articles/user/:userId - ユーザー別記事一覧 (より具体的なルートを先に定義)
app.get('/api/articles/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userArticles = articles.filter(a => a.user_id === userId);
  res.status(200).json(userArticles);
});

// GET /api/articles/:id - 特定の記事を取得
app.get('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const article = articles.find(a => a.id === id);

  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  res.status(200).json(article);
});

// POST /api/articles - 新しい記事を作成
app.post('/api/articles', (req, res) => {
  const { user_id, title, content, published } = req.body;

  // バリデーション
  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (title.length > 200) {
    return res.status(400).json({ message: 'Title must be 200 characters or less' });
  }

  if (content === undefined || content === null || content === '') {
    return res.status(400).json({ message: 'Content is required' });
  }

  if (published !== undefined && typeof published !== 'boolean') {
    return res.status(400).json({ message: 'published must be a boolean' });
  }

  const now = new Date().toISOString();
  const newArticle = {
    id: nextArticleId++,
    user_id,
    title,
    content,
    published: published === undefined ? false : published,
    created_at: now,
    updated_at: now
  };

  articles.push(newArticle);
  res.status(201).json(newArticle);
});

// PUT /api/articles/:id - 記事を更新
app.put('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content, published } = req.body;
  const articleIndex = articles.findIndex(a => a.id === id);

  if (articleIndex === -1) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const now = new Date().toISOString();
  articles[articleIndex] = {
    ...articles[articleIndex],
    title: title !== undefined ? title : articles[articleIndex].title,
    content: content !== undefined ? content : articles[articleIndex].content,
    published: published !== undefined ? published : articles[articleIndex].published,
    updated_at: now
  };

  res.status(200).json(articles[articleIndex]);
});

// DELETE /api/articles/:id - 記事を削除
app.delete('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const articleIndex = articles.findIndex(a => a.id === id);

  if (articleIndex === -1) {
    return res.status(404).json({ message: 'Article not found' });
  }

  articles.splice(articleIndex, 1);
  res.status(200).json({ message: 'Article deleted successfully' });
});

// サーバー起動（直接実行時のみ）
// import.meta.urlを使用してモジュールが直接実行されたかを判定
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { app };
