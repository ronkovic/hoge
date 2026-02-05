import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateLength,
  sanitizeInput
} from '../../utils/validator.js';

describe('バリデーションヘルパー - Email検証', () => {
  // テストケースの配列（テーブル駆動テスト）
  const emailCases = [
    {
      description: '有効なメールアドレスを受け入れること',
      email: 'user@example.com',
      isValid: true
    },
    {
      description: 'サブドメイン付きメールアドレスを受け入れること',
      email: 'user@mail.example.com',
      isValid: true
    },
    {
      description: 'プラス記号を含むメールアドレスを受け入れること',
      email: 'user+tag@example.com',
      isValid: true
    },
    {
      description: '無効な形式を拒否すること - @が無い',
      email: 'userexample.com',
      isValid: false
    },
    {
      description: '無効な形式を拒否すること - ドメインが無い',
      email: 'user@',
      isValid: false
    },
    {
      description: '無効な形式を拒否すること - ローカル部が無い',
      email: '@example.com',
      isValid: false
    },
    {
      description: '空文字列を拒否すること',
      email: '',
      isValid: false
    },
    {
      description: 'nullを拒否すること',
      email: null,
      isValid: false
    },
    {
      description: 'undefinedを拒否すること',
      email: undefined,
      isValid: false
    }
  ];

  test.each(emailCases)(
    '$description',
    ({ email, isValid }) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(isValid);

      if (!isValid) {
        expect(result.error).toBeDefined();
      }
    }
  );
});

describe('バリデーションヘルパー - パスワード検証', () => {
  const passwordCases = [
    {
      description: '有効なパスワードを受け入れること（8文字以上）',
      password: 'Password123!',
      minLength: 8,
      isValid: true
    },
    {
      description: '最小長より短いパスワードを拒否すること',
      password: 'Pass1!',
      minLength: 8,
      isValid: false,
      expectedError: 'Password must be at least 8 characters'
    },
    {
      description: '大文字を含まないパスワードを拒否すること（要求時）',
      password: 'password123!',
      requireUppercase: true,
      isValid: false,
      expectedError: 'Password must contain uppercase letter'
    },
    {
      description: '小文字を含まないパスワードを拒否すること（要求時）',
      password: 'PASSWORD123!',
      requireLowercase: true,
      isValid: false,
      expectedError: 'Password must contain lowercase letter'
    },
    {
      description: '数字を含まないパスワードを拒否すること（要求時）',
      password: 'Password!',
      requireNumber: true,
      isValid: false,
      expectedError: 'Password must contain number'
    },
    {
      description: '特殊文字を含まないパスワードを拒否すること（要求時）',
      password: 'Password123',
      requireSpecialChar: true,
      isValid: false,
      expectedError: 'Password must contain special character'
    },
    {
      description: 'すべての要件を満たすパスワードを受け入れること',
      password: 'StrongPass123!',
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      isValid: true
    }
  ];

  test.each(passwordCases)(
    '$description',
    ({
      password,
      minLength,
      requireUppercase,
      requireLowercase,
      requireNumber,
      requireSpecialChar,
      isValid,
      expectedError
    }) => {
      const result = validatePassword(password, {
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumber,
        requireSpecialChar
      });

      expect(result.isValid).toBe(isValid);

      if (!isValid && expectedError) {
        expect(result.error).toContain(expectedError);
      }
    }
  );
});

describe('バリデーションヘルパー - 必須フィールド検証', () => {
  const requiredCases = [
    {
      description: '値が存在する場合、有効と判定すること',
      value: 'some value',
      fieldName: 'username',
      isValid: true
    },
    {
      description: '空文字列を無効と判定すること',
      value: '',
      fieldName: 'username',
      isValid: false,
      expectedError: 'username is required'
    },
    {
      description: 'nullを無効と判定すること',
      value: null,
      fieldName: 'email',
      isValid: false,
      expectedError: 'email is required'
    },
    {
      description: 'undefinedを無効と判定すること',
      value: undefined,
      fieldName: 'password',
      isValid: false,
      expectedError: 'password is required'
    },
    {
      description: '空白のみの文字列を無効と判定すること',
      value: '   ',
      fieldName: 'title',
      isValid: false,
      expectedError: 'title is required'
    }
  ];

  test.each(requiredCases)(
    '$description',
    ({ value, fieldName, isValid, expectedError }) => {
      const result = validateRequired(value, fieldName);
      expect(result.isValid).toBe(isValid);

      if (!isValid) {
        expect(result.error).toBe(expectedError);
      }
    }
  );
});

describe('バリデーションヘルパー - 長さ検証', () => {
  const lengthCases = [
    {
      description: '最小長・最大長の範囲内を受け入れること',
      value: 'Hello',
      min: 3,
      max: 10,
      isValid: true
    },
    {
      description: '最小長より短い値を拒否すること',
      value: 'Hi',
      min: 3,
      max: 10,
      isValid: false,
      expectedError: 'must be at least 3 characters'
    },
    {
      description: '最大長を超える値を拒否すること',
      value: 'This is too long',
      min: 3,
      max: 10,
      isValid: false,
      expectedError: 'must not exceed 10 characters'
    },
    {
      description: '最小長のみ指定された場合、正しく検証すること',
      value: 'Valid',
      min: 3,
      isValid: true
    },
    {
      description: '最大長のみ指定された場合、正しく検証すること',
      value: 'Valid',
      max: 10,
      isValid: true
    }
  ];

  test.each(lengthCases)(
    '$description',
    ({ value, min, max, isValid, expectedError }) => {
      const result = validateLength(value, { min, max });
      expect(result.isValid).toBe(isValid);

      if (!isValid && expectedError) {
        expect(result.error).toContain(expectedError);
      }
    }
  );
});

describe('バリデーションヘルパー - サニタイズ', () => {
  const sanitizeCases = [
    {
      description: 'HTMLタグを除去すること',
      input: '<script>alert("XSS")</script>Hello',
      expected: 'Hello'
    },
    {
      description: 'SQLインジェクション文字をエスケープすること',
      input: "'; DROP TABLE users; --",
      shouldEscape: true
    },
    {
      description: '前後の空白を削除すること',
      input: '  Hello World  ',
      expected: 'Hello World'
    },
    {
      description: '複数の空白を1つにまとめること',
      input: 'Hello    World',
      expected: 'Hello World'
    },
    {
      description: '特殊文字を適切にエスケープすること',
      input: '<>"&',
      shouldEscape: true
    }
  ];

  test.each(sanitizeCases)(
    '$description',
    ({ input, expected, shouldEscape }) => {
      const result = sanitizeInput(input);

      if (expected) {
        expect(result).toBe(expected);
      }

      if (shouldEscape) {
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
        expect(result).not.toContain('"');
      }
    }
  );
});
