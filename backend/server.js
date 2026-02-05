import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// In-memory storage for testing (最小限の実装)
let todos = [];
let nextId = 1;

// In-memory storage for comments
let comments = [];
let nextCommentId = 1;

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

  const newComment = {
    id: nextCommentId++,
    content,
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
