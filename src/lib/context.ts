import { Context } from 'runed';
import type { AppSettings } from './types/app';

export const appSettings = new Context<AppSettings>('appContext');
