/**
 * エラーハンドリングミドルウェア
 * @param {Error} error - エラーオブジェクト
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - 次のミドルウェア
 */
export function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const message = error.message || 'Internal server error';

  const response = {
    message,
    ...(error.validationErrors && { validationErrors: error.validationErrors })
  };

  // 開発環境ではスタックトレースを含める
  if (process.env.NODE_ENV !== 'production') {
    response.stack = error.stack;
  }

  res.status(status).json(response);
}

/**
 * 404 Not Found ハンドラー
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - 次のミドルウェア
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
}
