<script lang="ts">
	import { melt, type SelectOption, type Select, type SelectOptions } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';

	export let options: SelectOption[] = [
		{ value: '1', label: 'Caramel' },
		{ value: '2', label: 'Chocolate' },
		{ value: '3', label: 'Strawberry' },
		{ value: '4', label: 'Cookies & Cream' }
	];

	const {
		elements: { option },
		helpers: { isSelected }
	} = getCtx();
</script>

{#each options as item}
	<div
		class="relative cursor-pointer rounded-lg py-1 pl-8 pr-4 text-neutral-800 hover:bg-neutral-500 focus:z-10
      focus:text-neutral-700
      data-[highlighted]:bg-neutral-600/80
      data-[highlighted]:text-neutral-100
      data-[disabled]:opacity-50"
		use:melt={$option({ value: item.value, label: item.label })}
	>
		<div class="check {$isSelected(item) ? 'block' : 'hidden'}">
			<iconify-icon icon="ph:check-bold" width="4" height="4"></iconify-icon>
		</div>

		{item.label}
	</div>
{/each}
