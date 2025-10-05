<script lang="ts" generics="T extends SelectItem">
	import { Portal } from '@ark-ui/svelte/portal';
	import { Select, createListCollection } from '@ark-ui/svelte/select';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { SelectItem, SelectProps } from './types';

	let {
		value = $bindable(),
		items,
		readonly,
		label,
		placeholder,
		...restProps
	}: SelectProps<T> = $props();

	const collection = $derived(
		createListCollection<SelectItem>({
			items: items,
			itemToValue: (item) => item.value.toString(),
			isItemDisabled: (item) => item.disabled === true
		})
	);

	let selectedItemData = $derived(items.find((item) => item.value === value));
</script>

<div class="w-full max-w-sm">
	<Select.Root
		{collection}
		{...restProps}
		deselectable
		value={value ? [value.toString()] : []}
		onValueChange={(valueChangeDetails) => {
			console.log(valueChangeDetails.value);
			value = valueChangeDetails.items[0].value;
			if (restProps.onValueChange) {
				restProps.onValueChange(valueChangeDetails);
			}
		}}
		{placeholder}
		class="grid gap-2"
	>
		{#if label}
			<Select.Label>
				{label}
				<span class="text-destructive">*</span>
			</Select.Label>
		{/if}
		<Select.Control>
			<Select.Trigger
				class="flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground shadow-sm focus:ring-1 focus:ring-ring focus:outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
			>
				<div class="flex items-center gap-2">
					{#if selectedItemData}
						<!-- <span class="text-lg">{selectedItemData.flag}</span> -->
					{/if}
					<Select.ValueText
						placeholder="Select a item"
						class={value ? '' : 'text-muted-foreground'}
					/>
				</div>
				<Select.Indicator>
					<ChevronDownIcon class="h-4 w-4 opacity-50" />
				</Select.Indicator>
			</Select.Trigger>
			<Select.ClearTrigger class="mt-1 text-sm text-muted-foreground hover:text-foreground">
				Clear
			</Select.ClearTrigger>
		</Select.Control>
		<Portal>
			<Select.Positioner>
				<Select.Content
					class="z-50 max-h-60 min-w-(--reference-width) overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
				>
					<Select.ItemGroup>
						{#each items as item}
							<Select.Item
								{item}
								class="relative flex cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm text-accent-foreground select-none data-highlighted:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-accent"
							>
								<Select.ItemText>{item.label}</Select.ItemText>
								<Select.ItemIndicator class="absolute right-2 items-center justify-center">
									<CheckIcon class="size-3.5" />
								</Select.ItemIndicator>
							</Select.Item>
						{/each}
					</Select.ItemGroup>
				</Select.Content>
			</Select.Positioner>
		</Portal>
		<input type="hidden" name={restProps.name} value={value ?? ''} />
		<!-- <Select.HiddenSelect /> -->
	</Select.Root>
</div>
