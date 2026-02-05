import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

// テスト用のダミーコンポーネント
const ProtectedContent = () => <div>保護されたコンテンツ</div>;
const LoginPage = () => <div>ログインページ</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageとsessionStorageをクリア
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('認証チェック', () => {
    it.each([
      {
        name: 'authTokenがlocalStorageに存在する場合、子要素が表示される',
        authToken: 'test-token-123',
        expectedText: '保護されたコンテンツ',
      },
      {
        name: 'authTokenがlocalStorageに存在する場合（別のトークン）、子要素が表示される',
        authToken: 'another-token-456',
        expectedText: '保護されたコンテンツ',
      },
    ])('$name', ({ authToken, expectedText }) => {
      // localStorageにauthTokenを設定
      localStorage.setItem('authToken', authToken);

      // ProtectedRouteをレンダリング
      render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // 保護されたコンテンツが表示されることを確認
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it.each([
      {
        name: 'authTokenがlocalStorageに存在しない場合、ログインページにリダイレクトされる',
        path: '/protected',
      },
      {
        name: 'authTokenがnullの場合、ログインページにリダイレクトされる',
        path: '/protected',
      },
    ])('$name', ({ path }) => {
      // 初期パスを設定
      window.history.pushState({}, '', path);

      // ProtectedRouteをレンダリング
      render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // ログインページが表示されることを確認
      expect(screen.getByText('ログインページ')).toBeInTheDocument();
    });
  });

  describe('リダイレクト後の元のパス保存', () => {
    it.each([
      {
        name: '未認証時に保護されたルートにアクセスすると、sessionStorageに元のパスが保存される',
        path: '/protected',
      },
      {
        name: '未認証時に別の保護されたルートにアクセスすると、sessionStorageに元のパスが保存される',
        path: '/dashboard',
      },
    ])('$name', ({ path }) => {
      // 初期パスを設定
      window.history.pushState({}, '', path);

      // ProtectedRouteをレンダリング
      render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // sessionStorageに元のパスが保存されていることを確認
      expect(sessionStorage.getItem('redirectAfterLogin')).toBe(path);
    });
  });

  describe('認証済みユーザーの場合', () => {
    it.each([
      {
        name: '認証済みの場合、sessionStorageにリダイレクト先は保存されない',
        authToken: 'test-token',
        path: '/protected',
      },
      {
        name: '認証済みの場合（別のトークン）、sessionStorageにリダイレクト先は保存されない',
        authToken: 'another-token',
        path: '/dashboard',
      },
    ])('$name', ({ authToken, path }) => {
      // localStorageにauthTokenを設定
      localStorage.setItem('authToken', authToken);

      // 初期パスを設定
      window.history.pushState({}, '', path);

      // ProtectedRouteをレンダリング
      render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      // sessionStorageにリダイレクト先が保存されていないことを確認
      expect(sessionStorage.getItem('redirectAfterLogin')).toBeNull();
    });
  });
});
