<script lang="ts">
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AnyZodObject, z } from 'zod';
	import type { RelatedTableConfig } from '$lib/types/related-table-config.types';

	// UI Components
	import * as Sheet from '$lib/components/ui/sheet/index.js';

	// Smart Form Integration
	import SmartForm from './SmartForm.svelte';

	interface SmartRelatedDrawerProps<T extends Record<string, any>, S extends AnyZodObject> {
		isOpen: boolean;
		config: RelatedTableConfig<T, S>;
		item: T | undefined;
		validatedForm: SuperValidated<z.infer<S>>;
		parentId: number | undefined;
		lookupData?: Record<string, Array<{ value: any; label: string }>>;
		onClose?: () => void;
		onSave?: () => void;
	}

	let {
		isOpen = $bindable(),
		config,
		item = $bindable(),
		validatedForm,
		parentId,
		lookupData = {},
		onClose,
		onSave
	}: SmartRelatedDrawerProps<any, any> = $props();

	// Determine if we're creating or editing
	let isCreateMode = $derived(!item?.id);

	// Create a reactive form object that updates when the item changes.
	// This is the key to populating the form for editing.
	const formToRender = $derived.by(() => {
		if (item) {
			// Edit mode: Use the selected item's data.
			// We clone the validatedForm and inject the item's data into it.
			return { ...validatedForm, data: { ...item } };
		} else {
			// Create mode: Use the default form data, but ensure the parent ID is set.
			const newFormData = { ...validatedForm.data };
			if (config.parentIdField) {
				newFormData[config.parentIdField] = parentId;
			}
			return { ...validatedForm, data: newFormData };
		}
	});

	// Enhanced form config for the drawer
	let drawerFormConfig = $derived.by(() => {
		if (!config.formConfig) return undefined;

		// Clone the config to avoid mutations
		const enhancedConfig = JSON.parse(JSON.stringify(config.formConfig));

		// Merge lookup data into field options
		if (enhancedConfig.fieldOverrides && lookupData) {
			Object.entries(enhancedConfig.fieldOverrides).forEach(
				([fieldName, fieldConfig]: [string, any]) => {
					if (fieldConfig.type === 'combobox' || fieldConfig.type === 'select') {
						// Try multiple lookup strategies
						const lookupKeys = [
							fieldName.replace('_id', ''), // Convert field_id to field
							fieldName.replace('_id', 's'), // Convert field_id to fields (plural)
							fieldName // Use exact field name
						];

						for (const lookupKey of lookupKeys) {
							if (lookupData[lookupKey]) {
								fieldConfig.options = lookupData[lookupKey];
								break;
							}
						}
					}
				}
			);
		}

		return enhancedConfig;
	});

	// Event handlers
	function handleSuccess(formData: any) {
		console.log(`${config.title} ${isCreateMode ? 'created' : 'updated'} successfully`);
		onSave?.();
		onClose?.();
	}

	function handleError(error: string | null) {
		console.error(`Failed to ${isCreateMode ? 'create' : 'update'} ${config.title}:`, error);
	}

	function handleCancel() {
		onClose?.();
	}

	function handleDelete() {
		console.log(`${config.title} delete initiated`);
		// Delete handling is managed by SmartForm
	}
</script>

<Sheet.Root bind:open={isOpen}>
	<Sheet.Content class="sm:max-w-2xl">
		<Sheet.Header>
			<Sheet.Title>
				{isCreateMode ? `Create ${config.title}` : `Edit ${config.title}`}
			</Sheet.Title>
			{#if config.description}
				<Sheet.Description>
					{config.description}
				</Sheet.Description>
			{/if}
		</Sheet.Header>

		<div class="flex-1 overflow-auto px-4">
			<SmartForm
				form={formToRender}
				schema={config.formSchema}
				action={isCreateMode
					? config.createAction || '?/create'
					: config.updateAction || '?/update'}
				entityName={config.title}
				config={drawerFormConfig}
				onSuccess={handleSuccess}
				onError={handleError}
				onCancel={handleCancel}
				onDelete={config.canDelete ? handleDelete : undefined}
				deleteAction={config.deleteAction}
			/>
		</div>
	</Sheet.Content>
</Sheet.Root>
