import { pool } from '../db.js';

export const Post = {
  async create({ user_id, title, content }) {
    const result = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [user_id, title, content]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM posts');
    return result.rows;
  },

  async findById({ id }) {
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByUserId({ user_id }) {
    const result = await pool.query('SELECT * FROM posts WHERE user_id = $1', [user_id]);
    return result.rows;
  },

  async update({ id, title, content }) {
    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    return result.rows[0];
  },

  async delete({ id }) {
    const result = await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

export default Post;
