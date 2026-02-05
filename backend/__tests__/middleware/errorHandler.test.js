import { errorHandler, notFoundHandler } from '../../middleware/errorHandler.js';

describe('エラーハンドリングミドルウェア', () => {
  // テストケースの配列（テーブル駆動テスト）
  const testCases = [
    {
      description: '一般的なエラーを500でハンドリングすること',
      error: new Error('Internal server error'),
      expectedStatus: 500,
      expectedMessage: 'Internal server error'
    },
    {
      description: 'カスタムステータスコード付きエラーをハンドリングすること',
      error: Object.assign(new Error('Bad request'), { status: 400 }),
      expectedStatus: 400,
      expectedMessage: 'Bad request'
    },
    {
      description: 'バリデーションエラーを400でハンドリングすること',
      error: Object.assign(new Error('Validation failed'), {
        status: 400,
        validationErrors: ['Field is required']
      }),
      expectedStatus: 400,
      expectedMessage: 'Validation failed',
      expectedValidationErrors: ['Field is required']
    },
    {
      description: '認証エラーを401でハンドリングすること',
      error: Object.assign(new Error('Unauthorized'), { status: 401 }),
      expectedStatus: 401,
      expectedMessage: 'Unauthorized'
    },
    {
      description: '権限エラーを403でハンドリングすること',
      error: Object.assign(new Error('Forbidden'), { status: 403 }),
      expectedStatus: 403,
      expectedMessage: 'Forbidden'
    },
    {
      description: 'リソース未検出エラーを404でハンドリングすること',
      error: Object.assign(new Error('Not found'), { status: 404 }),
      expectedStatus: 404,
      expectedMessage: 'Not found'
    }
  ];

  test.each(testCases)(
    '$description',
    ({ error, expectedStatus, expectedMessage, expectedValidationErrors }) => {
      // モックのreq, res, next
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // エラーハンドラーを実行
      errorHandler(error, req, res, next);

      // ステータスコードの検証
      expect(res.status).toHaveBeenCalledWith(expectedStatus);

      // レスポンスボディの検証
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.message).toBe(expectedMessage);

      // バリデーションエラーがある場合
      if (expectedValidationErrors) {
        expect(jsonCall.validationErrors).toEqual(expectedValidationErrors);
      }

      // 本番環境ではスタックトレースを含めない
      if (process.env.NODE_ENV === 'production') {
        expect(jsonCall.stack).toBeUndefined();
      }
    }
  );
});

describe('エラーハンドリングミドルウェア - 環境別動作', () => {
  const envCases = [
    {
      description: '開発環境ではスタックトレースを含むこと',
      nodeEnv: 'development',
      shouldIncludeStack: true
    },
    {
      description: '本番環境ではスタックトレースを含まないこと',
      nodeEnv: 'production',
      shouldIncludeStack: false
    },
    {
      description: 'テスト環境ではスタックトレースを含むこと',
      nodeEnv: 'test',
      shouldIncludeStack: true
    }
  ];

  test.each(envCases)(
    '$description',
    ({ nodeEnv, shouldIncludeStack }) => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = nodeEnv;

      const error = new Error('Test error');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      errorHandler(error, req, res, next);

      const jsonCall = res.json.mock.calls[0][0];
      if (shouldIncludeStack) {
        expect(jsonCall.stack).toBeDefined();
      } else {
        expect(jsonCall.stack).toBeUndefined();
      }

      // 環境変数を元に戻す
      process.env.NODE_ENV = originalEnv;
    }
  );
});

describe('404 Not Found ハンドラー', () => {
  test('存在しないルートに対して404エラーを返すこと', () => {
    const req = {
      originalUrl: '/non-existent-route'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    notFoundHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('not found')
      })
    );
  });

  test('リクエストされたURLをエラーメッセージに含むこと', () => {
    const req = {
      originalUrl: '/api/invalid'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    notFoundHandler(req, res, next);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.message).toContain('/api/invalid');
  });
});

describe('エラーハンドリングミドルウェア - 非同期エラー', () => {
  test('非同期関数のエラーを正しくハンドリングすること', async () => {
    const asyncError = new Error('Async operation failed');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(asyncError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Async operation failed'
      })
    );
  });
});
