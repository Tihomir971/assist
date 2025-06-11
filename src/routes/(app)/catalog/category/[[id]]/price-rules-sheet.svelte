<script lang="ts">
	import { ComboboxZag, NumberInputZag } from '$lib/components/zag/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { ListCollection } from '@zag-js/collection';

	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { priceRulesInsertSchema } from '$lib/types/supabase.zod.schemas.js';
	import { dev } from '$app/environment';
	import { DateHelper } from '$lib/scripts/intl';

	type ListItem = { value: number; label: string };
	type Schema = z.infer<typeof priceRulesInsertSchema>;
	type Props = {
		isSheetOpen: boolean;
		item: Schema | undefined;
		parentId: number | undefined;
		validatedForm: SuperValidated<Schema>;

		priceFormulas: ListItem[];
	};

	let {
		isSheetOpen = $bindable(),
		item = $bindable(),
		validatedForm,
		priceFormulas,
		parentId
	}: Props = $props();
	const collection = new ListCollection({
		items: priceFormulas,
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value.toString()
	});
	const superform = superForm(validatedForm, {
		onSubmit: async ({ formData }) => {
			formData.delete('created_at');
			formData.delete('updated_at');
		},
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Vendor PO operation successful');
				isSheetOpen = false;
				// invalidate('catalog:products');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error(form.message || 'Vendor PO operation failed');
			}
		},
		onError({ result }) {
			console.error('Form submission failed:', result.error);
		}
	});
	const { form, enhance, errors } = superform;

	const dateHelper = new DateHelper();
	$effect(() => {
		if (isSheetOpen) {
			if (item) {
				$form = { ...item };
			} else {
				const newEntryState = { ...validatedForm.data };
				newEntryState.id = undefined;
				newEntryState.m_product_category_id = parentId;
				$form = newEntryState;
			}
		}
	});
</script>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content class="sm:max-w-xl">
		<form method="post" action="?/priceRulesUpsert" use:enhance>
			<Sheet.Header>
				<Sheet.Title>
					{`${$form.id ? 'Update' : 'Create'} Price rule for Category`}
				</Sheet.Title>
				<Sheet.Description>
					This action cannot be undone. This will permanently delete your account and remove your
					data from our servers.
				</Sheet.Description>
			</Sheet.Header>
			<div class="overflow-auto px-4">
				<input type="hidden" name="id" value={$form.id?.toString() || ''} />
				<input type="hidden" name="m_product_id" value={$form.m_product_id?.toString() || ''} />
				<input
					type="hidden"
					name="m_product_category_id"
					value={$form.m_product_category_id?.toString() || ''}
				/>
				<div class="flex flex-col space-y-4 py-4">
					<Form.Field form={superform} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$form.name} />
							{/snippet}
						</Form.Control>
					</Form.Field>
					<Form.Field form={superform} name="price_formula_id">
						<Form.Control>
							{#snippet children({ props })}
								<ComboboxZag
									{...props}
									bind:value={$form.price_formula_id}
									items={priceFormulas}
									label="Formula script New"
								/>
							{/snippet}
						</Form.Control>
					</Form.Field>

					<Form.Field form={superform} name="priority">
						<Form.Control>
							{#snippet children({ props })}
								<NumberInputZag
									{...props}
									bind:value={$form.priority}
									label="Priority"
									fraction={0}
								/>
							{/snippet}
						</Form.Control>
					</Form.Field>
					{#if $form.created_at}
						<Form.Field form={superform} name="created_at">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Created at</Form.Label>
									<Input {...props} value={dateHelper.format($form.created_at)} readonly />
								{/snippet}
							</Form.Control>
						</Form.Field>
					{/if}
					{#if $form.updated_at}
						<Form.Field form={superform} name="updated_at">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Updated at</Form.Label>
									<Input {...props} value={dateHelper.format($form.updated_at)} readonly />
								{/snippet}
							</Form.Control>
						</Form.Field>
					{/if}
				</div>
			</div>
			<Sheet.Footer>
				<Button type="submit" variant="default">Save</Button>
				<Button
					type="submit"
					formaction="?/priceRulesDelete"
					variant="destructive"
					disabled={!$form.id}
				>
					Delete
				</Button>
			</Sheet.Footer>

			<SuperDebug data={{ $form, $errors }} display={dev} />
		</form>
	</Sheet.Content>
</Sheet.Root>
