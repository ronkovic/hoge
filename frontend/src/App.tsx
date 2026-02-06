import { useState, useEffect } from 'react';
import { TodoList } from './components/TodoList';
import { TodoForm } from './components/TodoForm';
import { PostList } from './components/PostList';
import { PostForm } from './components/PostForm';
import { todoApi } from './api/todoApi';
import { postApi } from './api/postApi';
import type { Todo } from './types/todo';
import type { Post } from './types/post';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadTodos();
    loadPosts();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await todoApi.getTodos();
      setTodos(data);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await postApi.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

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
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const updatedTodo = await todoApi.updateTodo(id, !todo.completed);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleAddPost = async (title: string, author: string, content: string) => {
    try {
      const newPost = await postApi.createPost(title, author, content);
      setPosts([...posts, newPost]);
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      await postApi.deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Todo アプリケーション</h1>
      <TodoForm onSubmit={handleAddTodo} />
      <TodoList
        todos={todos}
        onToggle={handleToggleTodo}
        onDelete={handleDeleteTodo}
      />

      <hr style={{ margin: '40px 0' }} />

      <h1>Post アプリケーション</h1>
      <PostForm onSubmit={handleAddPost} />
      <PostList
        posts={posts}
        onDelete={handleDeletePost}
      />
    </div>
  );
}

export default App;
