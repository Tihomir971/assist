// src/lib/types.ts
import type { User } from '@supabase/supabase-js';
import type { Database } from './supabase.types';

// Use Supabase type helpers
export type Profile = Database['public']['Tables']['ad_user']['Row'];
export type ProfileInsert = Database['public']['Tables']['ad_user']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['ad_user']['Update'];

// Define allowed user metadata keys
export interface UserMetadata {
	name?: string;
	role?: Profile['role'];
	avatar_url?: string;
	phone?: string;
	[key: string]: string | number | boolean | null | undefined;
}

// API request/response types
export interface CreateUserRequest {
	email: string;
	password: string;
	userData?: UserMetadata;
}

export interface UpdateUserRequest {
	email?: string;
	password?: string;
	userData?: UserMetadata;
}

export interface CreateUserResponse {
	user: User;
}

export interface ListUsersResponse {
	users: User[];
	total: number;
}

export interface GetUserResponse {
	user: User;
}

export interface UpdateUserResponse {
	user: User;
}

export interface DeleteUserResponse {
	success: boolean;
}

// Helper types for better type safety
export type UserRole = Profile['role'];

// Auth user update data type
export interface AuthUserUpdateData {
	email?: string;
	password?: string;
	user_metadata?: UserMetadata;
	app_metadata?: Record<string, unknown>;
	email_confirm?: boolean;
}
