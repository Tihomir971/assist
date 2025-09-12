<script lang="ts">
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';
	import { Switch } from '$lib/components/ui/switch';

	interface SmartSwitchProps {
		field: AnalyzedFieldConfig; // Configuration for this field
		value: boolean | null | undefined; // Bound value
		[key: string]: any; // Allow additional props from Form.Control
	}

	let { field, value = $bindable(), ...restProps }: SmartSwitchProps = $props();

	// Convert value to boolean for switch component
	let checked = $state(Boolean(value));

	// Update bound value when switch changes
	$effect(() => {
		value = checked;
	});

	// Update checked when external value changes
	$effect(() => {
		checked = Boolean(value);
	});

	// Combine props for the switch element
	const switchAttrs = {
		'aria-label': field.label,
		...restProps // Spread Form.Control props (includes name, id, aria attributes)
	};
</script>

<Switch {...switchAttrs} bind:checked />

<style>
	:global(.required::after) {
		content: '*';
		color: hsl(var(--destructive));
		margin-left: 0.125rem;
	}
</style>
