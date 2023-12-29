<script lang="ts">
	import type { SelectOption } from '@melt-ui/svelte';
	import { setCtx } from '../ctx';
	import { Menu, Option, Trigger } from '../index';

	const {} = setCtx({});

	export let options: SelectOption[] = [
		{ value: '1', label: 'Caramel' },
		{ value: '2', label: 'Chocolate' },
		{ value: '3', label: 'Strawberry' },
		{ value: '4', label: 'Cookies & Cream' }
	];
</script>

<Trigger></Trigger>
<Menu>
	<Option {options}></Option>
</Menu>
<slot />
