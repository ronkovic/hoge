import request from 'supertest';
import { app } from '../server.js';

describe('Article API Endpoints', () => {
  // テストケースの配列を定義（テーブル駆動テスト風）
  const testCases = [
    {
      method: 'GET',
      endpoint: '/api/articles',
      description: 'すべての記事を取得できること',
      expectedStatus: 200,
      expectedBodyType: 'array'
    },
    {
      method: 'GET',
      endpoint: '/api/articles/1',
      description: '特定の記事を取得できること',
      expectedStatus: 200,
      expectedBodyKeys: ['id', 'user_id', 'title', 'content', 'published', 'created_at', 'updated_at']
    },
    {
      method: 'POST',
      endpoint: '/api/articles',
      description: '新しい記事を作成できること',
      body: {
        user_id: 1,
        title: 'テスト記事',
        content: 'これはテスト記事の本文です。',
        published: false
      },
      expectedStatus: 201,
      expectedBodyKeys: ['id', 'user_id', 'title', 'content', 'published', 'created_at', 'updated_at']
    },
    {
      method: 'PUT',
      endpoint: '/api/articles/1',
      description: '記事を更新できること',
      body: {
        title: '更新された記事タイトル',
        content: '更新された本文です。',
        published: true
      },
      expectedStatus: 200,
      expectedBodyKeys: ['id', 'user_id', 'title', 'content', 'published', 'created_at', 'updated_at']
    },
    {
      method: 'DELETE',
      endpoint: '/api/articles/1',
      description: '記事を削除できること',
      expectedStatus: 200,
      expectedBodyKeys: ['message']
    }
  ];

  // テーブル駆動テストの実装
  test.each(testCases)(
    '$method $endpoint - $description',
    async ({ method, endpoint, body, expectedStatus, expectedBodyType, expectedBodyKeys }) => {
      let response;

      switch (method) {
        case 'GET':
          response = await request(app).get(endpoint);
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

      // レスポンスボディの型検証
      if (expectedBodyType === 'array') {
        expect(Array.isArray(response.body)).toBe(true);
      }

      // レスポンスボディのキー検証
      if (expectedBodyKeys) {
        expectedBodyKeys.forEach(key => {
          expect(response.body).toHaveProperty(key);
        });
      }
    }
  );
});

describe('Article API - ユーザー別記事一覧', () => {
  const userArticlesTestCases = [
    {
      userId: 1,
      description: 'ユーザーID 1 の記事一覧を取得できること',
      expectedStatus: 200,
      expectedBodyType: 'array'
    },
    {
      userId: 2,
      description: 'ユーザーID 2 の記事一覧を取得できること',
      expectedStatus: 200,
      expectedBodyType: 'array'
    }
  ];

  test.each(userArticlesTestCases)(
    'GET /api/articles/user/:userId - $description',
    async ({ userId, expectedStatus, expectedBodyType }) => {
      const response = await request(app).get(`/api/articles/user/${userId}`);

      expect(response.status).toBe(expectedStatus);

      if (expectedBodyType === 'array') {
        expect(Array.isArray(response.body)).toBe(true);
      }

      // 各記事がuser_idを持ち、指定されたuserIdと一致することを確認
      if (response.body.length > 0) {
        response.body.forEach(article => {
          expect(article).toHaveProperty('user_id');
          expect(article.user_id).toBe(userId);
        });
      }
    }
  );
});

describe('Article API - エラーハンドリング', () => {
  const errorCases = [
    {
      method: 'GET',
      endpoint: '/api/articles/999',
      description: '存在しない記事を取得しようとした場合、404を返すこと',
      expectedStatus: 404
    },
    {
      method: 'PUT',
      endpoint: '/api/articles/999',
      description: '存在しない記事を更新しようとした場合、404を返すこと',
      body: { title: '更新', content: '更新内容', published: true },
      expectedStatus: 404
    },
    {
      method: 'DELETE',
      endpoint: '/api/articles/999',
      description: '存在しない記事を削除しようとした場合、404を返すこと',
      expectedStatus: 404
    },
    {
      method: 'POST',
      endpoint: '/api/articles',
      description: 'タイトルなしで作成しようとした場合、400を返すこと',
      body: { content: '本文のみ', published: false },
      expectedStatus: 400
    },
    {
      method: 'POST',
      endpoint: '/api/articles',
      description: '本文なしで作成しようとした場合、400を返すこと',
      body: { title: 'タイトルのみ', published: false },
      expectedStatus: 400
    },
    {
      method: 'POST',
      endpoint: '/api/articles',
      description: 'user_idなしで作成しようとした場合、400を返すこと',
      body: { title: 'タイトル', content: '本文', published: false },
      expectedStatus: 400
    }
  ];

  test.each(errorCases)(
    '$method $endpoint - $description',
    async ({ method, endpoint, body, expectedStatus }) => {
      let response;

      switch (method) {
        case 'GET':
          response = await request(app).get(endpoint);
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

      expect(response.status).toBe(expectedStatus);
      expect(response.body).toHaveProperty('message');
    }
  );
});

describe('Article API - バリデーション', () => {
  const validationCases = [
    {
      description: 'タイトルが200文字を超える場合、400を返すこと',
      body: {
        user_id: 1,
        title: 'a'.repeat(201),
        content: '本文',
        published: false
      },
      expectedStatus: 400
    },
    {
      description: '本文が空文字の場合、400を返すこと',
      body: {
        user_id: 1,
        title: 'タイトル',
        content: '',
        published: false
      },
      expectedStatus: 400
    },
    {
      description: 'publishedがboolean以外の場合、適切に処理されること',
      body: {
        user_id: 1,
        title: 'タイトル',
        content: '本文',
        published: 'invalid'
      },
      expectedStatus: 400
    }
  ];

  test.each(validationCases)(
    'POST /api/articles - $description',
    async ({ body, expectedStatus }) => {
      const response = await request(app).post('/api/articles').send(body);
      expect(response.status).toBe(expectedStatus);
      expect(response.body).toHaveProperty('message');
    }
  );
});

describe('Article API - データ整合性', () => {
  test('作成された記事のcreated_atとupdated_atが設定されていること', async () => {
    const newArticle = {
      user_id: 1,
      title: 'テスト記事',
      content: 'テスト本文',
      published: false
    };

    const response = await request(app).post('/api/articles').send(newArticle);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
    expect(new Date(response.body.created_at)).toBeInstanceOf(Date);
    expect(new Date(response.body.updated_at)).toBeInstanceOf(Date);
  });

  test('記事を更新した際にupdated_atが更新されること', async () => {
    // まず記事を作成
    const newArticle = {
      user_id: 1,
      title: 'テスト記事',
      content: 'テスト本文',
      published: false
    };

    const createResponse = await request(app).post('/api/articles').send(newArticle);
    const articleId = createResponse.body.id;
    const originalUpdatedAt = createResponse.body.updated_at;

    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 100));

    // 記事を更新
    const updateResponse = await request(app)
      .put(`/api/articles/${articleId}`)
      .send({ title: '更新されたタイトル', content: '更新された本文', published: true });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.updated_at).not.toBe(originalUpdatedAt);
    expect(new Date(updateResponse.body.updated_at).getTime()).toBeGreaterThan(
      new Date(originalUpdatedAt).getTime()
    );
  });
});
