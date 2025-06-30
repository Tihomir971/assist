<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Loader from '@lucide/svelte/icons/loader';

	interface FormActionsProps {
		entityName: string;
		isSubmitting: boolean;
		isDirty?: boolean; // Optional, as not all forms might track dirty state initially
		showCancel?: boolean;
		showDelete?: boolean;
		onCancel?: () => void;
		onDelete?: () => void;
		onReset?: () => void;
		saveText?: string;
		cancelText?: string;
		deleteText?: string;
		deleteAction?: string; // Form action for delete (e.g., "?/categoryDelete")
		hasId?: boolean; // Whether the entity has an ID (for edit mode)
		formElement?: HTMLFormElement; // Reference to the form element for programmatic submission
	}

	let {
		entityName,
		isSubmitting,
		isDirty = false, // Default to false if not provided
		showCancel = true,
		showDelete = false,
		onCancel,
		onDelete,
		onReset,
		saveText,
		cancelText,
		deleteText,
		deleteAction,
		hasId = false,
		formElement
	}: FormActionsProps = $props();

	const finalSaveText = saveText || `Save`;
	// const finalSaveText = saveText || `Save ${entityName}`;
	const finalCancelText = cancelText || 'Cancel';
	const finalDeleteText = deleteText || `Delete`;
	// const finalDeleteText = deleteText || `Delete ${entityName}`;

	// Compute disabled state for the submit button
	let finalIsDisabled = $derived(isSubmitting || (!isDirty && entityName !== 'Filter'));

	function handleDelete() {
		const confirmed = confirm(
			`Are you sure you want to delete this ${entityName.toLowerCase()}? This action cannot be undone.`
		);
		if (!confirmed) return;

		// Change the form's action to the delete action and submit
		if (deleteAction && formElement) {
			const originalAction = formElement.action;
			formElement.action = deleteAction;

			// Create a hidden input to indicate this is a delete operation
			const deleteInput = document.createElement('input');
			deleteInput.type = 'hidden';
			deleteInput.name = '_delete';
			deleteInput.value = 'true';
			formElement.appendChild(deleteInput);

			// Submit the form
			formElement.requestSubmit();

			// Clean up - restore original action and remove delete input
			formElement.action = originalAction;
			formElement.removeChild(deleteInput);
		}
	}
</script>

<div class="flex items-center gap-2 *:w-16">
	{#if onReset && isDirty}
		<Button type="button" variant="outline" size="sm" disabled={isSubmitting} onclick={onReset}>
			Reset
		</Button>
	{/if}
	{#if showDelete && hasId}
		<Button
			type="button"
			variant="destructive"
			size="sm"
			disabled={isSubmitting}
			onclick={handleDelete}
		>
			{finalDeleteText}
		</Button>
	{/if}

	<Button type="submit" disabled={finalIsDisabled} size="sm">
		{#if isSubmitting}
			<Loader class="mr-2 h-3 w-3 animate-spin" />
			Saving...
		{:else}
			{finalSaveText}
		{/if}
	</Button>

	{#if showCancel}
		<Button type="button" variant="link" size="sm" disabled={isSubmitting} onclick={onCancel}>
			{finalCancelText}
		</Button>
	{/if}
</div>
