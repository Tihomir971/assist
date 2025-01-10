<script lang="ts">
	import { Combobox } from 'bits-ui';
	import PhOrangeSlice from '~icons/ph/orange-slice';
	import PhCaretUpDown from '~icons/ph/caret-up-down';
	import PhCaretDoubleUp from '~icons/ph/caret-double-up';
	import PhCaretDoubleDown from '~icons/ph/caret-double-down';
	import PhCheck from '~icons/ph/check';

	const fruits = [
		{ value: 'mango', label: 'Mango' },
		{ value: 'watermelon', label: 'Watermelon' },
		{ value: 'apple', label: 'Apple' },
		{ value: 'pineapple', label: 'Pineapple' },
		{ value: 'orange', label: 'Orange' },
		{ value: 'grape', label: 'Grape' },
		{ value: 'strawberry', label: 'Strawberry' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'kiwi', label: 'Kiwi' },
		{ value: 'peach', label: 'Peach' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'blueberry', label: 'Blueberry' },
		{ value: 'raspberry', label: 'Raspberry' },
		{ value: 'blackberry', label: 'Blackberry' },
		{ value: 'plum', label: 'Plum' },
		{ value: 'apricot', label: 'Apricot' },
		{ value: 'pear', label: 'Pear' },
		{ value: 'grapefruit', label: 'Grapefruit' }
	];

	let searchValue = $state('');

	const filteredFruits = $derived(
		searchValue === ''
			? fruits
			: fruits.filter((fruit) => fruit.label.toLowerCase().includes(searchValue.toLowerCase()))
	);
</script>

<Combobox.Root
	type="single"
	name="favoriteFruit"
	onOpenChange={(o) => {
		if (!o) searchValue = '';
	}}
>
	<div class="relative">
		<PhOrangeSlice class="text-muted-foreground absolute start-3 top-1/2 size-6 -translate-y-1/2" />
		<Combobox.Input
			oninput={(e) => (searchValue = e.currentTarget.value)}
			class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 w-[200px] items-center justify-between gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
			placeholder="Search a fruit"
			aria-label="Search a fruit"
		/>
		<Combobox.Trigger class="absolute end-3 top-1/2 size-6 -translate-y-1/2">
			<PhCaretUpDown class="text-muted-foreground size-6" />
		</Combobox.Trigger>
	</div>
	<Combobox.Portal>
		<Combobox.Content
			class="bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md"
			sideOffset={10}
		>
			<Combobox.ScrollUpButton class="flex w-full items-center justify-center">
				<PhCaretDoubleUp class="size-3" />
			</Combobox.ScrollUpButton>
			<Combobox.Viewport class="p-1">
				{#each filteredFruits as fruit, i (i + fruit.value)}
					<Combobox.Item
						class="rounded-button data-[highlighted]:bg-muted flex h-10 w-full items-center py-3 pr-1.5 pl-5 text-sm capitalize outline-none  select-none"
						value={fruit.value}
						label={fruit.label}
					>
						{#snippet children({ selected })}
							{fruit.label}
							{#if selected}
								<div class="ml-auto">
									<PhCheck />
								</div>
							{/if}
						{/snippet}
					</Combobox.Item>
				{:else}
					<span class="block px-5 py-2 text-sm text-muted-foreground">
						No results found, try again.
					</span>
				{/each}
			</Combobox.Viewport>
			<Combobox.ScrollDownButton class="flex w-full items-center justify-center">
				<PhCaretDoubleDown class="size-3" />
			</Combobox.ScrollDownButton>
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
