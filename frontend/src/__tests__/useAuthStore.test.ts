import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../stores/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  describe('初期状態', () => {
    it('初期状態でuserはnullである', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.user).toBeNull();
    });

    it('初期状態でtokenはnullである', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.token).toBeNull();
    });

    it('初期状態でisAuthenticatedはfalseである', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it.each([
      {
        name: 'ユーザーとトークンを設定してログインできる',
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        token: 'test-token-123',
      },
      {
        name: '異なるユーザーでログインできる',
        user: { id: 2, username: 'anotheruser', email: 'another@example.com' },
        token: 'another-token-456',
      },
    ])('$name', ({ user, token }) => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(user, token);
      });

      expect(result.current.user).toEqual(user);
      expect(result.current.token).toBe(token);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('ログアウトするとuserとtokenがnullになる', () => {
      const { result } = renderHook(() => useAuthStore());

      // まずログイン
      act(() => {
        result.current.login(
          { id: 1, username: 'testuser', email: 'test@example.com' },
          'test-token'
        );
      });

      // ログアウト
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('updateUser', () => {
    it.each([
      {
        name: 'ユーザー情報を更新できる',
        initialUser: { id: 1, username: 'testuser', email: 'test@example.com' },
        updatedUser: { id: 1, username: 'updateduser', email: 'updated@example.com' },
      },
      {
        name: 'ユーザー名のみ更新できる',
        initialUser: { id: 1, username: 'testuser', email: 'test@example.com' },
        updatedUser: { id: 1, username: 'newusername', email: 'test@example.com' },
      },
    ])('$name', ({ initialUser, updatedUser }) => {
      const { result } = renderHook(() => useAuthStore());

      // ログイン
      act(() => {
        result.current.login(initialUser, 'test-token');
      });

      // ユーザー情報更新
      act(() => {
        result.current.updateUser(updatedUser);
      });

      expect(result.current.user).toEqual(updatedUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('setToken', () => {
    it.each([
      { name: 'トークンを設定できる', token: 'new-token-123' },
      { name: '異なるトークンを設定できる', token: 'different-token-456' },
    ])('$name', ({ token }) => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setToken(token);
      });

      expect(result.current.token).toBe(token);
    });
  });
});
