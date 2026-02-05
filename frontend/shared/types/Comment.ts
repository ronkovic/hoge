export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export const Comment = {} as Comment;
