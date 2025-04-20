<script lang="ts">
	import {
		ComboboxZag,
		MyNumberInput,
		MyTextInput,
		MyUrlInput
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
				// Handle success, e.g., show a success message or redirect
				console.log('Form submitted successfully:', result.data);
			} else {
				// Handle error, e.g., show an error message
				console.error('Form submission failed:', result.status);
			}
		},
		onError({ result }) {
			// Handle error, e.g., show an error message
			console.error('Form submission failed:', result.error);
		}
	});
	if (data) {
		$formData = { ...data };
		console.log('$fromData', $formData);
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
			<!-- <MyTextInput
				name="manufacturer"
				bind:value={$formData.manufacturer}
				labelText="manufacturer"
			/> -->
			<!-- <ComboboxMelt value={$formData.c_bpartner_id.toString()} options={partners} /> -->
			<ComboboxZag
				name="c_bpartner_id"
				bind:value={$formData.c_bpartner_id}
				labelText="Vendor"
				items={partners}
				placeholder="Select a partner"
				required={$constraints?.c_bpartner_id?.required}
			/>
			<!-- <MyComboboxMelt /> -->
			<MyNumberInput
				name="pricelist"
				bind:value={$formData.pricelist}
				step={0.01}
				labelText="pricelist"
			/>
			<!-- <MyTextInput value={$formData.created_at} labelText="created_at" /> -->
			<!-- <MyTextInput value={$formData.updated_at} labelText="updated_at" /> -->
			<MyUrlInput name="url" bind:value={$formData.url} labelText="url" />
			<!-- <MyTextInput name="valid_from" bind:value={$formData.valid_from} labelText="valid_from" /> -->
			<!-- <MyTextInput name="valid_to" bind:value={$formData.valid_to} labelText="valid_to" /> -->
			<Sheet.Footer class="flex gap-2 sm:flex-col">
				<Button type="submit" variant="default" class="w-full">Submit</Button>
				<SuperDebug data={formData} status />
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
