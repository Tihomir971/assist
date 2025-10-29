<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';
	import { Portal } from '@ark-ui/svelte/portal';
	import { X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		title?: string;
		description?: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'default' | 'destructive';
		open?: boolean;
		closeOnConfirm?: boolean;
		contentClass?: string;
		backdropClass?: string;
		// Optional snippet props (Svelte 5) to replace deprecated <slot> usage
		triggerContent?: Snippet;
		titleContent?: Snippet;
		descriptionContent?: Snippet;
		// Svelte 5: use callback props instead of createEventDispatcher
		onConfirm?: () => void;
		onCancel?: () => void;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		title = 'Are you sure?',
		description = '',
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		variant = 'default',
		open,
		closeOnConfirm = true,
		contentClass = 'z-50 w-full max-w-md rounded-lg bg-background p-6 shadow-lg border',
		backdropClass = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-40',
		// snippet props
		triggerContent,
		titleContent,
		descriptionContent,
		// callbacks
		onConfirm,
		onCancel,
		onOpenChange
	}: Props = $props();

	function handleOpenChange(detail: { open: boolean }) {
		onOpenChange?.(detail.open);
	}
</script>

<Dialog.Root role="alertdialog" {open} onOpenChange={handleOpenChange}>
	<Dialog.Trigger>
		{#if triggerContent}
			{@render triggerContent()}
		{:else}
			<button
				class="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-accent"
			>
				Open Alert
			</button>
		{/if}
	</Dialog.Trigger>

	<Portal>
		<Dialog.Backdrop class={backdropClass} />
		<Dialog.Positioner>
			<Dialog.Content class={contentClass}>
				<header class="flex items-start justify-between gap-4">
					<Dialog.Title class="text-lg font-semibold">
						{#if titleContent}
							{@render titleContent()}
						{:else}
							{title}
						{/if}
					</Dialog.Title>

					<Dialog.CloseTrigger
						class="inline-flex rounded-md p-1 text-muted-foreground hover:bg-muted"
						onclick={() => onCancel?.()}
					>
						<X size={16} />
					</Dialog.CloseTrigger>
				</header>

				<Dialog.Description class="mt-2 text-sm text-muted-foreground">
					{#if descriptionContent}
						{@render descriptionContent()}
					{:else}
						{description}
					{/if}
				</Dialog.Description>

				<div class="mt-6 flex justify-end gap-2">
					<Dialog.CloseTrigger
						class="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-accent"
						onclick={() => onCancel?.()}
					>
						{cancelText}
					</Dialog.CloseTrigger>

					{#if closeOnConfirm}
						<Dialog.CloseTrigger>
							<button
								type="button"
								class={`inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-white ${variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'}`}
								onclick={() => onConfirm?.()}
							>
								{confirmText}
							</button>
						</Dialog.CloseTrigger>
					{:else}
						<button
							type="button"
							class={`inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-white ${variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'}`}
							onclick={() => onConfirm?.()}
						>
							{confirmText}
						</button>
					{/if}
				</div>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog.Root>
