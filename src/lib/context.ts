import { createContext } from 'svelte';

import type { AppContext } from './types/app';

export const [getAppContext, setAppContext] = createContext<AppContext>();
