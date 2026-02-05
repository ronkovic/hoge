import request from 'supertest';
import { app } from '../server.js';

describe('Comments API Endpoints', () => {
  // テストケースの配列を定義（テーブル駆動テスト）
  const testCases = [
    {
      method: 'GET',
      endpoint: '/comments',
      description: 'すべてのコメントを取得できること',
      expectedStatus: 200,
      expectedBodyType: 'array'
    },
    {
      method: 'GET',
      endpoint: '/comments/1',
      description: '特定のコメントを取得できること',
      expectedStatus: 200,
      expectedBodyKeys: ['id', 'content', 'author', 'createdAt']
    },
    {
      method: 'POST',
      endpoint: '/comments',
      description: '新しいコメントを作成できること',
      body: { content: 'Test comment', author: 'Test User' },
      expectedStatus: 201,
      expectedBodyKeys: ['id', 'content', 'author', 'createdAt']
    },
    {
      method: 'DELETE',
      endpoint: '/comments/1',
      description: 'コメントを削除できること',
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

describe('Comments API - バリデーション', () => {
  const validationCases = [
    {
      method: 'POST',
      endpoint: '/comments',
      description: 'contentが空の場合、400を返すこと',
      body: { author: 'Test User' },
      expectedStatus: 400,
      expectedErrorMessage: 'Content is required'
    },
    {
      method: 'POST',
      endpoint: '/comments',
      description: 'authorが空の場合、400を返すこと',
      body: { content: 'Test comment' },
      expectedStatus: 400,
      expectedErrorMessage: 'Author is required'
    },
    {
      method: 'POST',
      endpoint: '/comments',
      description: 'contentが500文字を超える場合、400を返すこと',
      body: {
        content: 'a'.repeat(501),
        author: 'Test User'
      },
      expectedStatus: 400,
      expectedErrorMessage: 'Content must be less than 500 characters'
    }
  ];

  test.each(validationCases)(
    '$method $endpoint - $description',
    async ({ method, endpoint, body, expectedStatus, expectedErrorMessage }) => {
      let response;

      switch (method) {
        case 'POST':
          response = await request(app).post(endpoint).send(body);
          break;
      }

      expect(response.status).toBe(expectedStatus);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe(expectedErrorMessage);
    }
  );
});

describe('Comments API - エラーハンドリング', () => {
  const errorCases = [
    {
      method: 'GET',
      endpoint: '/comments/999',
      description: '存在しないコメントを取得しようとした場合、404を返すこと',
      expectedStatus: 404,
      expectedErrorMessage: 'Comment not found'
    },
    {
      method: 'DELETE',
      endpoint: '/comments/999',
      description: '存在しないコメントを削除しようとした場合、404を返すこと',
      expectedStatus: 404,
      expectedErrorMessage: 'Comment not found'
    },
    {
      method: 'GET',
      endpoint: '/comments/invalid',
      description: '無効なIDでコメントを取得しようとした場合、400を返すこと',
      expectedStatus: 400,
      expectedErrorMessage: 'Invalid comment ID'
    },
    {
      method: 'DELETE',
      endpoint: '/comments/invalid',
      description: '無効なIDでコメントを削除しようとした場合、400を返すこと',
      expectedStatus: 400,
      expectedErrorMessage: 'Invalid comment ID'
    }
  ];

  test.each(errorCases)(
    '$method $endpoint - $description',
    async ({ method, endpoint, expectedStatus, expectedErrorMessage }) => {
      let response;

      switch (method) {
        case 'GET':
          response = await request(app).get(endpoint);
          break;
        case 'DELETE':
          response = await request(app).delete(endpoint);
          break;
      }

      expect(response.status).toBe(expectedStatus);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe(expectedErrorMessage);
    }
  );
});

describe('Comments API - データ整合性', () => {
  test('作成されたコメントがcreatedAtタイムスタンプを持つこと', async () => {
    const response = await request(app)
      .post('/comments')
      .send({ content: 'Test comment', author: 'Test User' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('createdAt');
    expect(new Date(response.body.createdAt)).toBeInstanceOf(Date);
  });

  test('コメント一覧が作成日時の降順でソートされていること', async () => {
    // 複数のコメントを作成
    await request(app)
      .post('/comments')
      .send({ content: 'First comment', author: 'User 1' });

    await request(app)
      .post('/comments')
      .send({ content: 'Second comment', author: 'User 2' });

    const response = await request(app).get('/comments');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length >= 2) {
      const firstDate = new Date(response.body[0].createdAt);
      const secondDate = new Date(response.body[1].createdAt);
      expect(firstDate >= secondDate).toBe(true);
    }
  });

  test('削除されたコメントは一覧に表示されないこと', async () => {
    // コメントを作成
    const createResponse = await request(app)
      .post('/comments')
      .send({ content: 'To be deleted', author: 'Test User' });

    const commentId = createResponse.body.id;

    // コメントを削除
    await request(app).delete(`/comments/${commentId}`);

    // 一覧を取得
    const listResponse = await request(app).get('/comments');

    expect(listResponse.status).toBe(200);
    const deletedComment = listResponse.body.find(c => c.id === commentId);
    expect(deletedComment).toBeUndefined();
  });
});
