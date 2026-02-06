import { PostCard } from './PostCard';
import type { Post } from '../types/post';

interface PostListProps {
  posts: Post[];
  onDelete: (id: number) => void;
}

export function PostList({ posts, onDelete }: PostListProps) {
  return (
    <div data-testid="post-list">
      {posts.length === 0 ? (
        <div data-testid="post-list-empty">記事がありません</div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={onDelete} />
        ))
      )}
    </div>
  );
}
