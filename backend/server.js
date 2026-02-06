import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

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

app.use(express.json());

// In-memory storage for testing (最小限の実装)
let todos = [];
let nextTodoId = 1;

let posts = [];
let nextPostId = 1;

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
