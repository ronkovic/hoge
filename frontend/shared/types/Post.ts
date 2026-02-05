export interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export const Post = {} as Post;
