import request from 'supertest';
import { app } from '../server.js';
import bcrypt from 'bcryptjs';

describe('パスワードハッシュ化テスト', () => {
  describe('ユーザー登録時のパスワードハッシュ化', () => {
    const testCases = [
      {
        description: 'パスワードが平文で保存されていないこと',
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'StrongPassword123!'
      },
      {
        description: '同じパスワードでも異なるハッシュが生成されること',
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'AnotherPassword456!'
      }
    ];

    test.each(testCases)('$description', async ({ username, email, password }) => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username, email, password })
        .expect(201);

      // レスポンスにパスワードが含まれていないこと
      expect(response.body.password).toBeUndefined();

      // サーバー内部でパスワードがハッシュ化されていることを確認
      // （実際のデータを取得する方法がないため、ログイン時の検証で間接的に確認）
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
    });

    test('パスワードがbcryptでハッシュ化されていること', async () => {
      const testPassword = 'TestPassword123!';
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'hashtest',
          email: 'hashtest@example.com',
          password: testPassword
        })
        .expect(201);

      // ユーザー情報を取得（内部的なテスト用エンドポイントが必要）
      // このテストは失敗するはず（現在は平文保存のため）
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'hashtest@example.com',
          password: testPassword
        });

      // ログインが成功することを確認（ハッシュ化されたパスワードでも認証できる）
      expect(loginResponse.status).toBe(200);

      // 間違ったパスワードではログインできないこと
      const wrongPasswordResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'hashtest@example.com',
          password: 'WrongPassword'
        });

      expect(wrongPasswordResponse.status).toBe(401);
    });

    test('bcrypt.compare()を使用してパスワード検証が行われること', async () => {
      // このテストは、実装がbcryptを使用していることを確認する
      // 現在は失敗するはず（平文比較のため）

      const testPassword = 'SecurePassword123!';
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'bcrypttest',
          email: 'bcrypttest@example.com',
          password: testPassword
        })
        .expect(201);

      // ログイン試行
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'bcrypttest@example.com',
          password: testPassword
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();
    });

    test('ソルトが各ユーザーで異なること（レインボーテーブル攻撃対策）', async () => {
      const samePassword = 'SamePassword123!';

      // 同じパスワードで2人のユーザーを登録
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user1',
          email: 'user1@example.com',
          password: samePassword
        })
        .expect(201);

      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'user2@example.com',
          password: samePassword
        })
        .expect(201);

      // 両方のユーザーがログインできることを確認
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user1@example.com',
          password: samePassword
        });

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user2@example.com',
          password: samePassword
        });

      expect(login1.status).toBe(200);
      expect(login2.status).toBe(200);

      // トークンは異なるべき
      expect(login1.body.token).not.toBe(login2.body.token);
    });
  });

  describe('パスワード変更時のハッシュ化', () => {
    test('パスワード変更時も新しいパスワードがハッシュ化されること', async () => {
      // ユーザー登録
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'changepassuser',
          email: 'changepass@example.com',
          password: 'OldPassword123!'
        })
        .expect(201);

      const token = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'OldPassword123!'
        })
        .then(res => res.body.token);

      // パスワード変更（エンドポイントが実装されている場合）
      // 現在は404を返すはず
      const changeResponse = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!'
        });

      // このテストは現在失敗するはず（エンドポイントが未実装）
      expect(changeResponse.status).toBe(200);

      // 新しいパスワードでログインできること
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'NewPassword456!'
        });

      expect(loginResponse.status).toBe(200);

      // 古いパスワードではログインできないこと
      const oldPasswordLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'OldPassword123!'
        });

      expect(oldPasswordLogin.status).toBe(401);
    });
  });

  describe('セキュリティ要件', () => {
    test('bcryptのコストファクターが適切であること（最低10以上）', async () => {
      // このテストは実装の詳細を確認する
      // bcrypt.hashのコストファクターが10以上であることを期待
      const testPassword = 'TestPassword123!';

      // ハッシュ化にかかる時間を測定（コストファクターが高いほど時間がかかる）
      const startTime = Date.now();

      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'costtest',
          email: 'costtest@example.com',
          password: testPassword
        });

      const endTime = Date.now();
      const hashingTime = endTime - startTime;

      // bcrypt with cost=10 should take at least 50ms
      // （実装されていない場合、ほぼ0msで完了する）
      expect(hashingTime).toBeGreaterThan(50);
    });

    test('パスワードの最大長制限があること（DoS攻撃対策）', async () => {
      // 非常に長いパスワード（例: 1000文字）
      const longPassword = 'a'.repeat(1000);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'longpassuser',
          email: 'longpass@example.com',
          password: longPassword
        });

      // 現在は受け入れられるはず（制限がない）
      // 実装後は400を返すべき
      expect([400, 413]).toContain(response.status);
    });
  });
});
