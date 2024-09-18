import type { SupabaseTable } from './database.types';

type User = SupabaseTable<'ad_user'>['Row'];

export type AppUser = { avatar_url: User['avatar_url']; name: User['username'] };
