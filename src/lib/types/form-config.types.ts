export interface LookupOption {
	value: string | number;
	label: string;
	description?: string;
	disabled?: boolean;
}

export interface FieldOverride {
	label?: string;
	placeholder?: string;
	description?: string;
	type?: 'text' | 'number' | 'boolean' | 'select' | 'combobox' | 'textarea' | 'date' | 'datetime'; // Manual field type override
	options?: LookupOption[];
	hidden?: boolean;
	readonly?: boolean;
	searchable?: boolean; // For select fields
	order?: number; // For custom field ordering
	span?: number; // NEW: Grid column span (1-12 for CSS Grid)
	className?: string; // NEW: Additional CSS classes for the field container
	size?: 'sm' | 'md' | 'lg'; // NEW: Field size variant
	step?: number; // For number inputs
	fraction?: number; // For number inputs, to specify fraction digits
}

export interface SmartFormConfig {
	title?: string;
	description?: string;
	fieldOverrides?: Record<string, FieldOverride>;
	// Simplified: Always uses 12-column responsive grid (1 col on mobile, 12 cols on md+)
	showSystemFields?: boolean;
	cardProps?: {
		className?: string;
		showHeader?: boolean;
		showFooter?: boolean;
	};
	gap?: 'sm' | 'md' | 'lg'; // Grid gap size
}

// Type-safe form configuration builder
export interface FormConfigBuilder<T extends Record<string, unknown>> {
	title(title: string): FormConfigBuilder<T>;
	description(description: string): FormConfigBuilder<T>;
	field<K extends keyof T>(fieldName: K, override: FieldOverride): FormConfigBuilder<T>;
	cardProps(props: SmartFormConfig['cardProps']): FormConfigBuilder<T>;
	gap(size: SmartFormConfig['gap']): FormConfigBuilder<T>;
	build(): SmartFormConfig;
}
