<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Button } from '$lib/components/ui/button';
	import { DateTimeFormat, numberFormat } from '$lib/scripts/format';
	import { toast } from 'svelte-sonner';
	import SuperDebug, { superForm } from 'sveltekit-superforms';

	//	export let data: PageData;
	let { data } = $props();
	/* const { form, errors, constraints, enhance, delayed, message } = superForm(data.form, {
		resetForm: false
	}); */
	let addingProductPO = $state(false);
	let newPartnerPN = $state('');
	let newURL = $state('');
	const columns = [
		'Organization',
		'Business Partner',
		'Active',
		'GTIN',
		'Partner PN',
		'List Price',
		'Updated',
		'URL'
	];
	async function deleteProductPORow(rowToBeDeleted: number) {
		const { error } = await data.supabase.from('m_product_po').delete().eq('id', rowToBeDeleted);
		if (error) throw error;
		return;
	}
	async function handleFindProductOnWeb() {
		addingProductPO = true;
		const apiUrl = '/api/scraper/findProduct/';
		let selectElement = document.getElementsByName('bpartner')[0] as HTMLSelectElement;
		let selectedValue = selectElement.value;
		let selectedLabel = data.c_bpartner?.find(
			(partner) => partner.value === Number(selectedValue)
		)?.label;
		/* const response = fetch('https://ass-api.tihomir-d4c.workers.dev', { */
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				body: JSON.stringify({ source: selectedLabel, barcode: data.product?.barcode }),
				headers: {
					'content-type': 'application/json'
				}
			});

			if (response.status === 200) {
				const data = await response.json();
				newURL = data.path;
				newPartnerPN = data.product?.barcode ?? '';
			} else if (response.status === 204) {
				toast.warning('Product search', {
					description: `Product: "${data.product?.name}" not found!`
				});
				toast.warning(`Product:  not found!`);
			}
		} catch (error) {
			newURL = 'Unedefined';
		} finally {
			addingProductPO = false;
		}
	}
</script>

{#if data.productPurchasing}
	<div class="col-span-full w-full">
		<form
			method="post"
			action="?/mProductPo"
			use:enhance={() => {
				addingProductPO = true;

				return async ({ update }) => {
					update();
					addingProductPO = false;
				};
			}}
		>
			<Input type="text" name="m_product_id" hidden bind:value={data.productId} required />
			<div class="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							{#each columns as column}
								<Table.Head>{column}</Table.Head>
							{/each}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.productPurchasing as productPurchase}
							<Table.Row>
								<Table.Cell>Org</Table.Cell>
								<Table.Cell>{productPurchase.c_bpartner?.name}</Table.Cell>
								<Table.Cell>
									<Checkbox checked={productPurchase.isactive} />
								</Table.Cell>
								<Table.Cell>{productPurchase.barcode}</Table.Cell>
								<Table.Cell>{productPurchase.vendorproductno}</Table.Cell>
								<Table.Cell>{numberFormat(productPurchase.pricelist)}</Table.Cell>
								<Table.Cell>{DateTimeFormat(productPurchase.updated)}</Table.Cell>
								<Table.Cell
									><a href={productPurchase.url} target="_blank" class="btn btn-square btn-xs"
										><iconify-icon icon="ph:link-bold" width="24" height="24"></iconify-icon></a
									></Table.Cell
								>
								<Table.Cell>
									<Button variant="ghost" on:click={() => deleteProductPORow(productPurchase.id)}>
										<iconify-icon icon="ph:x-bold" width="24" height="24"></iconify-icon>
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
						<Table.Row>
							<Table.Cell>Add new:</Table.Cell>
							<Table.Cell class="px-0">
								<select name="c_bpartner_id" class=" w-full max-w-xs" required
									>{#if data.c_bpartner}
										{#each data.c_bpartner as { value, label }}
											<option {value}>{label}</option>
										{/each}
									{/if}
								</select>
							</Table.Cell>
							<Table.Cell></Table.Cell>
							<Table.Cell></Table.Cell>
							<Table.Cell
								><Input type="text" name="vendorproductno" bind:value={newPartnerPN} /></Table.Cell
							>
							<Table.Cell colspan={3}>
								<Input type="url" name="url" placeholder="Enter URL..." bind:value={newURL} />
							</Table.Cell>
							<Table.Cell>
								<Button type="submit" disabled={addingProductPO}
									>Add<iconify-icon icon="ph:plus-bold" width="24" height="24"
									></iconify-icon></Button
								>
								<!-- {/if} -->
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			</div>
		</form>
	</div>
{/if}
