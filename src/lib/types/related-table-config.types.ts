import type { ZodObject } from 'zod/v4';
import type { $ZodShape, $ZodObjectConfig } from 'zod/v4/core';
import type { SmartFormConfig } from './form-config.types';
import type { RelatedTableTabConfig } from './split-layout-config.types';

export interface ColumnDefinition<T extends Record<string, unknown>> {
	key: keyof T;
	label: string;
	type?: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'lookup' | 'custom' | 'url';
	width?: string;
	sortable?: boolean;
	searchable?: boolean;
	formatter?: (value: T[keyof T], row: T) => string;
	component?: unknown; // Custom Svelte component for rendering
	lookupKey?: string; // Key to find the lookup array in the `lookupData` prop of the table
	className?: string;
}

export interface BulkOperation {
	label: string;
	action: string;
	variant?: 'default' | 'destructive' | 'outline';
	icon?: unknown;
	confirmMessage?: string;
}

export interface RelatedTableConfig<
	T extends Record<string, unknown>,
	S extends ZodObject<$ZodShape, $ZodObjectConfig> = ZodObject<$ZodShape, $ZodObjectConfig>
> {
	title: string;
	description?: string;

	// Table configuration
	columns: ColumnDefinition<T>[];
	itemsPerPage?: number;
	searchable?: boolean;
	sortable?: boolean;

	// CRUD configuration
	canCreate?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;

	// Form configuration (reuses SmartForm)
	formSchema: S;
	formConfig?: SmartFormConfig;

	// Actions
	createAction?: string;
	updateAction?: string;
	deleteAction?: string;

	// Bulk operations
	bulkOperations?: {
		enabled: boolean;
		actions: BulkOperation[];
	};

	// Advanced features
	exportEnabled?: boolean;
	realTimeUpdates?: boolean;

	// Styling
	cardProps?: {
		className?: string;
		showHeader?: boolean;
	};

	// Parent relationship
	parentIdField?: string; // Field name that contains parent ID (e.g., 'm_product_category_id')

	// Tab configuration for split layout
	tabConfig?: RelatedTableTabConfig;
}

export interface RelatedTableConfigBuilder<
	T extends Record<string, unknown>,
	S extends ZodObject<$ZodShape, $ZodObjectConfig>
> {
	title(title: string): RelatedTableConfigBuilder<T, S>;
	description(description: string): RelatedTableConfigBuilder<T, S>;
	column(definition: ColumnDefinition<T>): RelatedTableConfigBuilder<T, S>;
	formSchema(schema: S): RelatedTableConfigBuilder<T, S>;
	formConfig(config: SmartFormConfig): RelatedTableConfigBuilder<T, S>;
	actions(create?: string, update?: string, deleteAction?: string): RelatedTableConfigBuilder<T, S>;
	permissions(
		canCreate?: boolean,
		canEdit?: boolean,
		canDelete?: boolean
	): RelatedTableConfigBuilder<T, S>;
	bulkOperations(enabled: boolean, actions?: BulkOperation[]): RelatedTableConfigBuilder<T, S>;
	cardProps(props: RelatedTableConfig<T, S>['cardProps']): RelatedTableConfigBuilder<T, S>;
	parentIdField(fieldName: string): RelatedTableConfigBuilder<T, S>;
	pagination(itemsPerPage: number): RelatedTableConfigBuilder<T, S>;
	features(
		searchable?: boolean,
		sortable?: boolean,
		exportEnabled?: boolean
	): RelatedTableConfigBuilder<T, S>;
	tab(config: RelatedTableTabConfig): RelatedTableConfigBuilder<T, S>;
	build(): RelatedTableConfig<T, S>;
}
