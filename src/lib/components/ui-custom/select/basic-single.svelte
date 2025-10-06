<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import type { SelectProps } from './types';

	let { value = $bindable(), items, ...restProps }: SelectProps = $props();

	const triggerContent = $derived(items.find((f) => f.value === value)?.label ?? 'Select item');
</script>

<!-- <Select.Root value={value?[value.toString()]:undefined} {...restProps}>
	<Select.Trigger class="w-[180px]">
		{triggerContent}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Label>Fruits</Select.Label>
			{#each items as item (item.value)}
				<Select.Item value={item.value} label={item.label} disabled={item.value === 'grapes'}>
					{item.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root> -->
