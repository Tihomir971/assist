import type { ZodObject } from 'zod';
import type { $ZodShape, $ZodObjectConfig } from 'zod/v4/core';
import type {
	RelatedTableConfig,
	RelatedTableConfigBuilder,
	ColumnDefinition,
	BulkOperation
} from '$lib/types/related-table-config.types';
import { getAppContext } from '$lib/context';

export function createRelatedTableConfig<
	T extends Record<string, unknown>,
	S extends ZodObject<$ZodShape, $ZodObjectConfig> = ZodObject<$ZodShape, $ZodObjectConfig>
>(): RelatedTableConfigBuilder<T, S> {
	const config: Partial<RelatedTableConfig<T, S>> = {
		columns: [],
		canCreate: true,
		canEdit: true,
		canDelete: true,
		itemsPerPage: 10,
		searchable: true,
		sortable: true,
		exportEnabled: false,
		realTimeUpdates: false
	};

	return {
		title(title: string) {
			config.title = title;
			return this;
		},

		description(description: string) {
			config.description = description;
			return this;
		},

		column(definition: ColumnDefinition<T>) {
			config.columns!.push(definition);
			return this;
		},

		formSchema(schema: S) {
			config.formSchema = schema;
			return this;
		},

		formConfig(formConfig) {
			config.formConfig = formConfig;
			return this;
		},

		actions(create?: string, update?: string, deleteAction?: string) {
			config.createAction = create;
			config.updateAction = update;
			config.deleteAction = deleteAction;
			return this;
		},

		permissions(canCreate = true, canEdit = true, canDelete = true) {
			config.canCreate = canCreate;
			config.canEdit = canEdit;
			config.canDelete = canDelete;
			return this;
		},

		bulkOperations(enabled: boolean, actions: BulkOperation[] = []) {
			config.bulkOperations = { enabled, actions };
			return this;
		},

		cardProps(props) {
			config.cardProps = props;
			return this;
		},

		parentIdField(fieldName: string) {
			config.parentIdField = fieldName;
			return this;
		},

		pagination(itemsPerPage: number) {
			config.itemsPerPage = itemsPerPage;
			return this;
		},

		features(searchable = true, sortable = true, exportEnabled = false) {
			config.searchable = searchable;
			config.sortable = sortable;
			config.exportEnabled = exportEnabled;
			return this;
		},

		tab(tabConfig) {
			config.tabConfig = tabConfig;
			return this;
		},

		build(): RelatedTableConfig<T, S> {
			if (!config.title || !config.formSchema) {
				throw new Error('Title and formSchema are required');
			}
			return config as RelatedTableConfig<T, S>;
		}
	};
}

// Helper functions for common column types
export const columnTypes = {
	text: <T extends Record<string, unknown>>(
		key: keyof T,
		label: string,
		options?: Partial<ColumnDefinition<T>>
	): ColumnDefinition<T> => ({
		key,
		label,
		type: 'text',
		sortable: true,
		searchable: true,
		...options
	}),

	number: <T extends Record<string, unknown>>(
		key: keyof T,
		label: string,
		options?: Partial<ColumnDefinition<T>>
	): ColumnDefinition<T> => ({
		key,
		label,
		type: 'number',
		sortable: true,
		...options
	}),

	boolean: <T extends Record<string, unknown>>(
		key: keyof T,
		label: string,
		options?: Partial<ColumnDefinition<T>>
	): ColumnDefinition<T> => ({
		key,
		label,
		type: 'boolean',
		sortable: true,
		width: '80px',
		...options
	}),

	lookup: <T extends Record<string, unknown>>(
		key: keyof T,
		label: string,
		lookupKey: string,
		options?: Partial<ColumnDefinition<T>>
	): ColumnDefinition<T> => ({
		key,
		label,
		type: 'lookup',
		lookupKey,
		sortable: true,
		searchable: true,
		// The formatter is removed. This logic now belongs in the component
		// that consumes the lookupKey and the lookupData prop.
		...options
	}),

	date: <T extends Record<string, unknown>>(
		key: keyof T,
		label: string,
		options?: Partial<ColumnDefinition<T>>
	): ColumnDefinition<T> => ({
		key,
		label,
		type: 'date',
		sortable: true,
		formatter: (value) =>
			value ? new Date(value as string).toLocaleDateString(getAppContext().userLocale) : '',
		...options
	}),

	datetime: <T extends Record<string, unknown>>(
		key: keyof T,
		label: string,
		options?: Partial<ColumnDefinition<T>>
	): ColumnDefinition<T> => ({
		key,
		label,
		type: 'datetime',
		sortable: true,
		formatter: (value) =>
			value ? new Date(value as string).toLocaleString(getAppContext().userLocale) : '',
		...options
	}),

	custom: <T extends Record<string, unknown>>(
		key: keyof T,
		label: string,
		component: unknown,
		options?: Partial<ColumnDefinition<T>>
	): ColumnDefinition<T> => ({
		key,
		label,
		type: 'custom',
		component,
		...options
	}),

	url: <T extends Record<string, unknown>>(
		key: keyof T,
		label: string,
		options?: Partial<ColumnDefinition<T>>
	): ColumnDefinition<T> => ({
		key,
		label,
		type: 'url',
		sortable: false,
		searchable: false,
		width: '60px',
		...options
	})
};
