export interface AppContext {
	systemLocale: string; // e.g. 'sr-Latn-RS'
	userLocale: string; // e.g. 'sr-Latn-RS'
}

export interface Lookup<T extends string | number> {
	value: T;
	label: string;
}
