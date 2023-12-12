import type { Tables } from './database.types';

type User = Tables<'ad_user'>;

export type AppUser = { avatar_url: User['avatar_url']; name: User['username'] };
