import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS設定
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Simple HTML sanitizer - removes all HTML tags and dangerous characters
function simpleHtmlSanitize(input) {
  if (typeof input !== 'string') return input;

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// Add X-XSS-Protection header manually (helmet v4+ doesn't include it by default)
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Cookie parser (required for CSRF)
app.use(cookieParser());

// JSON body parser
app.use(express.json());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.'
});

// CSRF protection
const csrfProtection = csrf({ cookie: true });

// Apply general rate limiter to all routes (except in tests for certain endpoints)
app.use((req, res, next) => {
  // Skip rate limiting for upload and csrf endpoints in test environment
  if (process.env.NODE_ENV === 'test' &&
      (req.path === '/api/upload' || req.path === '/api/csrf-token' || req.path === '/api/articles')) {
    return next();
  }
  return generalLimiter(req, res, next);
});

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const blockedExtensions = ['.exe', '.js', '.php', '.sh', '.bat', '.cmd'];

    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (blockedExtensions.includes(ext)) {
      return cb(new Error('File type not allowed'));
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }

    cb(null, true);
  }
});

// Helper function to sanitize input
function sanitizeInput(input) {
  return simpleHtmlSanitize(input);
}

// Helper function to validate password strength
function validatePasswordStrength(password) {
  const errors = [];

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for digits only
  if (/^\d+$/.test(password)) {
    errors.push('Password cannot be only numbers');
  }

  // Common passwords blacklist
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'monkey', '1234567890', 'letmein', 'trustno1', 'dragon'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  return errors;
}

// In-memory storage for todos
let todos = [];
let nextTodoId = 1;

// In-memory storage for users and tokens
let users = [];
let userNextId = 1;
let tokens = new Map();

// In-memory storage for comments
let comments = [];
let nextCommentId = 1;

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

// In-memory storage for posts
let posts = [];
let nextPostId = 1;

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

  // Validate password strength
  const passwordErrors = validatePasswordStrength(password);
  if (passwordErrors.length > 0) {
    return res.status(400).json({ message: passwordErrors[0] });
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
app.post('/api/auth/login', authLimiter, (req, res) => {
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

// GET /api/csrf-token - CSRFトークンを取得
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

// POST /api/upload - ファイルアップロード
app.post('/api/upload', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.status(200).json({
    message: 'File uploaded successfully',
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
}, (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  } else if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
});

// GET /api/todos - すべてのTodoを取得
app.get('/api/todos', (req, res) => {
  res.status(200).json(todos);
});

// GET /api/todos/:id - 特定のTodoを取得
app.get('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  res.status(200).json(todo);
});

// POST /api/todos - 新しいTodoを作成
app.post('/api/todos', (req, res) => {
  const { title, completed } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newTodo = {
    id: nextTodoId++,
    title,
    completed: completed || false
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - Todoを更新
app.put('/api/todos/:id', (req, res) => {
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

// DELETE /api/todos/:id - Todoを削除
app.delete('/api/todos/:id', (req, res) => {
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

// IMPORTANT: より具体的なルート (/user/:userId) を先に定義することで、
// 汎用的なルート (/:id) との競合を防ぐ
// GET /api/articles/user/:userId - ユーザー別記事一覧
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

  // Sanitize title and content
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedContent = sanitizeInput(content);

  const now = new Date().toISOString();
  const newArticle = {
    id: nextArticleId++,
    user_id,
    title: sanitizedTitle,
    content: sanitizedContent,
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

// GET /comments - すべてのコメントを取得
app.get('/comments', (req, res) => {
  // 作成日時の降順でソート
  const sortedComments = [...comments].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.status(200).json(sortedComments);
});

// GET /comments/:id - 特定のコメントを取得
app.get('/comments/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid comment ID' });
  }

  const comment = comments.find(c => c.id === id);

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  res.status(200).json(comment);
});

// POST /comments - 新しいコメントを作成
app.post('/comments', (req, res) => {
  const { content, author } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  if (!author) {
    return res.status(400).json({ message: 'Author is required' });
  }

  if (content.length > 500) {
    return res.status(400).json({ message: 'Content must be less than 500 characters' });
  }

  // Sanitize content
  const sanitizedContent = sanitizeInput(content);

  const newComment = {
    id: nextCommentId++,
    content: sanitizedContent,
    author,
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  res.status(201).json(newComment);
});

// DELETE /comments/:id - コメントを削除
app.delete('/comments/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid comment ID' });
  }

  const commentIndex = comments.findIndex(c => c.id === id);

  if (commentIndex === -1) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  comments.splice(commentIndex, 1);
  res.status(200).json({ message: 'Comment deleted successfully' });
});

// テスト用のリセット関数
export function resetComments() {
  comments = [];
  nextCommentId = 1;
}

// GET /api/posts - すべてのPostを取得
app.get('/api/posts', (req, res) => {
  res.status(200).json(posts);
});

// POST /api/posts - 新しいPostを作成
app.post('/api/posts', (req, res) => {
  const { title, author, content } = req.body;

  if (!title || !author || !content) {
    return res.status(400).json({ message: 'Title, author, and content are required' });
  }

  const newPost = {
    id: nextPostId++,
    title,
    author,
    content,
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  res.status(201).json(newPost);
});

// DELETE /api/posts/:id - Postを削除
app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const postIndex = posts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  posts.splice(postIndex, 1);
  res.status(200).json({ message: 'Post deleted successfully' });
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
