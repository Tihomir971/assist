import type { Database } from './supabase.ts';
export type { Database } from './supabase.ts';

export type SupabaseTable<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T];
