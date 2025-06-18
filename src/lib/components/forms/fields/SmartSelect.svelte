<script lang="ts">
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';
	import * as Select from '$lib/components/ui/select/index.js';

	interface SmartSelectProps {
		field: AnalyzedFieldConfig; // Configuration for this field
		value: string | number | string[] | number[] | null | undefined; // Bound value (can be array for multiple)
		[key: string]: any; // Allow additional props from Form.Control
	}

	let { field, value = $bindable(), ...restProps }: SmartSelectProps = $props();

	// Determine if this is a multiple select based on field configuration or value type
	const isMultiple =
		Array.isArray(value) || field.name.includes('[]') || field.name.endsWith('_ids');

	// Get display value for trigger
	const displayValue = $derived(() => {
		if (isMultiple) {
			const arrayValue = Array.isArray(value) ? value : [];
			if (arrayValue.length > 0) {
				return `${arrayValue.length} item${arrayValue.length === 1 ? '' : 's'} selected`;
			}
			return field.placeholder || `Select ${field.label.toLowerCase()}...`;
		}
		if (!value) return field.placeholder || `Select ${field.label.toLowerCase()}...`;
		return (
			field.options?.find((opt) => String(opt.value) === String(value))?.label || String(value)
		);
	});

	// Handle value changes for single select
	function handleSingleValueChange(newValue: string | undefined) {
		if (newValue !== undefined && newValue !== '') {
			if (field.type === 'number') {
				value = Number(newValue);
			} else {
				value = newValue;
			}
		} else {
			value = null;
		}
	}

	// Handle value changes for multiple select
	function handleMultipleValueChange(newValue: string[]) {
		if (field.type === 'number') {
			value = newValue.map((v) => Number(v)).filter((v) => !isNaN(v));
		} else {
			value = newValue.filter((v) => v !== '');
		}
	}
</script>

{#if isMultiple}
	<Select.Root
		type="multiple"
		onValueChange={handleMultipleValueChange}
		value={Array.isArray(value) ? value.map((v) => String(v)) : []}
		name={restProps.name}
	>
		<Select.Trigger {...restProps} class="w-full">
			{displayValue()}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#if field.options && field.options.length > 0}
					{#each field.options as option (option.value)}
						<Select.Item value={String(option.value)} label={option.label}>
							{option.label}
						</Select.Item>
					{/each}
				{:else}
					<Select.Item value="" label="No options available" disabled>
						No options available
					</Select.Item>
				{/if}
			</Select.Group>
		</Select.Content>
	</Select.Root>
{:else}
	<Select.Root
		type="single"
		onValueChange={handleSingleValueChange}
		value={value ? String(value) : undefined}
		name={restProps.name}
	>
		<Select.Trigger {...restProps} class="w-full">
			{displayValue()}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#if field.options && field.options.length > 0}
					{#each field.options as option (option.value)}
						<Select.Item value={String(option.value)} label={option.label}>
							{option.label}
						</Select.Item>
					{/each}
				{:else}
					<Select.Item value="" label="No options available" disabled>
						No options available
					</Select.Item>
				{/if}
			</Select.Group>
		</Select.Content>
	</Select.Root>
{/if}
