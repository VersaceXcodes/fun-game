import { z } from 'zod';

// Users Schemas
export const userEntitySchema = z.object({
  id: z.number().int(),
  username: z.string().min(1).max(50),
  email: z.string().min(1).max(100).email(),
  password_hash: z.string().min(1).max(255),
  created_at: z.coerce.date()
});

export const createUserInputSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().min(1).max(100).email(),
  password_hash: z.string().min(1).max(255)
});

export const updateUserInputSchema = z.object({
  id: z.number().int(),
  username: z.string().min(1).max(50).optional(),
  email: z.string().min(1).max(100).email().optional(),
  password_hash: z.string().min(1).max(255).optional()
});

export const searchUsersInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['username', 'email', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Posts Schemas
export const postEntitySchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  image_url: z.string().nullable().max(255),
  created_at: z.coerce.date()
});

export const createPostInputSchema = z.object({
  user_id: z.number().int(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  image_url: z.string().nullable().max(255).optional()
});

export const updatePostInputSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int().optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  image_url: z.string().nullable().max(255).optional()
});

export const searchPostsInputSchema = z.object({
  query: z.string().optional(),
  user_id: z.number().int().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['title', 'user_id', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Comments Schemas
export const commentEntitySchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  post_id: z.number().int(),
  content: z.string().min(1),
  created_at: z.coerce.date()
});

export const createCommentInputSchema = z.object({
  user_id: z.number().int(),
  post_id: z.number().int(),
  content: z.string().min(1)
});

export const updateCommentInputSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int().optional(),
  post_id: z.number().int().optional(),
  content: z.string().min(1).optional()
});

export const searchCommentsInputSchema = z.object({
  query: z.string().optional(),
  user_id: z.number().int().optional(),
  post_id: z.number().int().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['content', 'user_id', 'post_id', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Inferred Types
export type UserEntity = z.infer<typeof userEntitySchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;

export type PostEntity = z.infer<typeof postEntitySchema>;
export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
export type SearchPostsInput = z.infer<typeof searchPostsInputSchema>;

export type CommentEntity = z.infer<typeof commentEntitySchema>;
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
export type SearchCommentsInput = z.infer<typeof searchCommentsInputSchema>;