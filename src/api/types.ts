/** Shared GraphQL / Product Hunt domain types */

export type GraphQLError = {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type Post = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  url: string;
  votesCount: number;
  commentsCount: number;
  createdAt: string;
  website?: string | null;
  description?: string | null;
};

export type Topic = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  followersCount?: number;
};

export type User = {
  id: string;
  name: string;
  username: string;
  headline?: string | null;
};

export type Edge<T> = { cursor: string; node: T };

export type Connection<T> = {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount?: number;
};

export type PostsQueryData = { posts: Connection<Post> };
export type PostQueryData = { post: Post | null };
export type TopicsQueryData = { topics: Connection<Topic> };
export type ViewerQueryData = {
  viewer: { user: User } | null;
};
