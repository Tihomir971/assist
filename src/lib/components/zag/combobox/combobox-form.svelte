<script lang="ts" module>
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import type { ComboboxItem, ComboboxProps } from './types.js';
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		type FormFieldProxy
	} from 'sveltekit-superforms';
	import Combobox from './combobox.svelte';

	interface Props extends ComboboxProps<ComboboxItem> {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, number>;
		// items: ComboboxItem[];
		readonly?: boolean;
		placeholder?: string;
		label?: string;
		inline?: boolean;
	}

	let {
		superform,
		field,
		items = [],
		readonly,
		placeholder = 'Select an item',
		label,
		inline = false
	}: Props = $props();

	const { value, errors, constraints, tainted } = formFieldProxy(
		superform,
		field
	) satisfies FormFieldProxy<number>;
</script>

<Combobox
	name={field}
	{items}
	invalid={$errors ? true : false}
	{label}
	{placeholder}
	readOnly={readonly}
	required={$constraints?.required}
	bind:value={$value}
/>

{#if $errors}
	<span class="pt-1 text-red-500">{$errors.join(', ')}</span>
{/if}

<!-- Hidden input for form submission -->
<!-- <input type="hidden" name={field} value={$value ?? ''} /> -->
