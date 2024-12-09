import type { Database } from './supabase.js';
export type { Database } from './supabase.js';

export type SupabaseTable<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T];
