import type { Lookup } from './app';

export interface MultilingualData {
	[localeCode: string]: string | undefined;
}

export interface LocaleFieldState {
	hasContent: boolean;
	isRequired: boolean;
	errors: string[];
}

export interface MultilingualFieldState {
	activeLocale: string;
	availableLocales: Lookup<string>[];
	fieldStates: Record<string, LocaleFieldState>;
	isValid: boolean;
	errors: string[];
}

// Example usage:
// const names: MultilingualData = {
//   "en-US": "Product Name",
//   "es-ES": "Nombre del Producto"
// };

// const config: MultilingualFieldConfig = {
//   required: ["en-US"],
//   defaultLocale: "en-US"
// };
