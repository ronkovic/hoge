import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { TodosPage } from './pages/TodosPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
<<<<<<< HEAD
<<<<<<< HEAD
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const data = await todoApi.getTodos();
        setTodos(data);
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    };

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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Todo アプリケーション</h1>
      <TodoForm onSubmit={handleAddTodo} />
      <TodoList todos={todos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
    </div>
=======
=======
>>>>>>> feature/_20260205_153345-task-012
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/todos"
          element={
            <ProtectedRoute>
              <TodosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
<<<<<<< HEAD
>>>>>>> feature/_20260205_153345-task-012
=======
>>>>>>> feature/_20260205_153345-task-012
  );
}

export default App;
