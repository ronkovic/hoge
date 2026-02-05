import { pool } from '../db.js';

// テスト終了時にプールを閉じる
afterAll(async () => {
  await pool.end();
});

// 各テスト後にテーブルをクリーンアップ
afterEach(async () => {
  await pool.query('TRUNCATE TABLE comments, posts, users RESTART IDENTITY CASCADE');
});

describe('Database Connection', () => {
  // データベース接続のテストケース
  const connectionTestCases = [
    {
      description: 'データベースに接続できること',
      testFn: async () => {
        const client = await pool.connect();
        expect(client).toBeDefined();
        client.release();
      }
    },
    {
      description: 'データベースからクエリ結果を取得できること',
      testFn: async () => {
        const result = await pool.query('SELECT 1 as test');
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].test).toBe(1);
      }
    }
  ];

  test.each(connectionTestCases)(
    '$description',
    async ({ testFn }) => {
      await testFn();
    }
  );
});

describe('User Model', () => {
  // Userモデルが存在しないため、このテストは失敗する
  let UserModel;

  beforeAll(async () => {
    try {
      const module = await import('../models/User.js');
      UserModel = module.default || module.User;
    } catch (error) {
      UserModel = null;
    }
  });

  const userModelTestCases = [
    {
      operation: 'create',
      description: 'ユーザーを作成できること',
      input: { name: 'Test User', email: 'test@example.com' },
      expectedKeys: ['id', 'name', 'email', 'created_at']
    },
    {
      operation: 'findAll',
      description: '全てのユーザーを取得できること',
      expectedType: 'array'
    },
    {
      operation: 'findById',
      description: 'IDでユーザーを取得できること',
      input: { id: 1 },
      expectedKeys: ['id', 'name', 'email', 'created_at']
    },
    {
      operation: 'update',
      description: 'ユーザー情報を更新できること',
      input: { id: 1, name: 'Updated User', email: 'updated@example.com' },
      expectedKeys: ['id', 'name', 'email', 'created_at']
    },
    {
      operation: 'delete',
      description: 'ユーザーを削除できること',
      input: { id: 1 },
      expectedResult: true
    }
  ];

  test.each(userModelTestCases)(
    '$operation - $description',
    async ({ operation, input, expectedKeys, expectedType, expectedResult }) => {
      expect(UserModel).not.toBeNull();
      expect(UserModel[operation]).toBeDefined();

      let actualInput = input;
      // IDが必要な操作の場合、テスト用データを作成
      if (operation !== 'create' && operation !== 'findAll' && input && input.id) {
        const createResult = await UserModel.create({ name: 'Test User', email: 'testuser@example.com' });
        actualInput = { ...input, id: createResult.id };
      }

      let result;
      if (actualInput) {
        result = await UserModel[operation](actualInput);
      } else {
        result = await UserModel[operation]();
      }

      if (expectedKeys) {
        expectedKeys.forEach(key => {
          expect(result).toHaveProperty(key);
        });
      }

      if (expectedType === 'array') {
        expect(Array.isArray(result)).toBe(true);
      }

      if (expectedResult !== undefined) {
        expect(result).toBe(expectedResult);
      }
    }
  );
});

describe('Post Model', () => {
  // Postモデルが存在しないため、このテストは失敗する
  let PostModel;
  let testUserId;

  beforeAll(async () => {
    try {
      const module = await import('../models/Post.js');
      PostModel = module.default || module.Post;
    } catch (error) {
      PostModel = null;
    }
  });

  beforeEach(async () => {
    // テスト用ユーザーを作成
    const userResult = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
      ['Test User', 'test@example.com']
    );
    testUserId = userResult.rows[0].id;
  });

  const getPostModelTestCases = () => [
    {
      operation: 'create',
      description: '投稿を作成できること',
      inputFn: () => ({ user_id: testUserId, title: 'Test Post', content: 'Test content' }),
      expectedKeys: ['id', 'user_id', 'title', 'content', 'created_at']
    },
    {
      operation: 'findAll',
      description: '全ての投稿を取得できること',
      expectedType: 'array'
    },
    {
      operation: 'findById',
      description: 'IDで投稿を取得できること',
      input: { id: 1 },
      expectedKeys: ['id', 'user_id', 'title', 'content', 'created_at']
    },
    {
      operation: 'findByUserId',
      description: 'ユーザーIDで投稿を取得できること',
      input: { user_id: testUserId },
      expectedType: 'array'
    },
    {
      operation: 'update',
      description: '投稿を更新できること',
      input: { id: 1, title: 'Updated Post', content: 'Updated content' },
      expectedKeys: ['id', 'user_id', 'title', 'content', 'created_at']
    },
    {
      operation: 'delete',
      description: '投稿を削除できること',
      input: { id: 1 },
      expectedResult: true
    }
  ];

  test.each(getPostModelTestCases())(
    '$operation - $description',
    async ({ operation, input, inputFn, expectedKeys, expectedType, expectedResult }) => {
      expect(PostModel).not.toBeNull();
      expect(PostModel[operation]).toBeDefined();

      let actualInput = inputFn ? inputFn() : input;
      // IDが必要な操作の場合、テスト用データを作成
      if (operation !== 'create' && operation !== 'findAll' && operation !== 'findByUserId' && actualInput && actualInput.id) {
        const createResult = await PostModel.create({ user_id: testUserId, title: 'Test Post', content: 'Test content' });
        actualInput = { ...actualInput, id: createResult.id };
      }

      let result;
      if (actualInput) {
        result = await PostModel[operation](actualInput);
      } else {
        result = await PostModel[operation]();
      }

      if (expectedKeys) {
        expectedKeys.forEach(key => {
          expect(result).toHaveProperty(key);
        });
      }

      if (expectedType === 'array') {
        expect(Array.isArray(result)).toBe(true);
      }

      if (expectedResult !== undefined) {
        expect(result).toBe(expectedResult);
      }
    }
  );
});

