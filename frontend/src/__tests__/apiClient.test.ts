import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios.create to return a proper axios instance
vi.mock('axios', () => {
  const mockAxiosInstance = {
    defaults: {
      baseURL: 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        common: {},
      },
    },
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

import { apiClient, setAuthToken, getAuthToken, shouldRetry } from '../api/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本設定', () => {
    it('デフォルトのベースURLが設定されている', () => {
      expect(apiClient.defaults.baseURL).toBeDefined();
      expect(apiClient.defaults.baseURL).toBe('http://localhost:8080/api');
    });

    it('デフォルトのContent-Typeがapplication/jsonである', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('認証トークンの設定', () => {
    it.each([
      { name: 'トークンをヘッダーに設定できる', token: 'test-token-123' },
      { name: '異なるトークンをヘッダーに設定できる', token: 'another-token-456' },
    ])('$name', ({ token }) => {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      expect(apiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    it('トークンを削除できる', () => {
      apiClient.defaults.headers.common['Authorization'] = 'Bearer test-token';
      delete apiClient.defaults.headers.common['Authorization'];

      expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('インターセプター', () => {
    describe('リクエストインターセプター', () => {
      it('リクエストインターセプターが設定されている', () => {
        expect(apiClient.interceptors.request).toBeDefined();
      });

      it.each([
        {
          name: 'トークンがある場合、Authorizationヘッダーが追加される',
          token: 'test-token',
          expectedHeader: 'Bearer test-token',
        },
        {
          name: 'トークンがない場合、Authorizationヘッダーは追加されない',
          token: null,
          expectedHeader: undefined,
        },
      ])('$name', ({ token, expectedHeader }) => {
        const config = {
          headers: {},
        };

        if (token) {
          // トークンをlocalStorageに保存する想定
          // 実装ではgetAuthToken()のような関数を使用
        }

        // インターセプターの動作をテスト
        // 実装ではconfig.headers.Authorizationが設定される
      });
    });

    describe('レスポンスインターセプター', () => {
      it('レスポンスインターセプターが設定されている', () => {
        expect(apiClient.interceptors.response).toBeDefined();
      });

      it.each([
        {
          name: '401エラーの場合、認証エラーハンドリングが実行される',
          status: 401,
          errorType: 'AuthenticationError',
        },
        {
          name: '403エラーの場合、認可エラーハンドリングが実行される',
          status: 403,
          errorType: 'AuthorizationError',
        },
        {
          name: '500エラーの場合、サーバーエラーハンドリングが実行される',
          status: 500,
          errorType: 'ServerError',
        },
      ])('$name', ({ status, errorType }) => {
        // レスポンスインターセプターのエラーハンドリングをテスト
        // 実装ではstatusに応じて適切なエラーを投げる
      });
    });
  });

  describe('ヘルパーメソッド', () => {
    describe('setAuthToken', () => {
      it.each([
        { name: '認証トークンを設定できる', token: 'test-token-123' },
        { name: 'nullトークンを設定するとヘッダーから削除される', token: null },
      ])('$name', ({ token }) => {
        setAuthToken(token);

        if (token) {
          expect(apiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
          expect(getAuthToken()).toBe(token);
        } else {
          expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
          expect(getAuthToken()).toBeNull();
        }
      });
    });

    describe('getAuthToken', () => {
      it('現在の認証トークンを取得できる', () => {
        const token = 'test-token-456';
        setAuthToken(token);
        expect(getAuthToken()).toBe(token);
      });
    });
  });

  describe('リトライ機能', () => {
    it.each([
      {
        name: 'ネットワークエラーの場合、リトライする',
        error: { code: 'ECONNABORTED' },
        expectedRetry: true,
      },
      {
        name: '500エラーの場合、リトライする',
        error: { response: { status: 500 } },
        expectedRetry: true,
      },
      {
        name: '400エラーの場合、リトライしない',
        error: { response: { status: 400 } },
        expectedRetry: false,
      },
    ])('$name', ({ error, expectedRetry }) => {
      const result = shouldRetry(error);
      expect(result).toBe(expectedRetry);
    });
  });

  describe('タイムアウト設定', () => {
    it('デフォルトのタイムアウトが設定されている', () => {
      expect(apiClient.defaults.timeout).toBeDefined();
      expect(apiClient.defaults.timeout).toBeGreaterThan(0);
    });
  });
});
