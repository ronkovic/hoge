import {
  hashPassword,
  comparePassword,
  generateSalt,
  validatePasswordStrength
} from '../../utils/password.js';

describe('パスワードハッシュ化ユーティリティ - ハッシュ生成', () => {
  // テストケースの配列（テーブル駆動テスト）
  const hashCases = [
    {
      description: 'パスワードをハッシュ化できること',
      password: 'MySecurePassword123!',
      shouldSucceed: true
    },
    {
      description: '同じパスワードでも毎回異なるハッシュを生成すること',
      password: 'SamePassword',
      shouldSucceed: true,
      checkUniqueness: true
    },
    {
      description: '空のパスワードでエラーを返すこと',
      password: '',
      shouldSucceed: false,
      expectedError: 'Password cannot be empty'
    },
    {
      description: 'nullパスワードでエラーを返すこと',
      password: null,
      shouldSucceed: false,
      expectedError: 'Password is required'
    }
  ];

  test.each(hashCases)(
    '$description',
    async ({ password, shouldSucceed, expectedError, checkUniqueness }) => {
      if (shouldSucceed) {
        const hash = await hashPassword(password);
        expect(hash).toBeDefined();
        expect(typeof hash).toBe('string');
        expect(hash).not.toBe(password); // 平文とは異なること
        expect(hash.length).toBeGreaterThan(0);

        if (checkUniqueness) {
          const hash2 = await hashPassword(password);
          expect(hash).not.toBe(hash2); // ソルトが異なるため、ハッシュも異なる
        }
      } else {
        await expect(hashPassword(password)).rejects.toThrow(expectedError);
      }
    }
  );
});

describe('パスワードハッシュ化ユーティリティ - パスワード比較', () => {
  const compareCases = [
    {
      description: '正しいパスワードで検証が成功すること',
      password: 'CorrectPassword123!',
      inputPassword: 'CorrectPassword123!',
      shouldMatch: true
    },
    {
      description: '誤ったパスワードで検証が失敗すること',
      password: 'CorrectPassword123!',
      inputPassword: 'WrongPassword',
      shouldMatch: false
    },
    {
      description: '大文字小文字を区別すること',
      password: 'Password',
      inputPassword: 'password',
      shouldMatch: false
    },
    {
      description: '空白の有無を区別すること',
      password: 'Password',
      inputPassword: 'Password ',
      shouldMatch: false
    }
  ];

  test.each(compareCases)(
    '$description',
    async ({ password, inputPassword, shouldMatch }) => {
      // まずパスワードをハッシュ化
      const hash = await hashPassword(password);

      // ハッシュと入力パスワードを比較
      const result = await comparePassword(inputPassword, hash);
      expect(result).toBe(shouldMatch);
    }
  );
});

describe('パスワードハッシュ化ユーティリティ - ソルト生成', () => {
  test('ソルトを生成できること', () => {
    const salt = generateSalt();
    expect(salt).toBeDefined();
    expect(typeof salt).toBe('string');
    expect(salt.length).toBeGreaterThan(0);
  });

  test('毎回異なるソルトを生成すること', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    const salt3 = generateSalt();

    expect(salt1).not.toBe(salt2);
    expect(salt2).not.toBe(salt3);
    expect(salt1).not.toBe(salt3);
  });

  test('指定された長さのソルトを生成すること', () => {
    const lengths = [16, 32, 64];

    lengths.forEach(length => {
      const salt = generateSalt(length);
      // Base64エンコード後の長さは元の長さの約1.33倍
      expect(salt.length).toBeGreaterThanOrEqual(length);
    });
  });
});

