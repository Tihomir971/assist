<script lang="ts" module>
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import type { NumberInputProps } from './types.js';
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		type FormFieldProxy
	} from 'sveltekit-superforms';
	import NumberInput from './number-input.svelte'; // Import the base component

	interface Props extends NumberInputProps {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, number>;
		placeholder?: string;
		label?: string;
		inline?: boolean;
		fraction?: number;
	}

	let { superform, field, label, inline = false, fraction, ...restProps }: Props = $props();

	const { value, errors, constraints, tainted } = formFieldProxy(
		superform,
		field
	) satisfies FormFieldProxy<number>;
</script>

<NumberInput
	name={field}
	bind:value={$value}
	{inline}
	invalid={$errors ? true : false}
	{label}
	required={$constraints?.required}
	formatOptions={{
		minimumFractionDigits: fraction ?? 2,
		maximumFractionDigits: fraction ?? 2
	}}
	{...restProps}
/>

{#if $errors}
	<span class="pt-1 text-sm text-red-500">{$errors.join(', ')}</span>
{/if}

<!-- Hidden input for form submission -->
<!-- <input type="hidden" name={field} value={$value ?? ''} /> -->
