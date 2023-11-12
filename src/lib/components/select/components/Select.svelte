<script lang="ts">
	import type { SelectOption } from '@melt-ui/svelte';
	import { setCtx } from '../ctx';
	import { Label, Menu, Option, Trigger } from '../index';

	const {} = setCtx({});

	export let label: string | undefined = undefined;
	export let options: SelectOption[] = [
		{ value: '1', label: 'Caramel' },
		{ value: '2', label: 'Chocolate' },
		{ value: '3', label: 'Strawberry' },
		{ value: '4', label: 'Cookies & Cream' }
	];
</script>

{#if label}
	<Label>{label}</Label>
{/if}
<Trigger></Trigger>
<Menu>
	<Option {options}></Option>
</Menu>
<slot />
