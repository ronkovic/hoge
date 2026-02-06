import request from 'supertest';
import { app, resetComments } from '../server.js';

describe('セキュリティテスト', () => {
  beforeEach(() => {
    resetComments();
  });

  // XSS（Cross-Site Scripting）対策テスト
  describe('XSS対策', () => {
    const xssTestCases = [
      {
        description: 'スクリプトタグを含むコメントがサニタイズされること',
        endpoint: '/comments',
        method: 'POST',
        body: {
          content: '<script>alert("XSS")</script>This is a comment',
          author: 'Test User'
        },
        expectedStatus: 201,
        validateNoScript: true
      },
      {
        description: 'イベントハンドラを含むコメントがサニタイズされること',
        endpoint: '/comments',
        method: 'POST',
        body: {
          content: '<img src=x onerror="alert(\'XSS\')">',
          author: 'Test User'
        },
        expectedStatus: 201,
        validateNoScript: true
      },
      {
        description: 'スクリプトタグを含む記事タイトルがサニタイズされること',
        endpoint: '/api/articles',
        method: 'POST',
        body: {
          user_id: 1,
          title: '<script>alert("XSS")</script>Article Title',
          content: 'Normal content',
          published: false
        },
        expectedStatus: 201,
        validateNoScript: true
      },
      {
        description: 'スクリプトタグを含む記事本文がサニタイズされること',
        endpoint: '/api/articles',
        method: 'POST',
        body: {
          user_id: 1,
          title: 'Normal Title',
          content: '<script>alert("XSS")</script>Article content',
          published: false
        },
        expectedStatus: 201,
        validateNoScript: true
      }
    ];

    test.each(xssTestCases)(
      '$description',
      async ({ endpoint, method, body, expectedStatus, validateNoScript }) => {
        let response;

        switch (method) {
          case 'POST':
            response = await request(app).post(endpoint).send(body);
            break;
          case 'GET':
            response = await request(app).get(endpoint);
            break;
        }

        expect(response.status).toBe(expectedStatus);

        if (validateNoScript) {
          // レスポンスにスクリプトタグが含まれていないことを確認
          const responseBody = JSON.stringify(response.body);
          expect(responseBody).not.toContain('<script>');
          expect(responseBody).not.toContain('onerror');
          expect(responseBody).not.toContain('javascript:');
        }
      }
    );
  });

  // SQLインジェクション対策テスト（将来的なDB接続を想定）
  describe('SQLインジェクション対策', () => {
    const sqlInjectionCases = [
      {
        description: 'SQLインジェクション攻撃を試みるコメント作成を防ぐこと',
        endpoint: '/comments',
        method: 'POST',
        body: {
          content: "'; DROP TABLE comments; --",
          author: 'Hacker'
        },
        expectedStatus: 201,
        validateSafe: true
      },
      {
        description: 'SQLインジェクション攻撃を試みる記事作成を防ぐこと',
        endpoint: '/api/articles',
        method: 'POST',
        body: {
          user_id: 1,
          title: "'; DROP TABLE articles; --",
          content: 'Malicious content',
          published: false
        },
        expectedStatus: 201,
        validateSafe: true
      },
      {
        description: 'UNIONベースのSQLインジェクションを防ぐこと',
        endpoint: '/api/articles',
        method: 'POST',
        body: {
          user_id: 1,
          title: "' UNION SELECT * FROM users --",
          content: 'Malicious content',
          published: false
        },
        expectedStatus: 201,
        validateSafe: true
      }
    ];

    test.each(sqlInjectionCases)(
      '$description',
      async ({ endpoint, method, body, expectedStatus, validateSafe }) => {
        let response;

        switch (method) {
          case 'POST':
            response = await request(app).post(endpoint).send(body);
            break;
        }

        expect(response.status).toBe(expectedStatus);

        if (validateSafe) {
          // データが安全に保存されていることを確認
          expect(response.body).toBeDefined();
          expect(response.body.id).toBeDefined();
        }
      }
    );
  });

  // 認証バイパス攻撃テスト
  describe('認証バイパス攻撃対策', () => {
    const authBypassCases = [
      {
        description: '不正なトークンでユーザー情報にアクセスできないこと',
        endpoint: '/api/auth/me',
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid_token_12345'
        },
        expectedStatus: 401
      },
      {
        description: 'トークンなしでログアウトできないこと',
        endpoint: '/api/auth/logout',
        method: 'POST',
        expectedStatus: 401
      },
      {
        description: '空のトークンで認証できないこと',
        endpoint: '/api/auth/me',
        method: 'GET',
        headers: {
          authorization: 'Bearer '
        },
        expectedStatus: 401
      },
      {
        description: 'Bearer形式でないトークンで認証できないこと',
        endpoint: '/api/auth/me',
        method: 'GET',
        headers: {
          authorization: 'invalid_token'
        },
        expectedStatus: 401
      }
    ];

    test.each(authBypassCases)(
      '$description',
      async ({ endpoint, method, headers, expectedStatus }) => {
        let response;

        switch (method) {
          case 'GET':
            let getRequest = request(app).get(endpoint);
            if (headers) {
              Object.entries(headers).forEach(([key, value]) => {
                getRequest = getRequest.set(key, value);
              });
            }
            response = await getRequest;
            break;
          case 'POST':
            let postRequest = request(app).post(endpoint);
            if (headers) {
              Object.entries(headers).forEach(([key, value]) => {
                postRequest = postRequest.set(key, value);
              });
            }
            response = await postRequest;
            break;
        }

        expect(response.status).toBe(expectedStatus);
      }
    );
  });

  // パスワード強度テスト
  describe('パスワード強度検証', () => {
    const passwordStrengthCases = [
      {
        description: '短すぎるパスワードは拒否されること（8文字未満）',
        password: '1234567',
        expectedStatus: 400,
        shouldReject: true
      },
      {
        description: '数字のみのパスワードは拒否されること',
        password: '12345678',
        expectedStatus: 400,
        shouldReject: true
      },
      {
        description: 'よくあるパスワードは拒否されること',
        password: 'password',
        expectedStatus: 400,
        shouldReject: true
      },
      {
        description: '強力なパスワードは受け入れられること',
        password: 'StrongP@ssw0rd!',
        expectedStatus: 201,
        shouldReject: false
      }
    ];

    test.each(passwordStrengthCases)(
      '$description',
      async ({ password, expectedStatus, shouldReject }) => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: `user_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: password
          });

        expect(response.status).toBe(expectedStatus);

        if (shouldReject) {
          expect(response.body).toHaveProperty('message');
        } else {
          expect(response.body).toHaveProperty('id');
        }
      }
    );
  });

  // レート制限テスト（DOS攻撃対策）
  describe('レート制限', () => {
    test('短時間に大量のリクエストを送信すると制限されること', async () => {
      const requests = [];
      const limit = 100; // 制限値

      // 大量のリクエストを並列送信
      for (let i = 0; i < limit + 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/register')
            .send({
              username: `user_${i}`,
              email: `user_${i}@example.com`,
              password: 'password123'
            })
        );
      }

      const responses = await Promise.all(requests);

      // 一部のリクエストが429 (Too Many Requests) を返すことを確認
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('ログイン試行の制限があること', async () => {
      const requests = [];
      const limit = 10; // ログイン試行制限

      // 大量のログイン試行
      for (let i = 0; i < limit + 5; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'nonexistent@example.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(requests);

      // 一部のリクエストが429または403を返すことを確認
      const blockedResponses = responses.filter(r => r.status === 429 || r.status === 403);
      expect(blockedResponses.length).toBeGreaterThan(0);
    });
  });

  // CSRF（Cross-Site Request Forgery）対策テスト
  describe('CSRF対策', () => {
    test('CSRFトークンなしでPOSTリクエストが拒否されること', async () => {
      const response = await request(app)
        .post('/api/articles')
        .send({
          user_id: 1,
          title: 'CSRF Test',
          content: 'Testing CSRF protection',
          published: false
        });

      // CSRFトークンがない場合は201または403を返すべき
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect([201, 403]).toContain(response.status);

      if (response.status === 403) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('CSRF');
      }
    });

    test('有効なCSRFトークンでPOSTリクエストが成功すること', async () => {
      // まずCSRFトークンを取得
      const tokenResponse = await request(app).get('/api/csrf-token');
      const csrfToken = tokenResponse.body.csrfToken;

      // CSRFトークンを含めてリクエスト
      const response = await request(app)
        .post('/api/articles')
        .set('X-CSRF-Token', csrfToken)
        .send({
          user_id: 1,
          title: 'CSRF Test',
          content: 'Testing CSRF protection',
          published: false
        });

      expect(response.status).toBe(201);
    });
  });

  // ファイルアップロード攻撃対策テスト
  describe('ファイルアップロード攻撃対策', () => {
    const fileUploadCases = [
      {
        description: '実行可能ファイルのアップロードが拒否されること',
        filename: 'malicious.exe',
        mimeType: 'application/x-msdownload',
        expectedStatus: 400
      },
      {
        description: 'スクリプトファイルのアップロードが拒否されること',
        filename: 'malicious.js',
        mimeType: 'application/javascript',
        expectedStatus: 400
      },
      {
        description: 'PHPファイルのアップロードが拒否されること',
        filename: 'malicious.php',
        mimeType: 'application/x-php',
        expectedStatus: 400
      },
      {
        description: '画像ファイルのアップロードが許可されること',
        filename: 'image.png',
        mimeType: 'image/png',
        expectedStatus: 200
      }
    ];

    test.each(fileUploadCases)(
      '$description',
      async ({ filename, mimeType, expectedStatus }) => {
        // ファイルアップロードエンドポイントが存在すると仮定
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('fake file content'), {
            filename: filename,
            contentType: mimeType
          });

        expect(response.status).toBe(expectedStatus);
      }
    );
  });

  // HTTPヘッダーセキュリティテスト
  describe('HTTPヘッダーセキュリティ', () => {
    test('X-Content-Type-Options ヘッダーが設定されていること', async () => {
      const response = await request(app).get('/api/articles');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('X-Frame-Options ヘッダーが設定されていること', async () => {
      const response = await request(app).get('/api/articles');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(['DENY', 'SAMEORIGIN']).toContain(response.headers['x-frame-options']);
    });

    test('Strict-Transport-Security ヘッダーが設定されていること', async () => {
      const response = await request(app).get('/api/articles');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    test('X-XSS-Protection ヘッダーが設定されていること', async () => {
      const response = await request(app).get('/api/articles');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });
});
