import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TodoList } from '../components/TodoList';
import { TodoForm } from '../components/TodoForm';
import { todoApi } from '../api/todoApi';
import type { Todo } from '../types/todo';

export function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const navigate = useNavigate();

  const loadTodos = async () => {
    try {
      const data = await todoApi.getTodos();
      setTodos(data);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleAddTodo = async (title: string) => {
    try {
      const newTodo = await todoApi.createTodo(title);
      setTodos([...todos, newTodo]);
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const updatedTodo = await todoApi.updateTodo(id, !todo.completed);
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div data-testid="todos-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <nav>
          <Link to="/" data-testid="nav-link-home">
            Home
          </Link>
          {' | '}
          <Link to="/todos" data-testid="nav-link-todos">
            Todos
          </Link>
          {' | '}
          <Link to="/dashboard" data-testid="nav-link-dashboard">
            Dashboard
          </Link>
          {' | '}
          <button
            onClick={handleLogout}
            style={{
              border: 'none',
              background: 'none',
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            ログアウト
          </button>
        </nav>
      </div>
      <h1>Todo アプリケーション</h1>
      <TodoForm onSubmit={handleAddTodo} />
      <TodoList todos={todos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
    </div>
  );
}
