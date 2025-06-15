<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from '@lucide/svelte';

	interface FormActionsProps {
		entityName: string;
		isSubmitting: boolean;
		isDirty?: boolean; // Optional, as not all forms might track dirty state initially
		showCancel?: boolean;
		onCancel?: () => void;
		saveText?: string;
		cancelText?: string;
	}

	let {
		entityName,
		isSubmitting,
		isDirty = false, // Default to false if not provided
		showCancel = true,
		onCancel,
		saveText,
		cancelText
	}: FormActionsProps = $props();

	const finalSaveText = saveText || `Save ${entityName}`;
	const finalCancelText = cancelText || 'Cancel';

	// Compute disabled state for the submit button
	let finalIsDisabled = $derived(isSubmitting || (!isDirty && entityName !== 'Filter'));
</script>

<div class="mt-6 flex items-center justify-end gap-3 border-t pt-6">
	{#if showCancel}
		<Button type="button" variant="outline" disabled={isSubmitting} onclick={onCancel}>
			{finalCancelText}
		</Button>
	{/if}

	<Button type="submit" disabled={finalIsDisabled} class="min-w-[120px]">
		{#if isSubmitting}
			<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			Saving...
		{:else}
			{finalSaveText}
		{/if}
	</Button>
</div>

{#if isDirty && !isSubmitting}
	<p class="mt-2 text-right text-xs text-muted-foreground">You have unsaved changes.</p>
{/if}