describe('パスワードハッシュ化ユーティリティ - 強度検証', () => {
  const strengthCases = [
    {
      description: '弱いパスワードを検出すること',
      password: '123456',
      expectedStrength: 'weak',
      shouldPass: false
    },
    {
      description: '中程度のパスワードを検出すること',
      password: 'Password123',
      expectedStrength: 'medium',
      shouldPass: true
    },
    {
      description: '強いパスワードを検出すること',
      password: 'StrongP@ssw0rd!',
      expectedStrength: 'strong',
      shouldPass: true
    },
    {
      description: '非常に強いパスワードを検出すること',
      password: 'V3ry$tr0ng&C0mpl3x!P@ssw0rd',
      expectedStrength: 'very_strong',
      shouldPass: true
    },
    {
      description: '一般的なパスワードを拒否すること',
      password: 'password',
      expectedStrength: 'weak',
      shouldPass: false,
      isCommon: true
    },
    {
      description: '一般的なパスワード(qwerty)を拒否すること',
      password: 'qwerty',
      expectedStrength: 'weak',
      shouldPass: false,
      isCommon: true
    }
  ];

  test.each(strengthCases)(
    '$description',
    ({ password, expectedStrength, shouldPass, isCommon }) => {
      const result = validatePasswordStrength(password);

      expect(result.strength).toBe(expectedStrength);
      expect(result.isStrong).toBe(shouldPass);

      if (isCommon) {
        expect(result.isCommon).toBe(true);
        expect(result.warnings).toContain('This is a commonly used password');
      }
    }
  );
});

describe('パスワードハッシュ化ユーティリティ - ハッシュアルゴリズム', () => {
  const algorithmCases = [
    {
      description: 'bcryptアルゴリズムを使用すること',
      algorithm: 'bcrypt',
      shouldSupport: true
    },
    {
      description: 'argon2アルゴリズムを使用できること',
      algorithm: 'argon2',
      shouldSupport: true
    },
    {
      description: 'デフォルトでbcryptを使用すること',
      algorithm: undefined,
      expectedDefault: 'bcrypt'
    }
  ];

  test.each(algorithmCases)(
    '$description',
    async ({ algorithm, shouldSupport, expectedDefault }) => {
      const password = 'TestPassword123!';

      if (expectedDefault) {
        const hash = await hashPassword(password);
        // bcryptハッシュは$2a$, $2b$, $2y$で始まる
        expect(hash).toMatch(/^\$2[aby]\$/);
      } else if (shouldSupport) {
        const hash = await hashPassword(password, { algorithm });
        expect(hash).toBeDefined();
        expect(typeof hash).toBe('string');
      }
    }
  );
});

describe('パスワードハッシュ化ユーティリティ - コスト係数', () => {
  test('コスト係数を指定できること', async () => {
    const password = 'TestPassword123!';
    const rounds = 12;

    const hash = await hashPassword(password, { rounds });
    expect(hash).toBeDefined();

    // bcryptのハッシュからラウンド数を確認
    // bcryptハッシュ形式: $2a$rounds$salt+hash
    const hashRounds = parseInt(hash.split('$')[2]);
    expect(hashRounds).toBe(rounds);
  });

  test('デフォルトのコスト係数は10であること', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);

    const hashRounds = parseInt(hash.split('$')[2]);
    expect(hashRounds).toBe(10);
  });
});

describe('パスワードハッシュ化ユーティリティ - エラーハンドリング', () => {
  const errorCases = [
    {
      description: '無効なハッシュで比較がエラーになること',
      hash: 'invalid-hash-format',
      password: 'anyPassword',
      shouldThrow: true
    },
    {
      description: 'nullハッシュで比較がエラーになること',
      hash: null,
      password: 'anyPassword',
      shouldThrow: true
    },
    {
      description: '空文字列ハッシュで比較がエラーになること',
      hash: '',
      password: 'anyPassword',
      shouldThrow: true
    }
  ];

  test.each(errorCases)(
    '$description',
    async ({ hash, password, shouldThrow }) => {
      if (shouldThrow) {
        await expect(comparePassword(password, hash)).rejects.toThrow();
      }
    }
  );
});
