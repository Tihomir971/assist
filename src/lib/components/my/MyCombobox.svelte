<script lang="ts">
	import { tick } from 'svelte';
	import { useId } from 'bits-ui';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { cn } from '$lib/utils.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	//Icons
	import PhCaretUpDown from '~icons/ph/caret-up-down';
	import PhCheck from '~icons/ph/check';

	interface Props {
		value: string;
		placeholder?: string;
		searchPlaceholder?: string;
		options: Array<{ label: string; value: string }>;
		width?: string;
	}

	let {
		value = $bindable(),
		placeholder = 'Select option...',
		searchPlaceholder = 'Search...',
		options,
		width = 'w-full'
	}: Props = $props();

	let open = $state(false);
	const triggerId = useId();

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	// Handle both array and non-array fields
	const selectedOption = $derived(options.find((f) => f.value === value));
</script>

<Popover.Root bind:open>
	<div class="flex w-full items-center">
		<Popover.Trigger
			class={cn(buttonVariants({ variant: 'outline' }), width, 'justify-between rounded-r-none')}
			role="combobox"
		>
			{selectedOption?.label ?? placeholder}
			<PhCaretUpDown class="opacity-50" />
		</Popover.Trigger>
	</div>
	<Popover.Content class={cn(width, 'p-0')}>
		<Command.Root>
			<Command.Input autofocus placeholder={searchPlaceholder} class="h-9" />
			<Command.Empty>No option found.</Command.Empty>
			<Command.Group class="max-h-80 overflow-y-auto">
				{#each options as option}
					<Command.Item
						value={option.label}
						onSelect={() => {
							value = option.value;
							closeAndFocusTrigger(triggerId);
						}}
					>
						<PhCheck class={cn(value !== option.value && 'text-transparent')} />
						{option.label}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
