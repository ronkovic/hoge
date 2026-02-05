import express from 'express';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// In-memory storage for testing (最小限の実装)
let todos = [];
let nextId = 1;

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

// サーバー起動（直接実行時のみ）
// import.meta.urlを使用してモジュールが直接実行されたかを判定
const isMainModule = process.argv[1] && process.argv[1].endsWith('server.js');

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { app };
