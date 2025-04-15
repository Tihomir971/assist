<script lang="ts">
	import {
		MyComboboxMelt,
		MyNumberInput,
		MyTextInput,
		MyUrlInput
	} from '$lib/components/my/input/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { MProductPoInsertSchema } from './schema.js';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { MySelectMelt } from '$lib/components/my/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	type Props = {
		isSheetOpen: boolean;
		data: MProductPoInsertSchema | undefined;
		form: SuperValidated<MProductPoInsertSchema>;
		partners: { value: string; label: string }[];
	};
	let { isSheetOpen = $bindable(), data, form, partners }: Props = $props();
	const { form: formData, enhance, errors, constraints } = superForm(form);
	if (data) {
		$formData = { ...data };
		console.log('$fromData', $formData);
	}
</script>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content class="overflow-y-auto">
		<form method="post" action="?/mProductPoUpsert" use:enhance>
			<Sheet.Header>
				<Sheet.Title>Are you sure absolutely sure?</Sheet.Title>
				<Sheet.Description>
					This action cannot be undone. This will permanently delete your account and remove your
					data from our servers.
				</Sheet.Description>
			</Sheet.Header>
			<!-- <MyNumberInput value={$formData.id} labelText="ID" /> -->
			<input value={$formData.id} name="id" hidden />
			<input value={$formData.m_product_id} name="m_product_id" hidden />
			<MyTextInput
				name="vendorproductno"
				bind:value={$formData.vendorproductno}
				labelText="Vendor PN"
				required={$constraints?.vendorproductno?.required}
			/>
			<MyTextInput
				name="manufacturer"
				bind:value={$formData.manufacturer}
				labelText="manufacturer"
			/>

			<MySelectMelt
				name="c_bpartner_id"
				bind:value={$formData.c_bpartner_id}
				labelText="c_bpartner_id"
				options={partners}
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
			<MyTextInput value={$formData.created_at} labelText="created_at" />
			<MyTextInput value={$formData.updated_at} labelText="updated_at" />
			<MyUrlInput value={$formData.url} labelText="url" />
			<MyTextInput name="valid_from" bind:value={$formData.valid_from} labelText="valid_from" />
			<MyTextInput name="valid_to" bind:value={$formData.valid_to} labelText="valid_to" />
			<Sheet.Footer class="flex gap-2 sm:flex-col">
				<Button type="submit" variant="default" class="w-full">Submit</Button>
				<SuperDebug data={formData} />
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
