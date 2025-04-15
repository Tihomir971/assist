<script lang="ts">
	import { MyComboboxMelt, MyNumberInput, MyTextInput } from '$lib/components/my/input/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { MProductPoInsertSchema } from './schema.js';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { map } from 'zod';
	import { MySelectMelt } from '$lib/components/my/index.js';

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
	}
</script>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content class="overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>Are you sure absolutely sure?</Sheet.Title>
			<Sheet.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</Sheet.Description>
		</Sheet.Header>
		<form method="post" use:enhance>
			<!-- <MyNumberInput value={$formData.id} labelText="ID" /> -->
			<MyTextInput
				bind:value={$formData.vendorproductno}
				labelText="Vendor PN"
				required={$constraints?.vendorproductno?.required}
			/>
			<MyTextInput bind:value={$formData.manufacturer} labelText="manufacturer" />
			<MyNumberInput bind:value={$formData.c_bpartner_id} labelText="c_bpartner_id" />
			<MySelectMelt
				bind:value={$formData.c_bpartner_id}
				labelText="c_bpartner_id"
				options={partners}
				placeholder="Select a partner"
				required={$constraints?.c_bpartner_id?.required}
			/>
			<!-- <MyComboboxMelt /> -->
			<MyNumberInput bind:value={$formData.pricelist} step={0.01} labelText="pricelist" />
			<MyTextInput bind:value={$formData.created_at} labelText="created_at" />
			<MyTextInput bind:value={$formData.updated_at} labelText="updated_at" />
			<MyTextInput bind:value={$formData.valid_from} labelText="valid_from" />
			<MyTextInput bind:value={$formData.valid_to} labelText="valid_to" />
		</form>
		<Sheet.Footer>
			<SuperDebug data={formData} />
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
