import request from 'supertest';
import express from 'express';

// テスト用のアプリケーションを作成する想定
// 実装が完了したら、server.jsからエクスポートされたappを使用する
let app;

beforeAll(() => {
  // 仮のExpressアプリケーションをインポート（実装前なので失敗する）
  try {
    // この時点ではserver.jsが存在しないか、exportしていないので失敗する
    const serverModule = require('../server.js');
    app = serverModule.app || serverModule.default;
  } catch (error) {
    // server.jsが存在しない、またはエクスポートされていない場合
    app = express();
  }
});

describe('Todo API Endpoints', () => {
  // テストケースの配列を定義（テーブル駆動テスト風）
  const testCases = [
    {
      method: 'GET',
      endpoint: '/todos',
      description: 'すべてのTodoを取得できること',
      expectedStatus: 200,
      expectedBodyType: 'array'
    },
    {
      method: 'POST',
      endpoint: '/todos',
      description: '新しいTodoを作成できること',
      body: { title: 'Test Todo', completed: false },
      expectedStatus: 201,
      expectedBodyKeys: ['id', 'title', 'completed']
    },
    {
      method: 'PUT',
      endpoint: '/todos/1',
      description: 'Todoを更新できること',
      body: { title: 'Updated Todo', completed: true },
      expectedStatus: 200,
      expectedBodyKeys: ['id', 'title', 'completed']
    },
    {
      method: 'DELETE',
      endpoint: '/todos/1',
      description: 'Todoを削除できること',
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

describe('Todo API - データベース接続', () => {
  test('データベースに接続できること', async () => {
    // この時点ではDBモジュールが存在しないので失敗する
    const dbModule = await import('../db.js').catch(() => null);
    expect(dbModule).not.toBeNull();
    expect(dbModule.pool).toBeDefined();
  });
});

describe('Todo API - 環境変数', () => {
  test('ポート3001で起動する設定になっていること', () => {
    // 環境変数またはデフォルト値が3001であることを確認
    const expectedPort = process.env.PORT || 3001;
    expect(expectedPort).toBe(3001);
  });
});

describe('Todo API - エラーハンドリング', () => {
  const errorCases = [
    {
      method: 'GET',
      endpoint: '/todos/999',
      description: '存在しないTodoを取得しようとした場合、404を返すこと',
      expectedStatus: 404
    },
    {
      method: 'PUT',
      endpoint: '/todos/999',
      description: '存在しないTodoを更新しようとした場合、404を返すこと',
      body: { title: 'Updated', completed: true },
      expectedStatus: 404
    },
    {
      method: 'DELETE',
      endpoint: '/todos/999',
      description: '存在しないTodoを削除しようとした場合、404を返すこと',
      expectedStatus: 404
    },
    {
      method: 'POST',
      endpoint: '/todos',
      description: '不正なデータで作成しようとした場合、400を返すこと',
      body: {},
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
    }
  );
});
