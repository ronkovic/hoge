/**
 * メールアドレスのバリデーション
 * @param {string} email - 検証するメールアドレス
 * @returns {object} 検証結果
 */
export function validateEmail(email) {
  if (!email || email === null || email === undefined) {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return {
    isValid,
    error: isValid ? undefined : 'Invalid email format'
  };
}

/**
 * パスワードのバリデーション
 * @param {string} password - 検証するパスワード
 * @param {object} options - 検証オプション
 * @returns {object} 検証結果
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false
  } = options;

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }

  if (requireSpecialChar && !/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain special character');
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(', ')
  };
}

/**
 * 必須フィールドのバリデーション
 * @param {any} value - 検証する値
 * @param {string} fieldName - フィールド名
 * @returns {object} 検証結果
 */
export function validateRequired(value, fieldName) {
  const isValid = value !== null && value !== undefined && value.toString().trim() !== '';

  return {
    isValid,
    error: isValid ? undefined : `${fieldName} is required`
  };
}

/**
 * 長さのバリデーション
 * @param {string} value - 検証する値
 * @param {object} options - 検証オプション（min, max）
 * @returns {object} 検証結果
 */
export function validateLength(value, options = {}) {
  const { min, max } = options;
  const errors = [];

  if (min !== undefined && value.length < min) {
    errors.push(`must be at least ${min} characters`);
  }

  if (max !== undefined && value.length > max) {
    errors.push(`must not exceed ${max} characters`);
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(' and ')
  };
}

/**
 * 入力のサニタイズ
 * @param {string} input - サニタイズする入力
 * @returns {string} サニタイズされた文字列
 */
export function sanitizeInput(input) {
  if (!input) return '';

  let sanitized = input;

  // まず危険なHTMLタグとその中身を完全に除去（scriptタグ、styleタグ）
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<style[^>]*>.*?<\/style>/gi, '');

  // imgタグなどの自己完結型タグを完全に除去
  sanitized = sanitized.replace(/<img[^>]*>/gi, '');

  // その他のHTMLタグを除去（<の直後がスペースでないもののみ）
  // 例: <Company> → Company, <div> → 空, <div>Test</div> → Test
  // 例: < word > → < word > (スペースがあるので削除しない)
  sanitized = sanitized.replace(/<(?!\s)[^>]*>/g, '');

  // 前後の空白を削除
  sanitized = sanitized.trim();

  // 複数の空白を1つにまとめる
  sanitized = sanitized.replace(/\s+/g, ' ');

  // 特殊文字をエスケープ（タグ除去後に残った特殊文字のみ）
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return sanitized;
}
