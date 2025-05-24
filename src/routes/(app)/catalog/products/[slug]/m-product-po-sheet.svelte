<script lang="ts">
	import { InputTextForm, MyUrlInput } from '$lib/components/my/input/index.js';
	import {
		ComboboxNewZag,
		ComboboxZagForm,
		NumberInputZagForm
	} from '$lib/components/zag/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Field, Control, Label, FieldErrors } from 'formsnap';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { mProductPoInsertSchema } from '$lib/types/supabase.zod.schemas.js';
	import { dev } from '$app/environment';

	type Item = { value: number; label: string };
	type Schema = z.infer<typeof mProductPoInsertSchema>;
	type Props = {
		isSheetOpen: boolean;
		data: Schema | undefined;
		validatedForm: SuperValidated<Schema>;
		partners: Item[];
	};

	let { isSheetOpen = $bindable(), data = $bindable(), validatedForm, partners }: Props = $props();
	const superform = superForm(validatedForm, {
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Vendor PO operation successful');
				isSheetOpen = false; // Close the sheet after successful submission
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
	<Sheet.Content>
		<form method="post" action="?/mProductPoUpsert" use:enhance>
			<Sheet.Header>
				<Sheet.Title>
					{`${$form.id ? 'Update' : 'Create'} Product Purchase for Vendor`}
				</Sheet.Title>
				<Sheet.Description>This will create or update Purchase for Vendor.</Sheet.Description>
			</Sheet.Header>
			<div class="grid flex-1 auto-rows-min gap-3 px-4">
				<input type="hidden" name="id" value={$form.id?.toString() || ''} />
				<input type="hidden" name="m_product_id" value={$form.m_product_id?.toString() || ''} />
				<InputTextForm {superform} field="vendorproductno" label="Vendor PN" />
				<ComboboxZagForm
					{superform}
					field="c_bpartner_id"
					label="Vendor"
					items={partners}
					placeholder="Select a partner"
				/>
				<NumberInputZagForm {superform} field="pricelist" label="Pricelist" fraction={2} />
				<NumberInputZagForm {superform} field="order_min" label="MOQ" fraction={0} min={1} />
				<MyUrlInput name="url" bind:value={$form.url} label="URL" />

				<!-- Updated to use formsnap with proper styling -->
				<Field form={superform} name="c_bpartner_id">
					<Control>
						{#snippet children({ props })}
							<div class="form-control">
								<Label>Vendor</Label>
								<ComboboxNewZag
									{...props}
									bind:value={$form.c_bpartner_id}
									items={partners}
									placeholder="Select a partner"
								/>
							</div>
						{/snippet}
					</Control>
					<FieldErrors class="text-sm font-medium text-destructive" />
				</Field>
			</div>
			<Sheet.Footer>
				<Button type="submit" variant="default" class="w-full">Save</Button>
				<Button
					type="submit"
					formaction="?/mProductPoDelete"
					variant="destructive"
					disabled={!$form.id}
					>Delete
				</Button>
				{#if dev}
					<SuperDebug data={{ $form, $errors }} />
				{/if}
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
