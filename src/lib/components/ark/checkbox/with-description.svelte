<script lang="ts">
	import { Checkbox } from '@ark-ui/svelte';

	import Check from '@lucide/svelte/icons/check';

	import type { CheckboxRootPropsExtended } from './types';

	let {
		checked = $bindable(),
		label,
		description,
		...restProps
	}: CheckboxRootPropsExtended = $props();
</script>

<Checkbox.Root bind:checked {...restProps} class="flex cursor-pointer items-start gap-3">
	<Checkbox.Control
		class="flex size-5 items-center justify-center rounded-xs border border-gray-300 bg-white transition-all duration-200 data-hover:border-gray-400 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:data-hover:border-gray-400 dark:data-[state=checked]:border-blue-500 dark:data-[state=checked]:bg-blue-500"
	>
		<Checkbox.Indicator>
			<Check class="size-3.5 text-white" />
		</Checkbox.Indicator>
	</Checkbox.Control>

	{#if label || description}
		<div class="flex flex-col">
			{#if label}
				<Checkbox.Label class="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100">
					{label}
				</Checkbox.Label>
			{/if}

			{#if description}
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					{description}
				</p>
			{/if}
		</div>
	{/if}
	<Checkbox.HiddenInput />
</Checkbox.Root>
