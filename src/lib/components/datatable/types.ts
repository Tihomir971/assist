//import type { TablePlugin } from 'svelte-headless-table/lib/types/TablePlugin';
import type { TablePlugin } from 'svelte-headless-table/plugins';
import type { Readable, Writable } from 'svelte/store';

export type ReadOrWritable<T> = Readable<T> | Writable<T>;

export type AnyPlugins = Record<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TablePlugin<any, any, any, any, any>
>;
