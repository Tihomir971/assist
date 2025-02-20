<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { CrudMProductGtinSchema } from './schema';
	import * as Table from '$lib/components/ui/table/index.js';

	type Props = {
		form: SuperValidated<CrudMProductGtinSchema>;
		productId: number;
		packageTypes: {
			value: number;
			label: string;
		}[];
	};
	let data: Props = $props();
	const { form, errors } = superForm(data.form, {
		dataType: 'json',
		warnings: {
			duplicateId: false
		}
	});

	function selectedPackageTypeLabel(value: number | null | undefined): string {
		if (value === null || value === undefined) return '';
		return data.packageTypes?.find((v) => v.value === value)?.label ?? '';
	}
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Package Type</Table.Head>
			<Table.Head>Units per Pack</Table.Head>
			<Table.Head class="text-right">Barcode</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each $form.productPacking as _, i}
			<Table.Row>
				<Table.Cell>
					{selectedPackageTypeLabel($form.productPacking[i].m_product_packing_type_id)}
				</Table.Cell>

				<Table.Cell>{$form.productPacking[i].unitsperpack}</Table.Cell>
				<Table.Cell>{$form.productPacking[i].gtin}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
