<script lang="ts">
	import { InputTextForm, MyUrlInput } from '$lib/components/my/input/index.js';
	import { ComboboxZagForm, NumberInputZagForm } from '$lib/components/zag/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { mProductPoInsertSchema } from '$lib/types/supabase.zod.schemas.js';
	import { dev } from '$app/environment';

	type Item = { value: number; label: string };
	type Schema = z.infer<typeof mProductPoInsertSchema>;
	type Props = {
		isSheetOpen: boolean;
		data: Schema | undefined;
		form: SuperValidated<Schema>;
		partners: Item[];
	};

	let { isSheetOpen = $bindable(), data = $bindable(), form, partners }: Props = $props();
	const superform = superForm(form, {
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
	const { form: formData, enhance, message, isTainted, tainted, errors, constraints } = superform;
	if (data) {
		$formData = { ...data };
	}
</script>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content class="my-4 sm:max-w-xl">
		<form method="post" action="?/mProductPoUpsert" use:enhance>
			<Sheet.Header>
				<Sheet.Title>
					{`${$formData.id ? 'Update' : 'Create'} Product Purchase for Vendor`}
				</Sheet.Title>
				<Sheet.Description>
					This action cannot be undone. This will permanently delete your account and remove your
					data from our servers.
				</Sheet.Description>
			</Sheet.Header>
			<div class="overflow-auto">
				<input type="hidden" name="id" value={$formData.id?.toString() || ''} />
				<input type="hidden" name="m_product_id" value={$formData.m_product_id?.toString() || ''} />
				<div class="flex flex-col space-y-4 py-4">
					<InputTextForm {superform} field="vendorproductno" label="Vendor PN" />
					<ComboboxZagForm
						{superform}
						field="c_bpartner_id"
						label="Vendor"
						items={partners}
						placeholder="Select a partner"
					/>
					<NumberInputZagForm {superform} field="pricelist" label="Pricelist" fraction={2} />
					<NumberInputZagForm
						{superform}
						field="order_min"
						label="Min. order"
						fraction={0}
						min={1}
					/>
					<MyUrlInput name="url" bind:value={$formData.url} label="url" />
					<Sheet.Footer class="flex gap-2">
						<Button type="submit" variant="default" class="w-full">Save</Button>
						<Button
							type="submit"
							formaction="?/mProductPoDelete"
							variant="destructive"
							disabled={!$formData.id}
							class="w-full">Delete</Button
						>
					</Sheet.Footer>
					{#if dev}
						<SuperDebug data={{ $formData, $errors }} />
					{/if}
				</div>
			</div>
		</form>
	</Sheet.Content>
</Sheet.Root>
