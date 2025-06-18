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
		// Show native confirmation dialog
		const confirmed = confirm(
			`Are you sure you want to delete this ${entityName.toLowerCase()}? This action cannot be undone.`
		);

		if (!confirmed) return;

		if (onDelete) {
			onDelete(); // Call the onDelete callback if provided
		}

		// If deleteAction is present and we have a form reference, programmatically submit
		if (deleteAction && formElement) {
			// Get the current form data to extract the ID
			const formData = new FormData(formElement);
			const id = formData.get('id');

			if (id) {
				// Create a new form specifically for the delete action with only the ID
				const deleteForm = document.createElement('form');
				deleteForm.method = 'POST';
				deleteForm.action = deleteAction;
				deleteForm.style.display = 'none';

				// Add only the ID field
				const idInput = document.createElement('input');
				idInput.type = 'hidden';
				idInput.name = 'id';
				idInput.value = id.toString();
				deleteForm.appendChild(idInput);

				// Add to DOM, submit, then remove
				document.body.appendChild(deleteForm);
				deleteForm.submit();
				document.body.removeChild(deleteForm);
			}
		}
	}
</script>

<div class="flex items-center gap-2">
	{#if showDelete && hasId}
		<Button
			type="button"
			variant="destructive"
			disabled={isSubmitting}
			onclick={handleDelete}
			class="min-w-[80px]"
		>
			{finalDeleteText}
		</Button>
	{/if}

	<Button type="submit" disabled={finalIsDisabled} class="min-w-[80px]">
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

{#if isDirty && !isSubmitting}
	<p class="mt-1 text-right text-xs text-muted-foreground">Unsaved changes</p>
{/if}
