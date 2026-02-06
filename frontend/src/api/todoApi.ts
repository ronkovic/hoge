import axios from 'axios';
import type { Todo } from '../types/todo';

const API_BASE_URL = 'http://localhost:8080/api';

let nextId = 1;
const mockTodos: Todo[] = [];

const USE_MOCK = true;

export const todoApi = {
  async getTodos(): Promise<Todo[]> {
    if (USE_MOCK) {
      return Promise.resolve([...mockTodos]);
    }
    const response = await axios.get<Todo[]>(`${API_BASE_URL}/todos`);
    return response.data;
  },

  async createTodo(title: string): Promise<Todo> {
    if (USE_MOCK) {
      const newTodo: Todo = { id: nextId++, title, completed: false };
      mockTodos.push(newTodo);
      return Promise.resolve(newTodo);
    }
    const response = await axios.post<Todo>(`${API_BASE_URL}/todos`, { title });
    return response.data;
  },

  async updateTodo(id: number, completed: boolean): Promise<Todo> {
    if (USE_MOCK) {
      const todo = mockTodos.find((t) => t.id === id);
      if (!todo) throw new Error('Todo not found');
      todo.completed = completed;
      return Promise.resolve({ ...todo });
    }
    const response = await axios.put<Todo>(`${API_BASE_URL}/todos/${id}`, { completed });
    return response.data;
  },

  async deleteTodo(id: number): Promise<void> {
    if (USE_MOCK) {
      const index = mockTodos.findIndex((t) => t.id === id);
      if (index !== -1) {
        mockTodos.splice(index, 1);
      }
      return Promise.resolve();
    }
    await axios.delete(`${API_BASE_URL}/todos/${id}`);
  },
};
