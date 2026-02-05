import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// localStorageとsessionStorageのモック
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = value;
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

const sessionStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = value;
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
});

// todoApiをモック化
vi.mock('../api/todoApi', () => ({
  todoApi: {
    getTodos: vi.fn(() => Promise.resolve([])),
    createTodo: vi.fn((title: string) => Promise.resolve({ id: 1, title, completed: false })),
    updateTodo: vi.fn((id: number, completed: boolean) =>
      Promise.resolve({ id, title: 'Test', completed })
    ),
    deleteTodo: vi.fn(() => Promise.resolve()),
  },
}));

beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
