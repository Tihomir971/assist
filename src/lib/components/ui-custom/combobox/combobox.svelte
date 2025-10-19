<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { ComboboxItem } from './combobox.types.js';

	// Component props using Svelte 5 runes
	interface Props {
		value?: string | number;
		items?: ComboboxItem[];
		placeholder?: string;
		searchPlaceholder?: string;
		width?: string;
		emptyMessage?: string;
		disabled?: boolean;
		className?: string;
		onSelect?: (value: string) => void;
		label?: string;
		name?: string;
		id?: string;
		required?: boolean;
		'aria-invalid'?: boolean | 'false' | 'true';
	}

	let {
		value = $bindable(''),
		items = $bindable([]),
		placeholder = 'Select an item...',
		searchPlaceholder = 'Search items...',
		width = '200px',
		emptyMessage = 'No items found.',
		disabled = false,
		className = '',
		onSelect,
		label,
		name,
		id,
		required = false,
		'aria-invalid': ariaInvalid = undefined
	}: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// Generate a unique ID if not provided
	const triggerId = $props.id();
	const comboboxId = $derived(id || `combobox-${id || triggerId}`);

	// Find the selected item based on the value
	const selectedItem = $derived(items.find((item) => item.value === String(value))?.label);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	// Handle item selection
	function handleSelect(itemValue: string) {
		value = itemValue;
		closeAndFocusTrigger();
		// Call the custom onSelect callback if provided
		if (onSelect) {
			onSelect(itemValue);
		}
	}
</script>

{#if label}
	<label
		for={comboboxId}
		class="mb-2 block text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
	>
		{label}
		{#if required}
			<span class="text-destructive">*</span>
		{/if}
	</label>
{/if}

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				id={comboboxId}
				variant="outline"
				class={cn('justify-between', className, disabled && 'cursor-not-allowed opacity-50')}
				style="width: {width};"
				role="combobox"
				aria-expanded={open}
				{disabled}
				aria-required={required}
				aria-invalid={ariaInvalid}
			>
				{selectedItem || placeholder}
				<ChevronsUpDownIcon class="opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="p-0" style="width: {width};">
		<Command.Root>
			<Command.Input placeholder={searchPlaceholder} />
			<Command.List>
				<Command.Empty>{emptyMessage}</Command.Empty>
				<Command.Group>
					{#each items as item (item.value)}
						<Command.Item value={item.value} onSelect={() => handleSelect(item.value)}>
							<CheckIcon class={cn(String(value) !== item.value && 'text-transparent')} />
							{item.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

<!-- Hidden input for form submission -->
{#if name}
	<input type="hidden" {name} {value} {required} />
{/if}
