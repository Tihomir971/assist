import type {
	SmartFormConfig,
	FieldOverride,
	FormConfigBuilder
} from '$lib/types/form-config.types';

export function createFormConfig<T extends Record<string, unknown>>(): FormConfigBuilder<T> {
	const config: SmartFormConfig = {
		fieldOverrides: {}
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

		field<K extends keyof T>(fieldName: K, override: FieldOverride) {
			if (!config.fieldOverrides) {
				config.fieldOverrides = {};
			}
			config.fieldOverrides[fieldName as string] = override;
			return this;
		},

		cardProps(props: SmartFormConfig['cardProps']) {
			config.cardProps = props;
			return this;
		},

		gap(size: SmartFormConfig['gap']) {
			config.gap = size;
			return this;
		},

		build(): SmartFormConfig {
			return config;
		}
	};
}

// Simple helper functions for common field configurations
export const fieldConfigs = {
	hidden: (): Pick<FieldOverride, 'hidden'> => ({ hidden: true }),
	readonly: (): Pick<FieldOverride, 'readonly'> => ({ readonly: true }),

	select: (
		options: Array<{ value: string | number; label: string }>,
		searchable = false
	): Pick<FieldOverride, 'options' | 'searchable'> => ({
		options,
		searchable
	}),

	number: (step: number): Pick<FieldOverride, 'type' | 'step'> => ({
		type: 'number',
		step
	})
};
