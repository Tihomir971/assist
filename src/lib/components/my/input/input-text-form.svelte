<script lang="ts" module>
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import type { InputProps } from './types';
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		type FormFieldProxy
	} from 'sveltekit-superforms';
	import InputText from './input-text.svelte';

	type Props = InputProps & {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, string>;
	};

	let {
		superform,
		field,
		placeholder = 'Select an item',
		label,
		inline = false,
		...restProps
	}: Props = $props();

	const { value, errors, constraints, tainted } = formFieldProxy(
		superform,
		field
	) satisfies FormFieldProxy<string>;
</script>

<InputText
	name={field}
	{inline}
	{label}
	required={$constraints?.required}
	bind:value={$value}
	{...restProps}
/>

{#if $errors}
	<span class="pt-1 text-sm text-red-500">{$errors.join(', ')}</span>
{/if}

<!-- Hidden input for form submission -->
<!-- <input type="hidden" name={field} value={$value ?? ''} /> -->
