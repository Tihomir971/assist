<script lang="ts">
	import { Checkbox } from '@ark-ui/svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { CheckboxGroupPropsExtended } from './types';

	let { value = $bindable(), items = $bindable() }: CheckboxGroupPropsExtended = $props();
</script>

<Checkbox.Group bind:value class="space-y-4">
	{#each items as item}
		<Checkbox.Root
			bind:checked={item.selected}
			value={item.value.toString()}
			class="flex cursor-pointer items-center gap-3"
		>
			<Checkbox.Control
				class={`flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 bg-white transition-all duration-200 data-hover:border-gray-400 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:data-hover:border-gray-400 dark:data-[state=checked]:border-blue-500 dark:data-[state=checked]:bg-blue-500`}
			>
				<Checkbox.Indicator>
					<CheckIcon class="h-3.5 w-3.5 text-white" />
				</Checkbox.Indicator>
			</Checkbox.Control>
			<Checkbox.Label class="cursor-pointer text-sm text-gray-900 dark:text-gray-100">
				{item.label}
			</Checkbox.Label>
			<Checkbox.HiddenInput />
		</Checkbox.Root>
	{/each}
</Checkbox.Group>
