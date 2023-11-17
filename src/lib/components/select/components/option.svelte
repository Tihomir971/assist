<script lang="ts">
	import { melt, type SelectOption, type Select, type SelectOptions } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { Check } from 'lucide-svelte';

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
		class="relative cursor-pointer rounded-lg py-1 pl-8 pr-4 text-neutral-800 hover:bg-accent focus:z-10
      focus:text-primary-700
      data-[highlighted]:bg-accent/80
      data-[highlighted]:text-text-1
      data-[disabled]:opacity-50"
		use:melt={$option({ value: item.value, label: item.label })}
	>
		<div class="check {$isSelected(item) ? 'block' : 'hidden'}">
			<Check class="square-4" />
		</div>

		{item.label}
	</div>
{/each}
