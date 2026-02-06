import axios from 'axios';
import type { Post } from '../types/post';

const API_BASE_URL = 'http://localhost:8080/api';

let nextId = 1;
const mockPosts: Post[] = [];

const USE_MOCK = true;

export const postApi = {
  async getPosts(): Promise<Post[]> {
    if (USE_MOCK) {
      return Promise.resolve([...mockPosts]);
    }
    const response = await axios.get<Post[]>(`${API_BASE_URL}/posts`);
    return response.data;
  },

  async createPost(title: string, author: string, content: string): Promise<Post> {
    const newPost: Post = {
      id: nextId++,
      title,
      author,
      content,
      createdAt: new Date().toISOString(),
    };

    if (USE_MOCK) {
      mockPosts.push(newPost);
      await axios.post<Post>(`${API_BASE_URL}/posts`, { title, author, content }).catch(() => {});
      return newPost;
    }
    const response = await axios.post<Post>(`${API_BASE_URL}/posts`, {
      title,
      author,
      content,
    });
    return response.data;
  },

  async deletePost(id: number): Promise<void> {
    if (USE_MOCK) {
      const index = mockPosts.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockPosts.splice(index, 1);
      }
      await axios.delete(`${API_BASE_URL}/posts/${id}`).catch(() => {});
      return;
    }
    await axios.delete(`${API_BASE_URL}/posts/${id}`);
  },
};
