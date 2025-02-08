<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import X from 'lucide-svelte/icons/x';

	interface Props {
		options: Array<{ value: string; label: string }>;
		value: string | undefined;
		placeholder: string;
	}

	let { options, value = $bindable(), placeholder = 'Select Supplier', ...props }: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(options.find((f) => f.value === value)?.label);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<div class="w-full">
	<Popover.Root bind:open>
		<Popover.Trigger bind:ref={triggerRef}>
			{#snippet child({ props })}
				<div class="flex w-full">
					<Button
						variant="outline"
						class="w-full justify-between rounded-r-none"
						{...props}
						role="combobox"
						aria-expanded={open}
					>
						{selectedValue || 'Select a option...'}
						<ChevronsUpDown class="opacity-50" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						disabled={!value}
						class="rounded-l-none"
						onclick={() => (value = undefined)}
					>
						<X />
					</Button>
				</div>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-full p-0">
			<Command.Root>
				<Command.Input placeholder="Search option..." />
				<Command.List>
					<Command.Empty>No option found.</Command.Empty>
					<Command.Group>
						{#each options as option}
							<Command.Item
								value={option.value}
								onSelect={() => {
									value = option.value;
									closeAndFocusTrigger();
								}}
							>
								<Check class={cn(value !== option.value && 'text-transparent')} />
								{option.label}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
