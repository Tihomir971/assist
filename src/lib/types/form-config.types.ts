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
	options?: LookupOption[];
	hidden?: boolean;
	readonly?: boolean;
	searchable?: boolean; // For select fields
	order?: number; // For custom field ordering
}

export interface SmartFormConfig {
	title?: string;
	description?: string;
	fieldOverrides?: Record<string, FieldOverride>;
	layout?: 'single' | 'two-column' | 'three-column';
	showSystemFields?: boolean;
}
