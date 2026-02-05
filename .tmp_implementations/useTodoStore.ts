import { create } from 'zustand';
import type { Todo } from '../types/todo';

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: number) => void;
  setLoading: (loading: boolean) => void;
  clearTodos: () => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  isLoading: false,
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  updateTodo: (todo) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === todo.id ? todo : t)),
    })),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearTodos: () => set({ todos: [] }),
}));
