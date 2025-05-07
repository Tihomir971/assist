<script lang="ts" module>
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		type FormFieldProxy
	} from 'sveltekit-superforms';
	import { SwitchZag } from '../index.js';

	type Props = {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, boolean>;
		readonly?: boolean;
		placeholder?: string;
		label?: string;
		inline?: boolean;
	};

	let { superform, field, readonly, label, inline = false }: Props = $props();

	const { value, errors, constraints, tainted } = formFieldProxy(
		superform,
		field
	) satisfies FormFieldProxy<boolean>;
</script>

<SwitchZag
	name={field}
	{inline}
	invalid={$errors ? true : false}
	{label}
	readOnly={readonly}
	required={$constraints?.required}
	bind:checked={$value}
/>

{#if $errors}
	<span class="pt-1 text-sm text-red-500">{$errors.join(', ')}</span>
{/if}

<!-- Hidden input for form submission -->
<!-- <input type="hidden" name={field} value={$value ?? ''} /> -->