describe('Comment Model', () => {
  // Commentモデルが存在しないため、このテストは失敗する
  let CommentModel;
  let testUserId;
  let testPostId;

  beforeAll(async () => {
    try {
      const module = await import('../models/Comment.js');
      CommentModel = module.default || module.Comment;
    } catch (error) {
      CommentModel = null;
    }
  });

  beforeEach(async () => {
    // テスト用ユーザーを作成
    const userResult = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
      ['Test User', 'test@example.com']
    );
    testUserId = userResult.rows[0].id;

    // テスト用投稿を作成
    const postResult = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING id',
      [testUserId, 'Test Post', 'Test content']
    );
    testPostId = postResult.rows[0].id;
  });

  const getCommentModelTestCases = () => [
    {
      operation: 'create',
      description: 'コメントを作成できること',
      inputFn: () => ({ post_id: testPostId, user_id: testUserId, content: 'Test comment' }),
      expectedKeys: ['id', 'post_id', 'user_id', 'content', 'created_at']
    },
    {
      operation: 'findAll',
      description: '全てのコメントを取得できること',
      expectedType: 'array'
    },
    {
      operation: 'findById',
      description: 'IDでコメントを取得できること',
      input: { id: 1 },
      expectedKeys: ['id', 'post_id', 'user_id', 'content', 'created_at']
    },
    {
      operation: 'findByPostId',
      description: '投稿IDでコメントを取得できること',
      input: { post_id: testPostId },
      expectedType: 'array'
    },
    {
      operation: 'findByUserId',
      description: 'ユーザーIDでコメントを取得できること',
      input: { user_id: testUserId },
      expectedType: 'array'
    },
    {
      operation: 'update',
      description: 'コメントを更新できること',
      input: { id: 1, content: 'Updated comment' },
      expectedKeys: ['id', 'post_id', 'user_id', 'content', 'created_at']
    },
    {
      operation: 'delete',
      description: 'コメントを削除できること',
      input: { id: 1 },
      expectedResult: true
    }
  ];

  test.each(getCommentModelTestCases())(
    '$operation - $description',
    async ({ operation, input, inputFn, expectedKeys, expectedType, expectedResult }) => {
      expect(CommentModel).not.toBeNull();
      expect(CommentModel[operation]).toBeDefined();

      let actualInput = inputFn ? inputFn() : input;
      // IDが必要な操作の場合、テスト用データを作成
      if (operation !== 'create' && operation !== 'findAll' && operation !== 'findByPostId' && operation !== 'findByUserId' && actualInput && actualInput.id) {
        const createResult = await CommentModel.create({ post_id: testPostId, user_id: testUserId, content: 'Test comment' });
        actualInput = { ...actualInput, id: createResult.id };
      }

      let result;
      if (actualInput) {
        result = await CommentModel[operation](actualInput);
      } else {
        result = await CommentModel[operation]();
      }

      if (expectedKeys) {
        expectedKeys.forEach(key => {
          expect(result).toHaveProperty(key);
        });
      }

      if (expectedType === 'array') {
        expect(Array.isArray(result)).toBe(true);
      }

      if (expectedResult !== undefined) {
        expect(result).toBe(expectedResult);
      }
    }
  );
});
