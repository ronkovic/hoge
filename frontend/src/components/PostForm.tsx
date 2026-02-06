import { useState } from 'react';

interface PostFormProps {
  onSubmit: (title: string, author: string, content: string) => void;
}

export function PostForm({ onSubmit }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim() && author.trim() && content.trim()) {
      onSubmit(title, author, content);
      setTitle('');
      setAuthor('');
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          data-testid="post-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          style={{ width: '100%', padding: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          data-testid="post-author-input"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="著者名"
          style={{ width: '100%', padding: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <textarea
          data-testid="post-content-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="本文"
          style={{ width: '100%', padding: '5px', minHeight: '100px' }}
        />
      </div>
      <button type="submit" data-testid="post-submit">
        投稿
      </button>
    </form>
  );
}
