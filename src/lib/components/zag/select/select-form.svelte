<script lang="ts" module>
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import type { SelectItem, SelectProps } from './types.js';
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		type FormFieldProxy
	} from 'sveltekit-superforms';
	import Select from './select.svelte'; // Import the base component

	interface Props extends SelectProps<SelectItem> {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, number>;
		placeholder?: string;
		label?: string;
		inline?: boolean;
	}

	let {
		superform,
		field,
		items = [],
		placeholder = 'Select an item',
		label,
		inline = false,
		...restProps
	}: Props = $props();

	const { value, errors, constraints, tainted } = formFieldProxy(
		superform,
		field
	) satisfies FormFieldProxy<number>;
</script>

<Select
	name={field}
	{inline}
	{items}
	invalid={$errors ? true : false}
	{label}
	required={$constraints?.required}
	bind:value={$value}
	{...restProps}
/>

{#if $errors}
	<span class="pt-1 text-red-500">{$errors.join(', ')}</span>
{/if}

<!-- Hidden input for form submission -->
<!-- <input type="hidden" name={field} value={$value ?? ''} /> -->
