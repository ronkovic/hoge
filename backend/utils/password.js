import bcrypt from 'bcryptjs';

/**
 * パスワードをハッシュ化する
 * @param {string} password - ハッシュ化するパスワード
 * @param {object} options - オプション（algorithm, rounds）
 * @returns {Promise<string>} ハッシュ化されたパスワード
 */
export async function hashPassword(password, options = {}) {
  if (password === null) {
    throw new Error('Password is required');
  }

  if (password === '') {
    throw new Error('Password cannot be empty');
  }

  const rounds = options.rounds || 10;
  const hash = await bcrypt.hash(password, rounds);
  return hash;
}

/**
 * パスワードとハッシュを比較する
 * @param {string} password - 比較するパスワード
 * @param {string} hash - 比較するハッシュ
 * @returns {Promise<boolean>} 一致するかどうか
 */
export async function comparePassword(password, hash) {
  if (!hash || hash === '') {
    throw new Error('Hash is required');
  }

  // bcryptハッシュの形式チェック（$2a$, $2b$, $2y$で始まる）
  if (!/^\$2[aby]\$/.test(hash)) {
    throw new Error('Invalid hash format');
  }

  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    throw new Error('Invalid hash format');
  }
}

/**
 * ソルトを生成する
 * @param {number} length - ソルトの長さ（バイト数）
 * @returns {string} 生成されたソルト
 */
export function generateSalt(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let salt = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    salt += chars[randomIndex];
  }

  return salt;
}

/**
 * パスワードの強度を検証する
 * @param {string} password - 検証するパスワード
 * @returns {object} 検証結果
 */
export function validatePasswordStrength(password) {
  const commonPasswords = ['password', 'qwerty', '123456', '12345678', 'abc123'];

  // 一般的なパスワードチェック
  const isCommon = commonPasswords.includes(password.toLowerCase());

  // 強度判定
  let strength = 'weak';
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score >= 6) {
    strength = 'very_strong';
  } else if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  } else {
    strength = 'weak';
  }

  const warnings = [];
  if (isCommon) {
    warnings.push('This is a commonly used password');
  }

  return {
    strength,
    isStrong: score >= 3,
    isCommon,
    warnings
  };
}
