import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// todoApiをモック化
vi.mock('../api/todoApi', () => ({
  todoApi: {
    getTodos: vi.fn(() => Promise.resolve([])),
    createTodo: vi.fn((title: string) => Promise.resolve({ id: 1, title, completed: false })),
    updateTodo: vi.fn((id: number, completed: boolean) => Promise.resolve({ id, title: 'Test', completed })),
    deleteTodo: vi.fn(() => Promise.resolve()),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
