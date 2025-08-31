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
	availableLocales: LocaleLookup[];
	fieldStates: Record<string, LocaleFieldState>;
	isValid: boolean;
	errors: string[];
}

export interface LocaleLookup {
	value: string; // Locale code (e.g., "en-US")
	label: string; // Display name (e.g., "English (US)")
	isDefault: boolean; // Whether this is the default locale
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
