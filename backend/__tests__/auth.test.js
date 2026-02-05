import request from 'supertest';
import { app } from '../server.js';

describe('Authentication API Endpoints', () => {
  // テストデータ
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  let authToken = null;

  // 正常系テストケース（テーブル駆動テスト）
  const successTestCases = [
    {
      method: 'POST',
      endpoint: '/api/auth/register',
      description: '新規ユーザーを登録できること',
      body: testUser,
      expectedStatus: 201,
      expectedBodyKeys: ['id', 'username', 'email', 'createdAt'],
      shouldNotInclude: ['password']
    },
    {
      method: 'POST',
      endpoint: '/api/auth/login',
      description: '正しい認証情報でログインできること',
      body: { email: testUser.email, password: testUser.password },
      expectedStatus: 200,
      expectedBodyKeys: ['token', 'user'],
      nestedKeys: { user: ['id', 'username', 'email'] }
    }
  ];

  describe('正常系テスト', () => {
    test.each(successTestCases)(
      '$method $endpoint - $description',
      async ({ method, endpoint, body, expectedStatus, expectedBodyKeys, shouldNotInclude, nestedKeys }) => {
        let response;

        switch (method) {
          case 'GET':
            response = await request(app)
              .get(endpoint)
              .set('Authorization', authToken ? `Bearer ${authToken}` : '');
            break;
          case 'POST':
            response = await request(app).post(endpoint).send(body);
            break;
          case 'PUT':
            response = await request(app).put(endpoint).send(body);
            break;
          case 'DELETE':
            response = await request(app).delete(endpoint);
            break;
        }

        // ステータスコードの検証
        expect(response.status).toBe(expectedStatus);

        // レスポンスボディのキー検証
        if (expectedBodyKeys) {
          expectedBodyKeys.forEach(key => {
            expect(response.body).toHaveProperty(key);
          });
        }

        // 含まれてはいけないキーの検証
        if (shouldNotInclude) {
          shouldNotInclude.forEach(key => {
            expect(response.body).not.toHaveProperty(key);
          });
        }

        // ネストされたオブジェクトのキー検証
        if (nestedKeys) {
          Object.entries(nestedKeys).forEach(([parentKey, childKeys]) => {
            expect(response.body).toHaveProperty(parentKey);
            childKeys.forEach(childKey => {
              expect(response.body[parentKey]).toHaveProperty(childKey);
            });
          });
        }

        // ログインテストの場合、トークンを保存
        if (endpoint === '/api/auth/login' && response.body.token) {
          authToken = response.body.token;
        }
      }
    );

    test('GET /api/auth/me - 有効なトークンでユーザー情報を取得できること', async () => {
      // 前提: ユーザー登録とログインが完了していること
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'meuser',
          email: 'me@example.com',
          password: 'password123'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me@example.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'meuser');
      expect(response.body).toHaveProperty('email', 'me@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    test('POST /api/auth/logout - 有効なトークンでログアウトできること', async () => {
      // 前提: ユーザー登録とログインが完了していること
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'logoutuser',
          email: 'logout@example.com',
          password: 'password123'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('successfully');
    });
  });

  // エラーケーステスト（テーブル駆動テスト）
  describe('エラーハンドリングテスト', () => {
    const errorTestCases = [
      {
        method: 'POST',
        endpoint: '/api/auth/register',
        description: 'username が欠けている場合、400を返すこと',
        body: { email: 'test@example.com', password: 'password123' },
        expectedStatus: 400
      },
      {
        method: 'POST',
        endpoint: '/api/auth/register',
        description: 'email が欠けている場合、400を返すこと',
        body: { username: 'testuser', password: 'password123' },
        expectedStatus: 400
      },
      {
        method: 'POST',
        endpoint: '/api/auth/register',
        description: 'password が欠けている場合、400を返すこと',
        body: { username: 'testuser', email: 'test@example.com' },
        expectedStatus: 400
      },
      {
        method: 'POST',
        endpoint: '/api/auth/login',
        description: 'email が欠けている場合、400を返すこと',
        body: { password: 'password123' },
        expectedStatus: 400
      },
      {
        method: 'POST',
        endpoint: '/api/auth/login',
        description: 'password が欠けている場合、400を返すこと',
        body: { email: 'test@example.com' },
        expectedStatus: 400
      },
      {
        method: 'POST',
        endpoint: '/api/auth/login',
        description: '誤った認証情報では401を返すこと',
        body: { email: 'wrong@example.com', password: 'wrongpassword' },
        expectedStatus: 401
      },
      {
        method: 'GET',
        endpoint: '/api/auth/me',
        description: 'トークンなしでは401を返すこと',
        expectedStatus: 401,
        noAuth: true
      },
      {
        method: 'POST',
        endpoint: '/api/auth/logout',
        description: 'トークンなしでは401を返すこと',
        expectedStatus: 401,
        noAuth: true
      }
    ];

    test.each(errorTestCases)(
      '$method $endpoint - $description',
      async ({ method, endpoint, body, expectedStatus, noAuth }) => {
        let response;

        switch (method) {
          case 'GET':
            response = await request(app)
              .get(endpoint)
              .set('Authorization', noAuth ? '' : 'Bearer invalid-token');
            break;
          case 'POST':
            const req = request(app).post(endpoint);
            if (body) {
              req.send(body);
            }
            if (!noAuth && endpoint.includes('logout')) {
              req.set('Authorization', 'Bearer invalid-token');
            }
            response = await req;
            break;
        }

        expect(response.status).toBe(expectedStatus);
      }
    );

    test('POST /api/auth/register - 既存のユーザーと重複する場合、409を返すこと', async () => {
      // 最初のユーザー登録
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicate',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      // 同じメールアドレスで再登録
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicate2',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
    });
  });

  // 統合フローテスト
  describe('統合フローテスト', () => {
    test('register → login → me → logout の一連のフローが正常に動作すること', async () => {
      const newUser = {
        username: 'flowuser',
        email: 'flow@example.com',
        password: 'password123'
      };

      // 1. ユーザー登録
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('id');
      expect(registerResponse.body.username).toBe(newUser.username);

      // 2. ログイン
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: newUser.email,
          password: newUser.password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      const token = loginResponse.body.token;

      // 3. ユーザー情報取得
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.username).toBe(newUser.username);
      expect(meResponse.body.email).toBe(newUser.email);

      // 4. ログアウト
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toHaveProperty('message');
    });
  });
});
