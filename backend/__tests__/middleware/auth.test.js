import { verifyToken } from '../../middleware/auth.js';

describe('JWT認証ミドルウェア', () => {
  // テストケースの配列（テーブル駆動テスト）
  const testCases = [
    {
      description: '有効なトークンで認証が成功すること',
      token: 'valid.jwt.token',
      expectedError: null,
      expectedUserId: 123,
      shouldCallNext: true
    },
    {
      description: 'トークンが無い場合、401エラーを返すこと',
      token: null,
      expectedError: { status: 401, message: 'No token provided' },
      shouldCallNext: false
    },
    {
      description: '無効なトークン形式の場合、401エラーを返すこと',
      token: 'invalid-format',
      expectedError: { status: 401, message: 'Invalid token format' },
      shouldCallNext: false
    },
    {
      description: '期限切れのトークンの場合、401エラーを返すこと',
      token: 'expired.jwt.token',
      expectedError: { status: 401, message: 'Token expired' },
      shouldCallNext: false
    },
    {
      description: 'Bearer形式のトークンをパースできること',
      token: 'Bearer valid.jwt.token',
      expectedError: null,
      expectedUserId: 123,
      shouldCallNext: true
    }
  ];

  test.each(testCases)(
    '$description',
    async ({ token, expectedError, expectedUserId, shouldCallNext }) => {
      // モックのreq, res, next
      const req = {
        headers: {}
      };

      if (token) {
        req.headers.authorization = token;
      }

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // ミドルウェアを実行
      await verifyToken(req, res, next);

      if (expectedError) {
        // エラーが期待される場合
        expect(res.status).toHaveBeenCalledWith(expectedError.status);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ message: expectedError.message })
        );
        expect(next).not.toHaveBeenCalled();
      } else {
        // 認証成功が期待される場合
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(expectedUserId);
        if (shouldCallNext) {
          expect(next).toHaveBeenCalled();
        }
        expect(res.status).not.toHaveBeenCalled();
      }
    }
  );
});

describe('JWT認証ミドルウェア - トークン生成', () => {
  const tokenGenerationCases = [
    {
      description: 'ユーザーIDからトークンを生成できること',
      userId: 123,
      expiresIn: '1h',
      shouldGenerateToken: true
    },
    {
      description: 'カスタム有効期限でトークンを生成できること',
      userId: 456,
      expiresIn: '7d',
      shouldGenerateToken: true
    },
    {
      description: '無効なユーザーIDの場合、エラーを返すこと',
      userId: null,
      expiresIn: '1h',
      shouldGenerateToken: false,
      expectedError: 'User ID is required'
    }
  ];

  // generateTokenという関数が存在することを前提にテスト
  test.each(tokenGenerationCases)(
    '$description',
    async ({ userId, expiresIn, shouldGenerateToken, expectedError }) => {
      if (shouldGenerateToken) {
        // トークン生成関数をインポート（まだ存在しないので失敗する）
        const { generateToken } = await import('../../middleware/auth.js');
        const token = generateToken(userId, expiresIn);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3); // JWT形式（header.payload.signature）
      } else {
        // エラーケース
        const { generateToken } = await import('../../middleware/auth.js');
        expect(() => generateToken(userId, expiresIn)).toThrow(expectedError);
      }
    }
  );
});

describe('JWT認証ミドルウェア - トークンリフレッシュ', () => {
  test('リフレッシュトークンから新しいアクセストークンを生成できること', async () => {
    const { refreshToken } = await import('../../middleware/auth.js');
    const oldToken = 'valid.refresh.token';
    const newToken = await refreshToken(oldToken);

    expect(newToken).toBeDefined();
    expect(typeof newToken).toBe('string');
    expect(newToken).not.toBe(oldToken);
  });

  test('無効なリフレッシュトークンの場合、エラーを返すこと', async () => {
    const { refreshToken } = await import('../../middleware/auth.js');
    const invalidToken = 'invalid.refresh.token';

    await expect(refreshToken(invalidToken)).rejects.toThrow('Invalid refresh token');
  });
});
