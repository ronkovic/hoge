import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodoStore } from '../stores/useTodoStore';

describe('useTodoStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTodoStore());
    act(() => {
      result.current.clearTodos();
    });
  });

  describe('初期状態', () => {
    it('初期状態でtodosは空配列である', () => {
      const { result } = renderHook(() => useTodoStore());
      expect(result.current.todos).toEqual([]);
    });

    it('初期状態でisLoadingはfalseである', () => {
      const { result } = renderHook(() => useTodoStore());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setTodos', () => {
    it.each([
      {
        name: '単一のTodoをセットできる',
        todos: [{ id: 1, title: 'Test Todo', completed: false }],
      },
      {
        name: '複数のTodoをセットできる',
        todos: [
          { id: 1, title: 'Todo 1', completed: false },
          { id: 2, title: 'Todo 2', completed: true },
        ],
      },
      {
        name: '空配列をセットできる',
        todos: [],
      },
    ])('$name', ({ todos }) => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setTodos(todos);
      });

      expect(result.current.todos).toEqual(todos);
    });
  });

  describe('addTodo', () => {
    it.each([
      {
        name: 'Todoを追加できる',
        newTodo: { id: 1, title: 'New Todo', completed: false },
        expectedLength: 1,
      },
      {
        name: '複数のTodoを連続して追加できる',
        newTodo: { id: 2, title: 'Second Todo', completed: false },
        initialTodos: [{ id: 1, title: 'First Todo', completed: false }],
        expectedLength: 2,
      },
    ])('$name', ({ newTodo, initialTodos, expectedLength }) => {
      const { result } = renderHook(() => useTodoStore());

      if (initialTodos) {
        act(() => {
          result.current.setTodos(initialTodos);
        });
      }

      act(() => {
        result.current.addTodo(newTodo);
      });

      expect(result.current.todos).toHaveLength(expectedLength);
      expect(result.current.todos[result.current.todos.length - 1]).toEqual(newTodo);
    });
  });

  describe('updateTodo', () => {
    it.each([
      {
        name: 'Todoを更新できる',
        initialTodo: { id: 1, title: 'Test Todo', completed: false },
        updatedTodo: { id: 1, title: 'Test Todo', completed: true },
      },
      {
        name: '複数のTodoのうち特定のTodoを更新できる',
        initialTodos: [
          { id: 1, title: 'Todo 1', completed: false },
          { id: 2, title: 'Todo 2', completed: false },
        ],
        updatedTodo: { id: 2, title: 'Todo 2', completed: true },
        expectedTodos: [
          { id: 1, title: 'Todo 1', completed: false },
          { id: 2, title: 'Todo 2', completed: true },
        ],
      },
    ])('$name', ({ initialTodo, initialTodos, updatedTodo, expectedTodos }) => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        if (initialTodos) {
          result.current.setTodos(initialTodos);
        } else if (initialTodo) {
          result.current.setTodos([initialTodo]);
        }
      });

      act(() => {
        result.current.updateTodo(updatedTodo);
      });

      if (expectedTodos) {
        expect(result.current.todos).toEqual(expectedTodos);
      } else {
        expect(result.current.todos[0]).toEqual(updatedTodo);
      }
    });
  });

  describe('deleteTodo', () => {
    it.each([
      {
        name: 'Todoを削除できる',
        initialTodo: { id: 1, title: 'Test Todo', completed: false },
        deleteId: 1,
        expectedLength: 0,
      },
      {
        name: '複数のTodoのうち特定のTodoを削除できる',
        initialTodos: [
          { id: 1, title: 'Todo 1', completed: false },
          { id: 2, title: 'Todo 2', completed: false },
        ],
        deleteId: 1,
        expectedLength: 1,
        expectedRemaining: { id: 2, title: 'Todo 2', completed: false },
      },
    ])('$name', ({ initialTodo, initialTodos, deleteId, expectedLength, expectedRemaining }) => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        if (initialTodos) {
          result.current.setTodos(initialTodos);
        } else if (initialTodo) {
          result.current.setTodos([initialTodo]);
        }
      });

      act(() => {
        result.current.deleteTodo(deleteId);
      });

      expect(result.current.todos).toHaveLength(expectedLength);
      if (expectedRemaining) {
        expect(result.current.todos[0]).toEqual(expectedRemaining);
      }
    });
  });

  describe('setLoading', () => {
    it.each([
      { name: 'ローディング状態をtrueに設定できる', loading: true },
      { name: 'ローディング状態をfalseに設定できる', loading: false },
    ])('$name', ({ loading }) => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setLoading(loading);
      });

      expect(result.current.isLoading).toBe(loading);
    });
  });
});
