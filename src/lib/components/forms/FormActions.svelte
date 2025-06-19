<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
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

	type ActionResult = {
		type: 'success' | 'failure' | 'error';
		data?: {
			message?: {
				text: string;
			};
		};
	};

	async function handleDelete() {
		const confirmed = confirm(
			`Are you sure you want to delete this ${entityName.toLowerCase()}? This action cannot be undone.`
		);
		if (!confirmed) return;

		if (deleteAction && formElement) {
			const formData = new FormData(formElement);
			const id = formData.get('id');

			if (id) {
				const deleteFormData = new FormData();
				deleteFormData.append('id', id.toString());

				const toastId = toast.loading(`Deleting ${entityName.toLowerCase()}...`);

				try {
					const response = await fetch(deleteAction, {
						method: 'POST',
						body: deleteFormData
					});

					// Superforms actions return a result object. We check its type.
					const result: ActionResult = await response.json();

					if (result.type === 'success') {
						toast.success(`${entityName} deleted successfully.`, { id: toastId });
						// This is the key step: call the parent's onDelete handler
						// which will trigger the refresh logic.
						if (onDelete) {
							onDelete();
						}
					} else {
						// Handle failure case reported by the server action
						const message =
							result.data?.message?.text || `Failed to delete ${entityName.toLowerCase()}.`;
						toast.error(message, { id: toastId });
					}
				} catch (error) {
					toast.error(`An unexpected error occurred while deleting.`, { id: toastId });
					console.error('Delete action failed:', error);
				}
			}
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
