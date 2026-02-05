import { pool } from '../db.js';

export const Comment = {
  async create({ post_id, user_id, content }) {
    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [post_id, user_id, content]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM comments');
    return result.rows;
  },

  async findById({ id }) {
    const result = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByPostId({ post_id }) {
    const result = await pool.query('SELECT * FROM comments WHERE post_id = $1', [post_id]);
    return result.rows;
  },

  async findByUserId({ user_id }) {
    const result = await pool.query('SELECT * FROM comments WHERE user_id = $1', [user_id]);
    return result.rows;
  },

  async update({ id, content }) {
    const result = await pool.query(
      'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
      [content, id]
    );
    return result.rows[0];
  },

  async delete({ id }) {
    const result = await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

export default Comment;
