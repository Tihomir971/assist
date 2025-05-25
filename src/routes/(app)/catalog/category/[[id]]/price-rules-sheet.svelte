<script lang="ts">
	import { InputTextForm, MyUrlInput } from '$lib/components/my/input/index.js';
	import { Combobox, NumberInputZagForm } from '$lib/components/zag/index.js';
	import * as Form from '$lib/components/ui/form/index.js';

	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type {
		mProductPoInsertSchema,
		priceRulesInsertSchema
	} from '$lib/types/supabase.zod.schemas.js';
	import { dev } from '$app/environment';

	type Item = { value: number; label: string };
	type Schema = z.infer<typeof priceRulesInsertSchema>;
	type Props = {
		isSheetOpen: boolean;
		data: Schema | undefined;
		validatedForm: SuperValidated<Schema>;
		priceFormulas: Item[];
	};

	let {
		isSheetOpen = $bindable(),
		data = $bindable(),
		validatedForm,
		priceFormulas
	}: Props = $props();
	const superform = superForm(validatedForm, {
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
	const { form, enhance, message, isTainted, tainted, errors, constraints } = superform;
	if (data) {
		$form = { ...data };
	}
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
				<div class="flex flex-col space-y-4 py-4">
					<InputTextForm {superform} field="name" label="Name" />

					<Form.Field form={superform} name="price_formula_id">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Formula script New</Form.Label>
								<Combobox {...props} bind:value={$form.price_formula_id} items={priceFormulas} />
							{/snippet}
						</Form.Control>
					</Form.Field>

					<!-- <ComboboxZagForm
						{superform}
						field="price_formula_id"
						label="Formula script"
						items={priceFormulas}
						placeholder="Select a Formula"
					/> -->
					<NumberInputZagForm {superform} field="priority" label="Priority" min={0} max={100} />
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
			{#if dev}
				<SuperDebug data={{ $form, $errors }} />
			{/if}
		</form>
	</Sheet.Content>
</Sheet.Root>
