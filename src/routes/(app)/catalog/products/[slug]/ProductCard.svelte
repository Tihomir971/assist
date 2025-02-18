<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import PhDotsThree from '~icons/ph/dots-three';
	import PhPackage from '~icons/ph/package';

	// Define types for the props
	type ProductFormData = {
		id: number | string;
		name: string;
		sku: string;
		mpn: string;
		isactive: boolean;
		isselfservice: boolean;
		discontinued: boolean;
		unitsperpack: number;
		unitsperpallet: number;
		net_qty_uom_id: string | number;
		shelf_life: number;
	};

	type Barcode = {
		gtin: string;
	};

	type ProductCardProps = {
		formProduct: ProductFormData;
		selectedUomLabel?: string;
		selectedTaxLabel?: string;
		selectedCategoryLabel?: string;
		openDrawer: () => void;
		data: {
			barcodes: Barcode[];
		};
	};

	let {
		formProduct,
		selectedUomLabel,
		selectedTaxLabel,
		selectedCategoryLabel,
		openDrawer,
		data
	}: ProductCardProps = $props();
</script>

<Card.Root class="mb-8">
	<Card.Header class="flex flex-row items-center justify-between border-b">
		<div>
			<Card.Title class="flex items-center gap-2 text-3xl font-bold">
				<PhPackage class="h-8 w-8" />
				{formProduct.name}
			</Card.Title>
			<Card.Description class="text-lg">Product ID: {formProduct.id}</Card.Description>
		</div>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button variant="ghost" size="icon">
					<PhDotsThree />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item onclick={openDrawer}>Edit</DropdownMenu.Item>
				<DropdownMenu.Item>Delete</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Card.Header>
	<Card.Content>
		<div class="mb-4 flex flex-wrap gap-4">
			<div class="mb-4 flex flex-wrap gap-4">
				<Badge variant={formProduct.isactive ? 'default' : 'secondary'}>
					{formProduct.isactive ? 'Active' : 'Inactive'}
				</Badge>
				<Badge variant={formProduct.isselfservice ? 'default' : 'secondary'}>
					{formProduct.isselfservice ? 'Self Service' : 'Not Self Service'}
				</Badge>
				<Badge variant={formProduct.discontinued ? 'destructive' : 'secondary'}>
					{formProduct.discontinued ? 'Discontinued' : 'Not Discontinued'}
				</Badge>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div>
				<h3 class="mb-2 text-lg font-semibold">Basic Information</h3>
				<Table.Root>
					<Table.Body>
						<Table.Row>
							<Table.Cell class="font-medium">SKU</Table.Cell>
							<Table.Cell>{formProduct.sku}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="font-medium">MPN</Table.Cell>
							<Table.Cell>{formProduct.mpn}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="font-medium">UOM</Table.Cell>
							<Table.Cell>{selectedUomLabel ?? 'N/A'}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="font-medium">Tax</Table.Cell>
							<Table.Cell>{selectedTaxLabel ?? 'N/A'}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="font-medium">Category</Table.Cell>
							<Table.Cell>{selectedCategoryLabel ?? 'N/A'}</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			</div>
			<div>
				<h3 class="mb-2 text-lg font-semibold">Packaging Information</h3>
				<Table.Root>
					<Table.Body>
						<Table.Row>
							<Table.Cell class="font-medium">Units per Pack</Table.Cell>
							<Table.Cell>{formProduct.unitsperpack}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="font-medium">Units per Pallet</Table.Cell>
							<Table.Cell>{formProduct.unitsperpallet}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="font-medium">Net Quantity</Table.Cell>
							<Table.Cell>{formProduct.net_qty_uom_id}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="font-medium">Shelf Life</Table.Cell>
							<Table.Cell>{formProduct.shelf_life}</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			</div>
			<div>
				<h3 class="mb-2 text-lg font-semibold">Barcodes2</h3>
				<ul class="list-inside list-disc space-y-2">
					{#each data.barcodes as barcode}
						<li class="flex items-center gap-2">
							<PhPackage />
							hello
							{barcode.gtin}
							{barcode.gtin}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</Card.Content>
</Card.Root>
