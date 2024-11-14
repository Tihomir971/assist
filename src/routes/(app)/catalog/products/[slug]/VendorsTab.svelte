<script lang="ts">
	import { browser } from '$app/environment';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		crudmProductPoSchema,
		type CrudMProductPoSchema
	} from '$lib/types/supabase/mProductPo.validator';
	import { toast } from 'svelte-sonner';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { SupabaseTable } from '$lib/types/database.types';
	import { formatNumber, formatDateTime } from '$lib/style/locale';
	import SquareArrowOutUpRight from 'lucide-svelte/icons/square-arrow-out-up-right';
	import X from 'lucide-svelte/icons/x';
	import { Button } from '$lib/components/ui/button/index.js';

	type Props = {
		data: SuperValidated<Infer<CrudMProductPoSchema>>;
		vendors: {
			id: number;
			isactive: boolean;
			barcode: string | null;
			c_bpartner_id: number;
			pricelist: number;
			vendorproductno: string;
			url: string | null;
			updated: string;
			c_bpartner: {
				name: string;
			} | null;
		}[];
		/* vendors: SupabaseTable<'m_product_po'>; */
	};
	let { data, vendors }: Props = $props();

	const formPPO = superForm(data, {
		validators: zodClient(crudmProductPoSchema),
		onUpdated({ form }) {
			console.log('Form updated', form); // Add this line for debugging
			if (form.valid) {
				toast.success('Product added successfully', {
					description: form.message
				});
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error('Failed to add product', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});
	const { form, enhance } = formPPO;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Vendor Information</Card.Title>
	</Card.Header>
	<Card.Content>
		<form method="post" action="?/mProductPo" use:enhance>
			<div class="overflow-x-auto">
				<Table.Root class="table-auto">
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-44">Updated</Table.Head>
							<Table.Head class="w-60">Partner</Table.Head>
							<Table.Head>Partner PN</Table.Head>
							<Table.Head>List Price</Table.Head>
							<Table.Head>URL</Table.Head>
							<Table.Head>Action</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each vendors as vendor}
							<Table.Row>
								<Table.Cell>{formatDateTime(vendor.updated)}</Table.Cell>
								<Table.Cell>{vendor.c_bpartner?.name}</Table.Cell>
								<Table.Cell>{vendor.vendorproductno}</Table.Cell>
								<Table.Cell
									>{formatNumber(vendor.pricelist, {
										style: 'decimal',
										fractionDigits: 2
									})}</Table.Cell
								>
								<Table.Cell>
									{#if vendor.url}
										<a href={vendor.url} target="_blank" class="btn btn-square btn-xs">
											<SquareArrowOutUpRight />
										</a>
									{/if}
								</Table.Cell>
								<!-- onclick={() => deleteProductPORow(vendor.id)} -->
								<Table.Cell>
									<Button variant="ghost" type="button">
										<X size={16} />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
						<Table.Row>
							<!-- <Table.Cell class="text-right">Add new:</Table.Cell>
							<Table.Cell>
								<Form.Field form={formPPO} name="c_bpartner_id">
									<Form.Control>
										<Select.Root
											selected={selectedVendor}
											onSelectedChange={(v) => {
												v && ($formProductPO.c_bpartner_id = v.value);
											}}
										>
											<Select.Trigger {...props}>
												<Select.Value placeholder="Select a vendor" />
											</Select.Trigger>
											<Select.Content class="max-h-80 overflow-auto">
												{#each data.c_bpartner as { value, label }}
													<Select.Item {value} {label} />
												{/each}
											</Select.Content>
										</Select.Root>
										<input
											hidden
											bind:value={$formProductPO.c_bpartner_id}
											name={attrs.name}
										/>
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							</Table.Cell>
							<Table.Cell>
								<Form.Field form={formPPO} name="vendorproductno">
									<Form.Control>
										<Input
											{...props}
											bind:value={$formProductPO.vendorproductno}
											placeholder="Enter product number..."
										/>
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							</Table.Cell> -->
							<!-- 	<Table.Cell>
								<Form.Field form={formPPO} name="pricelist">
									<Form.Control>
										<Input
											{...props}
											type="number"
											step="0.01"
											bind:value={$formProductPO.pricelist}
											placeholder="Enter price..."
										/>
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							</Table.Cell> -->
							<!-- <Table.Cell colspan={2}>
								<Form.Field form={formPPO} name="url">
									<Form.Control>
										<Input
											{...props}
											bind:value={$formProductPO.url}
											placeholder="Enter URL..."
										/>
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							</Table.Cell>
							<Table.Cell>
								<Button type="submit" variant="secondary">Add</Button>
							</Table.Cell> -->
						</Table.Row>
					</Table.Body>
				</Table.Root>
			</div>
			<input type="hidden" name="m_product_id" bind:value={$form.id} />
		</form>
	</Card.Content>
</Card.Root>
{#if browser}
	<SuperDebug data={$form} />
{/if}
