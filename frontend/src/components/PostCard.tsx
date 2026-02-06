import { useState } from 'react';
import type { Post } from '../types/post';

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  return (
    <div data-testid="post-card" style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <div data-testid="post-id">ID: {post.id}</div>
      <div data-testid="post-title">タイトル: {post.title}</div>
      <div data-testid="post-author">著者: {post.author}</div>
      <div data-testid="post-created-at">作成日時: {post.createdAt}</div>
      <div data-testid="post-content">
        本文: {showFullContent ? post.content : post.content.substring(0, 50)}
      </div>
      {showFullContent && (
        <div data-testid="post-full-content">{post.content}</div>
      )}
      <div style={{ marginTop: '10px' }}>
        <button
          data-testid="post-detail"
          onClick={() => setShowFullContent(!showFullContent)}
        >
          詳細
        </button>
        <button
          data-testid="post-delete"
          onClick={() => onDelete(post.id)}
          style={{ marginLeft: '10px' }}
        >
          削除
        </button>
      </div>
    </div>
  );
}
