<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';
	import type { ComboboxInputProps } from '$lib/types/form-config.types';

	interface SmartComboboxProps {
		field: AnalyzedFieldConfig & {
			componentProps?: Partial<ComboboxInputProps>;
		}; // Configuration for this field
		value: string | number | null | undefined; // Bound value
		[key: string]: any; // Allow additional props from Form.Control
	}

	let { field, value = $bindable(), ...restProps }: SmartComboboxProps = $props();

	// Extract properties from field configuration
	const options = $derived(field.componentProps?.options || []);
	const placeholder = $derived(
		field.placeholder || field.componentProps?.searchPlaceholder || 'Select an option...'
	);
	const disabled = $derived(field.disabled || false);
	const readonly = $derived(field.readonly || false);
	const searchable = $derived(field.componentProps?.searchable !== false);

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// Find the selected option
	const selectedOption = $derived(options.find((option) => option.value === value));

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	function selectOption(optionValue: number | string | null) {
		value = optionValue;
		closeAndFocusTrigger();
	}

	function clearSelection() {
		selectOption(null);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				{...restProps}
				variant="outline"
				class={cn('w-full justify-between', !selectedOption && 'text-muted-foreground')}
				role="combobox"
				aria-expanded={open}
				{disabled}
			>
				{selectedOption?.label ?? placeholder}
				<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-full p-0">
		<Command.Root>
			{#if searchable}
				<Command.Input
					placeholder={field.componentProps?.searchPlaceholder || 'Search options...'}
					class="h-9"
				/>
			{/if}
			<Command.List>
				<Command.Empty>{field.componentProps?.noResultsText || 'No option found.'}</Command.Empty>
				<Command.Group>
					{#if value !== null && value !== undefined && field.componentProps?.clearable !== false}
						<Command.Item value="__clear__" onSelect={clearSelection} class="text-muted-foreground">
							<CheckIcon class="mr-2 size-4 opacity-0" />
							Clear selection
						</Command.Item>
					{/if}
					{#each options as option (option.value)}
						<Command.Item value={option.label} onSelect={() => selectOption(option.value)}>
							<CheckIcon class={cn('mr-2 size-4', value !== option.value && 'text-transparent')} />
							<div class="flex flex-col">
								<span>{option.label}</span>
								{#if option.description}
									<span class="text-xs text-muted-foreground">
										{option.description}
									</span>
								{/if}
							</div>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

<!-- Hidden input for form submission - follows shadcn-svelte pattern -->
<input hidden value={value ?? ''} name={restProps.name} />
