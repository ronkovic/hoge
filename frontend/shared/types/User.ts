export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export const User = {} as User;
