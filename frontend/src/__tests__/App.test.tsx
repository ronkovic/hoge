import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  describe('ルーティング設定', () => {
    it.each([
      {
        name: 'ルートパス(/)でLoginPageが表示される',
        path: '/',
        testId: 'login-page',
      },
      {
        name: '/todosパスでTodosPageが表示される（認証済みの場合）',
        path: '/todos',
        authToken: 'test-token',
        testId: 'todos-page',
      },
      {
        name: '/dashboardパスでDashboardPageが表示される（認証済みの場合）',
        path: '/dashboard',
        authToken: 'test-token',
        testId: 'dashboard-page',
      },
      {
        name: '存在しないパスでNotFoundPageが表示される',
        path: '/nonexistent',
        testId: 'not-found-page',
      },
    ])('$name', ({ path, testId, authToken }) => {
      // localStorageをクリア
      localStorage.clear();

      // authTokenがある場合はlocalStorageに設定
      if (authToken) {
        localStorage.setItem('authToken', authToken);
      }

      // 初期パスを設定
      window.history.pushState({}, '', path);

      // Appコンポーネントをレンダリング
      render(<App />);

      // 期待されるページが表示されることを確認
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  describe('ProtectedRouteによる認証チェック', () => {
    it.each([
      {
        name: '未認証時に/todosにアクセスするとLoginPageにリダイレクトされる',
        path: '/todos',
        authToken: null,
        testId: 'login-page',
      },
      {
        name: '未認証時に/dashboardにアクセスするとLoginPageにリダイレクトされる',
        path: '/dashboard',
        authToken: null,
        testId: 'login-page',
      },
      {
        name: '認証済みの場合は/todosにアクセスできる',
        path: '/todos',
        authToken: 'test-token',
        testId: 'todos-page',
      },
      {
        name: '認証済みの場合は/dashboardにアクセスできる',
        path: '/dashboard',
        authToken: 'test-token',
        testId: 'dashboard-page',
      },
    ])('$name', ({ path, authToken, testId }) => {
      // localStorageをクリア
      localStorage.clear();

      // authTokenがある場合はlocalStorageに設定
      if (authToken) {
        localStorage.setItem('authToken', authToken);
      }

      // 初期パスを設定
      window.history.pushState({}, '', path);

      // Appコンポーネントをレンダリング
      render(<App />);

      // 期待されるページが表示されることを確認
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  describe('リダイレクト後の元のパス保存', () => {
    it.each([
      {
        name: '未認証時に/todosにアクセスすると、sessionStorageにリダイレクト先が保存される',
        path: '/todos',
      },
      {
        name: '未認証時に/dashboardにアクセスすると、sessionStorageにリダイレクト先が保存される',
        path: '/dashboard',
      },
    ])('$name', ({ path }) => {
      // localStorageとsessionStorageをクリア
      localStorage.clear();
      sessionStorage.clear();

      // 初期パスを設定
      window.history.pushState({}, '', path);

      // Appコンポーネントをレンダリング
      render(<App />);

      // sessionStorageにリダイレクト先が保存されていることを確認
      expect(sessionStorage.getItem('redirectAfterLogin')).toBe(path);
    });
  });
});
