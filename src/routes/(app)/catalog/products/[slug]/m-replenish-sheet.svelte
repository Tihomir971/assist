<script lang="ts">
	import { InputTextForm, MyUrlInput } from '$lib/components/my/input/index.js';
	import { ComboboxZagForm, NumberInputZagForm } from '$lib/components/zag/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import type { mReplenishInsertSchema } from '$lib/types/supabase.zod.schemas.js';
	import { z } from 'zod';
	import { dev } from '$app/environment';

	type Item = { value: number; label: string };
	type Schema = z.infer<typeof mReplenishInsertSchema>;
	type Props = {
		isSheetOpen: boolean;
		data: Schema | undefined;
		validatedForm: SuperValidated<Schema>;
		warehouses: Item[];
	};
	let {
		isSheetOpen = $bindable(),
		data = $bindable(),
		validatedForm,
		warehouses
	}: Props = $props();
	const superform = superForm(validatedForm, {
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Vendor PO operation successful');
				isSheetOpen = false;
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
	<Sheet.Content class="overflow-y-auto">
		<form method="post" action="?/mReplenishUpsert" use:enhance>
			<Sheet.Header>
				<Sheet.Title
					>{`${$formData.id ? 'Update' : 'Create'} Product Purchase for Vendor`}</Sheet.Title
				>
				<Sheet.Description>
					This action cannot be undone. This will permanently delete your account and remove your
					data from our servers.
				</Sheet.Description>
			</Sheet.Header>

			<input type="hidden" name="id" value={$formData.id?.toString() || ''} />
			<input type="hidden" name="m_product_id" value={$formData.m_product_id?.toString() || ''} />
			<div class="flex flex-col space-y-4 py-4">
				<ComboboxZagForm
					{superform}
					field="m_warehouse_id"
					label="Warehouse"
					items={warehouses}
					placeholder="Select a Warehouse"
				/>
				<ComboboxZagForm
					{superform}
					field="m_warehousesource_id"
					label="Source Warehouse"
					items={warehouses}
					placeholder="Select a Warehouse"
				/>
				<NumberInputZagForm {superform} field="level_min" label="Min. Level" fraction={0} min={1} />
				<NumberInputZagForm {superform} field="level_max" label="Max. Level" fraction={0} />
				<NumberInputZagForm
					{superform}
					field="qtybatchsize"
					label="Batch size"
					fraction={0}
					min={1}
				/>

				<Sheet.Footer class="flex gap-2">
					<Button type="submit" variant="default" class="w-full">Save</Button>
					<Button
						type="submit"
						formaction="?/mReplenishDelete"
						variant="destructive"
						disabled={!$formData.id}
						class="w-full">Delete</Button
					>
				</Sheet.Footer>
				{#if dev}
					<SuperDebug data={{ $formData, $errors }} />
				{/if}
			</div>
		</form>
	</Sheet.Content>
</Sheet.Root>
