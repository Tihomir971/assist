<script lang="ts">
	import { tick } from 'svelte';

	import { useId } from 'bits-ui';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import type { SuperForm } from 'sveltekit-superforms';

	//Icons
	import X from 'lucide-svelte/icons/x';
	import PhCaretUpDown from '~icons/ph/caret-up-down';
	import PhCheck from '~icons/ph/check';

	interface Props {
		form: SuperForm<any>; // SuperForm instance
		name: string;
		arrayIndex?: number; // Optional index for array fields
		field?: string; // Optional field name for array items
		label?: string;
		description?: string;
		placeholder?: string;
		searchPlaceholder?: string;
		// Accepts both string and number values, but converts numbers to strings for HTML form compatibility
		options: Array<{ label: string; value: string | number }>;
		width?: string;
	}

	const {
		form,
		name,
		arrayIndex,
		field,
		label = '',
		description,
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
	const { form: formData } = form;

	// Handle both array and non-array fields
	const selectedOption = $derived(
		options.find((f) =>
			arrayIndex !== undefined && field
				? f.value === $formData[name][arrayIndex][field]
				: f.value === $formData[name]
		)
	);
</script>

<Form.Field {form} {name} class="flex flex-col">
	<Popover.Root bind:open>
		<Form.Control id={triggerId}>
			{#snippet children({ props })}
				{#if label}
					<Form.Label>{label}</Form.Label>
				{/if}
				<div class="flex w-full items-center">
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							width,
							'justify-between rounded-r-none',
							!$formData[name] && 'text-muted-foreground'
						)}
						role="combobox"
						{...props}
					>
						{selectedOption?.label ?? placeholder}
						<PhCaretUpDown class="opacity-50" />
					</Popover.Trigger>
					<Button
						variant="outline"
						size="icon"
						disabled={!$formData[name]}
						class="rounded-l-none"
						onclick={() => {
							arrayIndex !== undefined && field
								? ($formData[name][arrayIndex][field] = null)
								: ($formData[name] = null);
						}}
					>
						<X />
					</Button>
				</div>
				<input
					hidden
					value={arrayIndex !== undefined && field
						? $formData[name][arrayIndex][field]
						: $formData[name]}
					name={props.name}
				/>
			{/snippet}
		</Form.Control>
		<Popover.Content class={cn(width, 'p-0')}>
			<Command.Root>
				<Command.Input autofocus placeholder={searchPlaceholder} class="h-9" />
				<Command.Empty>No option found.</Command.Empty>
				<Command.Group class="max-h-80 overflow-y-auto">
					{#each options as option}
						<Command.Item
							value={option.label}
							onSelect={() => {
								if (arrayIndex !== undefined && field) {
									// Update array field
									$formData[name][arrayIndex][field] = option.value;
								} else {
									// Update regular field
									$formData[name] = option.value;
								}
								closeAndFocusTrigger(triggerId);
							}}
						>
							{option.label}
							<PhCheck
								class={cn(
									'ml-auto',
									(arrayIndex !== undefined && field
										? option.value !== $formData[name][arrayIndex][field]
										: option.value !== $formData[name]) && 'text-transparent'
								)}
							/>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
	{#if description}
		<Form.Description>
			{description}
		</Form.Description>
	{/if}
	<Form.FieldErrors />
</Form.Field>
