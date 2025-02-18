import type { Database } from './database.types.js';

export type Tables<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Row'];

export type Insert<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Insert'];

export type Update<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Update'];

export type Views<T extends keyof Database['public']['Views']> =
	Database['public']['Views'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type Functions = Database['public']['Functions'];
