import { pool } from '../db.js';

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

      let result;
      if (input) {
        result = await UserModel[operation](input);
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

  beforeAll(async () => {
    try {
      const module = await import('../models/Post.js');
      PostModel = module.default || module.Post;
    } catch (error) {
      PostModel = null;
    }
  });

  const postModelTestCases = [
    {
      operation: 'create',
      description: '投稿を作成できること',
      input: { user_id: 1, title: 'Test Post', content: 'Test content' },
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
      input: { user_id: 1 },
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

  test.each(postModelTestCases)(
    '$operation - $description',
    async ({ operation, input, expectedKeys, expectedType, expectedResult }) => {
      expect(PostModel).not.toBeNull();
      expect(PostModel[operation]).toBeDefined();

      let result;
      if (input) {
        result = await PostModel[operation](input);
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

  beforeAll(async () => {
    try {
      const module = await import('../models/Comment.js');
      CommentModel = module.default || module.Comment;
    } catch (error) {
      CommentModel = null;
    }
  });

  const commentModelTestCases = [
    {
      operation: 'create',
      description: 'コメントを作成できること',
      input: { post_id: 1, user_id: 1, content: 'Test comment' },
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
      input: { post_id: 1 },
      expectedType: 'array'
    },
    {
      operation: 'findByUserId',
      description: 'ユーザーIDでコメントを取得できること',
      input: { user_id: 1 },
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

  test.each(commentModelTestCases)(
    '$operation - $description',
    async ({ operation, input, expectedKeys, expectedType, expectedResult }) => {
      expect(CommentModel).not.toBeNull();
      expect(CommentModel[operation]).toBeDefined();

      let result;
      if (input) {
        result = await CommentModel[operation](input);
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
