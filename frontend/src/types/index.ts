export interface User {
  id: number;
  email: string;
  nickname: string;
  avatar_url: string | null;
  signature: string | null;
  status: 'active' | 'banned' | 'pending';
  reputation: number;
  topics_count: number;
  posts_count: number;
  created_at: string;
  last_seen: string | null;
  role: Role | null;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface Category {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  forums: Forum[];
}

export interface Forum {
  id: number;
  title: string;
  description: string | null;
  rules: string | null;
  is_visible: boolean;
  sort_order: number;
  topics_count: number;
  posts_count: number;
  last_topic_id: number | null;
  created_at: string;
  updated_at: string;
  category: Category;
  category_id: number;
}

export interface Topic {
  id: number;
  title: string;
  is_pinned: boolean;
  is_closed: boolean;
  views_count: number;
  posts_count: number;
  last_post_id: number | null;
  created_at: string;
  updated_at: string;
  forum: Forum;
  forum_id: number;
  user: User;
  user_id: number;
}

export interface Post {
  id: number;
  content: string;
  likes_count: number;
  is_deleted: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  topic: Topic;
  topic_id: number;
  user: User;
  user_id: number;
  parent_post_id: number | null;
  attachments: Attachment[];
  liked_by: number[];
}

export interface Attachment {
  id: number;
  file_path: string;
  original_name: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  created_at: string;
  post_id: number | null;
  user_id: number;
  url?: string;
}

export interface Notification {
  id: number;
  type: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
  user_id: number;
}

export interface PrivateMessage {
  id: number;
  content: string;
  read_at: string | null;
  deleted_by_sender: boolean | null;
  deleted_by_recipient: boolean | null;
  created_at: string;
  sender: User;
  sender_id: number;
  recipient: User | null;
  recipient_id: number | null;
  group_id: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
