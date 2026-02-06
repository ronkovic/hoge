import request from 'supertest';
import { app, resetComments } from '../server.js';

describe('統合テスト: エンドツーエンドフロー', () => {
  beforeEach(() => {
    resetComments();
  });

  // 統合テストケース（テーブル駆動）
  const integrationTestCases = [
    {
      description: 'ユーザー登録→ログイン→記事作成→記事取得の完全フロー',
      steps: [
        {
          name: 'ユーザー登録',
          method: 'POST',
          endpoint: '/api/auth/register',
          body: {
            username: 'integration_user',
            email: 'integration@example.com',
            password: 'StrongP@ss123'
          },
          expectedStatus: 201,
          expectedKeys: ['id', 'username', 'email']
        },
        {
          name: 'ログイン',
          method: 'POST',
          endpoint: '/api/auth/login',
          body: {
            email: 'integration@example.com',
            password: 'StrongP@ss123'
          },
          expectedStatus: 200,
          expectedKeys: ['token', 'user'],
          saveToken: true
        },
        {
          name: '記事作成',
          method: 'POST',
          endpoint: '/api/articles',
          body: {
            user_id: 1,
            title: '統合テスト記事',
            content: 'これは統合テストの記事です。',
            published: true
          },
          expectedStatus: 201,
          expectedKeys: ['id', 'title', 'content'],
          saveArticleId: true
        },
        {
          name: '作成した記事を取得',
          method: 'GET',
          endpoint: '/api/articles/:articleId',
          expectedStatus: 200,
          expectedKeys: ['id', 'title', 'content', 'published'],
          validateTitle: '統合テスト記事'
        }
      ]
    },
    {
      description: 'ユーザー登録→ログイン→コメント作成→コメント取得の完全フロー',
      steps: [
        {
          name: 'ユーザー登録',
          method: 'POST',
          endpoint: '/api/auth/register',
          body: {
            username: 'comment_user',
            email: 'comment@example.com',
            password: 'StrongP@ss123'
          },
          expectedStatus: 201
        },
        {
          name: 'ログイン',
          method: 'POST',
          endpoint: '/api/auth/login',
          body: {
            email: 'comment@example.com',
            password: 'StrongP@ss123'
          },
          expectedStatus: 200,
          saveToken: true
        },
        {
          name: 'コメント作成',
          method: 'POST',
          endpoint: '/comments',
          body: {
            content: '統合テストコメント',
            author: 'comment_user'
          },
          expectedStatus: 201,
          saveCommentId: true
        },
        {
          name: '作成したコメントを取得',
          method: 'GET',
          endpoint: '/comments/:commentId',
          expectedStatus: 200,
          validateContent: '統合テストコメント'
        }
      ]
    }
  ];

  test.each(integrationTestCases)(
    '$description',
    async ({ steps }) => {
      let token = null;
      let articleId = null;
      let commentId = null;

      for (const step of steps) {
        let response;
        let endpoint = step.endpoint;

        // 動的にエンドポイントを置換
        if (endpoint.includes(':articleId')) {
          endpoint = endpoint.replace(':articleId', articleId);
        }
        if (endpoint.includes(':commentId')) {
          endpoint = endpoint.replace(':commentId', commentId);
        }

        // リクエスト実行
        switch (step.method) {
          case 'GET':
            response = await request(app)
              .get(endpoint)
              .set('Authorization', token ? `Bearer ${token}` : '');
            break;
          case 'POST':
            response = await request(app)
              .post(endpoint)
              .send(step.body)
              .set('Authorization', token ? `Bearer ${token}` : '');
            break;
          case 'PUT':
            response = await request(app)
              .put(endpoint)
              .send(step.body)
              .set('Authorization', token ? `Bearer ${token}` : '');
            break;
          case 'DELETE':
            response = await request(app)
              .delete(endpoint)
              .set('Authorization', token ? `Bearer ${token}` : '');
            break;
        }

        // ステータスコード検証
        expect(response.status).toBe(step.expectedStatus);

        // キー検証
        if (step.expectedKeys) {
          step.expectedKeys.forEach(key => {
            expect(response.body).toHaveProperty(key);
          });
        }

        // トークンを保存
        if (step.saveToken) {
          token = response.body.token;
          expect(token).toBeDefined();
        }

        // 記事IDを保存
        if (step.saveArticleId) {
          articleId = response.body.id;
          expect(articleId).toBeDefined();
        }

        // コメントIDを保存
        if (step.saveCommentId) {
          commentId = response.body.id;
          expect(commentId).toBeDefined();
        }

        // タイトル検証
        if (step.validateTitle) {
          expect(response.body.title).toBe(step.validateTitle);
        }

        // コンテンツ検証
        if (step.validateContent) {
          expect(response.body.content).toBe(step.validateContent);
        }
      }
    }
  );

  // 複雑な統合フロー: 記事作成→複数コメント追加→削除
  test('記事作成→複数コメント追加→コメント削除→記事削除の複雑フロー', async () => {
    // 1. ユーザー登録
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'complex_user',
        email: 'complex@example.com',
        password: 'StrongP@ss123'
      });

    expect(registerResponse.status).toBe(201);
    const userId = registerResponse.body.id;

    // 2. ログイン
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'complex@example.com',
        password: 'StrongP@ss123'
      });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token;

    // 3. 記事作成
    const articleResponse = await request(app)
      .post('/api/articles')
      .send({
        user_id: userId,
        title: '複雑フローテスト記事',
        content: 'これは複雑なフローのテストです。',
        published: true
      });

    expect(articleResponse.status).toBe(201);
    const articleId = articleResponse.body.id;

    // 4. 複数のコメントを作成
    const comment1Response = await request(app)
      .post('/comments')
      .send({
        content: '最初のコメント',
        author: 'complex_user'
      });

    expect(comment1Response.status).toBe(201);
    const comment1Id = comment1Response.body.id;

    const comment2Response = await request(app)
      .post('/comments')
      .send({
        content: '2番目のコメント',
        author: 'complex_user'
      });

    expect(comment2Response.status).toBe(201);
    const comment2Id = comment2Response.body.id;

    // 5. コメント一覧を取得して検証
    const commentsListResponse = await request(app).get('/comments');
    expect(commentsListResponse.status).toBe(200);
    expect(commentsListResponse.body.length).toBeGreaterThanOrEqual(2);

    // 6. コメントを削除
    const deleteComment1Response = await request(app).delete(`/comments/${comment1Id}`);
    expect(deleteComment1Response.status).toBe(200);

    // 7. 削除されたコメントが取得できないことを確認
    const getDeletedCommentResponse = await request(app).get(`/comments/${comment1Id}`);
    expect(getDeletedCommentResponse.status).toBe(404);

    // 8. 記事を削除
    const deleteArticleResponse = await request(app).delete(`/api/articles/${articleId}`);
    expect(deleteArticleResponse.status).toBe(200);

    // 9. 削除された記事が取得できないことを確認
    const getDeletedArticleResponse = await request(app).get(`/api/articles/${articleId}`);
    expect(getDeletedArticleResponse.status).toBe(404);

    // 10. ログアウト
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(logoutResponse.status).toBe(200);
  });

  // 複数ユーザーの並行操作テスト
  test('複数ユーザーが同時に記事とコメントを作成できること', async () => {
    // ユーザー1の登録とログイン
    const user1RegisterResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user1',
        email: 'user1@example.com',
        password: 'StrongP@ss123'
      });

    expect(user1RegisterResponse.status).toBe(201);

    const user1LoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user1@example.com',
        password: 'StrongP@ss123'
      });

    const user1Token = user1LoginResponse.body.token;

    // ユーザー2の登録とログイン
    const user2RegisterResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user2',
        email: 'user2@example.com',
        password: 'StrongP@ss123'
      });

    expect(user2RegisterResponse.status).toBe(201);

    const user2LoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user2@example.com',
        password: 'StrongP@ss123'
      });

    const user2Token = user2LoginResponse.body.token;

    // ユーザー1が記事を作成
    const user1ArticleResponse = await request(app)
      .post('/api/articles')
      .send({
        user_id: user1RegisterResponse.body.id,
        title: 'ユーザー1の記事',
        content: 'ユーザー1が作成した記事です。',
        published: true
      });

    expect(user1ArticleResponse.status).toBe(201);

    // ユーザー2が記事を作成
    const user2ArticleResponse = await request(app)
      .post('/api/articles')
      .send({
        user_id: user2RegisterResponse.body.id,
        title: 'ユーザー2の記事',
        content: 'ユーザー2が作成した記事です。',
        published: true
      });

    expect(user2ArticleResponse.status).toBe(201);

    // ユーザー1がコメントを作成
    const user1CommentResponse = await request(app)
      .post('/comments')
      .send({
        content: 'ユーザー1のコメント',
        author: 'user1'
      });

    expect(user1CommentResponse.status).toBe(201);

    // ユーザー2がコメントを作成
    const user2CommentResponse = await request(app)
      .post('/comments')
      .send({
        content: 'ユーザー2のコメント',
        author: 'user2'
      });

    expect(user2CommentResponse.status).toBe(201);

    // 全記事を取得して検証
    const allArticlesResponse = await request(app).get('/api/articles');
    expect(allArticlesResponse.status).toBe(200);
    expect(allArticlesResponse.body.length).toBeGreaterThanOrEqual(2);

    // 全コメントを取得して検証
    const allCommentsResponse = await request(app).get('/comments');
    expect(allCommentsResponse.status).toBe(200);
    expect(allCommentsResponse.body.length).toBeGreaterThanOrEqual(2);
  });
});
