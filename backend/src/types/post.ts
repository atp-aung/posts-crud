export interface Post {
  id: number;
  title: string;
  content: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePostInput {
  title: string;
  content?: string;
}
