<script lang="ts">
	import {
		ComboboxZag,
		MyTextInput,
		MyUrlInput,
		NumberInputZag
	} from '$lib/components/my/input/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { MProductPoInsertSchema } from './schema.js'; // Add MProductPoFormSchema
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';

	type Item = { value: number; label: string };
	type Props = {
		isSheetOpen: boolean;
		data: MProductPoInsertSchema | undefined; // Use MProductPoFormSchema
		form: SuperValidated<MProductPoInsertSchema>; // Use MProductPoFormSchema
		partners: Item[];
	};
	let { isSheetOpen = $bindable(), data, form, partners }: Props = $props();
	const {
		form: formData,
		enhance,
		errors,
		constraints
	} = superForm(form, {
		onResult({ result }) {
			if (result.type === 'success') {
				console.log('Form submitted successfully:', result.data);
			} else {
				console.error('Form submission failed:', result.status);
			}
		},
		onError({ result }) {
			console.error('Form submission failed:', result.error);
		}
	});
	if (data) {
		$formData = { ...data };
	}
</script>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content class="overflow-y-auto">
		<form method="post" action="?/mProductPoUpsert" use:enhance>
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
			<MyTextInput
				name="vendorproductno"
				bind:value={$formData.vendorproductno}
				labelText="Vendor PN"
				required={$constraints?.vendorproductno?.required}
			/>
			<ComboboxZag
				name="c_bpartner_id"
				bind:value={$formData.c_bpartner_id}
				labelText="Vendor"
				items={partners}
				placeholder="Select a partner"
				required={$constraints?.c_bpartner_id?.required}
			/>
			<NumberInputZag name="pricelist" bind:value={$formData.pricelist} />
			<!-- <NumberInputZag name="pricelist" min={0} bind:value={$formData.pricelist} /> -->
			<!-- 	<MyNumberInput
				name="pricelist"
				bind:value={$formData.pricelist}
				step={0.01}
				labelText="pricelist"
			/> -->
			<MyUrlInput name="url" bind:value={$formData.url} labelText="url" />
			<Sheet.Footer class="flex gap-2 sm:flex-col">
				<Button type="submit" variant="default" class="w-full">Submit</Button>
				<SuperDebug data={formData} status />
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
