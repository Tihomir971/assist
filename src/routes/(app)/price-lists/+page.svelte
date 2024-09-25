<script lang="ts">
	import { DateTime } from 'luxon';
	import * as TableShow from '$lib/components/ui/table/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import type { SupabaseTable } from '$lib/types/database.types.js';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { writable } from 'svelte/store';

	let { data } = $props();

	let pricelistVersions = $state<SupabaseTable<'m_pricelist_version'>['Row'][]>([]);
	let productPrices = $state<SupabaseTable<'m_productprice'>['Row'][]>([]);

	let selectedPricelistId = $state<number | null>(null);
	let selectedVersionId = $state<number | null>(null);
	let showNewVersionDialog = $state(false);
	let showNewProductDialog = $state(false);
	let newVersion = $state({
		name: '',
		fromDate: DateTime.now().setZone('Europe/Belgrade').toFormat('dd/MM/yyyy'),
		toDate: DateTime.now().setZone('Europe/Belgrade').toFormat('dd/MM/yyyy')
	});
	let newProduct = $state({ productName: '', price: '' });

	let fromStore = writable();

	function formatDate(date: string | null): string {
		return date ? DateTime.fromISO(date).setZone('Europe/Belgrade').toFormat('dd/MM/yyyy') : '';
	}

	function parseDate(dateString: string): string {
		const [day, month, year] = dateString.split('/');
		return (
			DateTime.fromObject(
				{ day: parseInt(day), month: parseInt(month), year: parseInt(year) },
				{ zone: 'Europe/Belgrade' }
			).toISO() || new Date().toISOString()
		);
	}

	async function selectPricelist(id: number, supabase: SupabaseClient) {
		const { data } = await supabase
			.from('m_pricelist_version')
			.select('*')
			.eq('m_pricelist_id', id);
		if (data) {
			console.log('data', data);
			pricelistVersions = data as SupabaseTable<'m_pricelist_version'>['Row'][];
			console.log('pricelistVersions', pricelistVersions);
		}
		selectedPricelistId = id;
		selectedVersionId = null;
	}

	function selectVersion(id: number) {
		selectedVersionId = id;
	}

	function updatePrice(price: SupabaseTable<'m_productprice'>['Row'], supabase: SupabaseClient) {
		console.log('price', price);
		// Implement the update logic here
	}

	function updateVersionDate(
		version: SupabaseTable<'m_pricelist_version'>['Row'],
		field: 'validfrom' | 'validto',
		newDate: string
	) {
		version[field] = parseDate(newDate);
		// Implement the update logic here, e.g., call an API to update the database
	}

	function addNewVersion() {
		if (selectedPricelistId) {
			const newId = Math.max(...pricelistVersions.map((v) => v.id), 0) + 1;
			const newVersionObj: SupabaseTable<'m_pricelist_version'>['Row'] = {
				id: newId,
				m_pricelist_id: selectedPricelistId,
				name: newVersion.name,
				validfrom: parseDate(newVersion.fromDate),
				validto: parseDate(newVersion.toDate),
				ad_client_id: 0, // Add default values for required fields
				ad_org_id: 0,
				created: new Date().toISOString(),
				updated: new Date().toISOString(),
				isactive: true,
				m_discountschema_id: 0,
				m_pricelist_version_base_id: null,
				description: null
			};
			pricelistVersions = [...pricelistVersions, newVersionObj];
			showNewVersionDialog = false;
			newVersion = {
				name: '',
				fromDate: DateTime.now().setZone('Europe/Belgrade').toFormat('dd/MM/yyyy'),
				toDate: DateTime.now().setZone('Europe/Belgrade').toFormat('dd/MM/yyyy')
			};
		}
	}

	function addNewProduct() {
		if (selectedVersionId) {
			const newId = Math.max(...productPrices.map((p) => p.id), 0) + 1;
			const newProductObj: SupabaseTable<'m_productprice'>['Row'] = {
				id: newId,
				m_pricelist_version_id: selectedVersionId,
				m_product_id: 0, // You might want to set this to a real product ID
				pricestd: parseFloat(newProduct.price),
				ad_client_id: 0, // Add default values for required fields
				ad_org_id: 0,
				created: new Date().toISOString(),
				updated: new Date().toISOString(),
				isactive: true,
				pricelimit: null,
				pricelist: null
			};
			productPrices = [...productPrices, newProductObj];
			showNewProductDialog = false;
			newProduct = { productName: '', price: '' };
		}
	}
</script>

<div class="mx-auto w-full p-4">
	<h1 class="mb-4 text-2xl font-bold">Pricelist Management</h1>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr_2fr]">
		<Card>
			<CardHeader>
				<CardTitle>Pricelists</CardTitle>
			</CardHeader>
			<CardContent>
				<TableShow.Root>
					<TableShow.Header>
						<TableShow.Row>
							<TableShow.Head>Name</TableShow.Head>
						</TableShow.Row>
					</TableShow.Header>
					<TableShow.Body>
						{#each data.pricelists as pricelist}
							<TableShow.Row
								class={selectedPricelistId === pricelist.id
									? 'cursor-pointer bg-muted'
									: 'cursor-pointer hover:bg-muted'}
								on:click={() => selectPricelist(pricelist.id, data.supabase)}
							>
								<TableShow.Cell>{pricelist.name}</TableShow.Cell>
							</TableShow.Row>
						{/each}
					</TableShow.Body>
				</TableShow.Root>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Pricelist Versions</CardTitle>
			</CardHeader>
			<CardContent>
				{#if pricelistVersions.length > 0}
					<TableShow.Table>
						<TableShow.Header>
							<TableShow.Row>
								<TableShow.Head>Name</TableShow.Head>
								<TableShow.Head>From</TableShow.Head>
								<TableShow.Head>To</TableShow.Head>
								<TableShow.Head>Actions</TableShow.Head>
							</TableShow.Row>
						</TableShow.Header>
						<TableShow.Body>
							{#each pricelistVersions as version}
								<TableShow.Row
									class={selectedVersionId === version.id
										? 'cursor-pointer bg-muted'
										: 'cursor-pointer hover:bg-muted'}
									on:click={() => selectVersion(version.id)}
								>
									<TableShow.Cell>{version.name}</TableShow.Cell>
									<TableShow.Cell>
										<input
											type="text"
											value={formatDate(version.validfrom)}
											onchange={(e) =>
												updateVersionDate(version, 'validfrom', e.currentTarget.value)}
											placeholder="DD/MM/YYYY"
										/>
									</TableShow.Cell>
									<TableShow.Cell>
										<input
											type="text"
											value={formatDate(version.validto)}
											onchange={(e) => updateVersionDate(version, 'validto', e.currentTarget.value)}
											placeholder="DD/MM/YYYY"
										/>
									</TableShow.Cell>
									<TableShow.Cell>
										<Button size="sm">Save</Button>
									</TableShow.Cell>
								</TableShow.Row>
							{/each}
						</TableShow.Body>
					</TableShow.Table>
					<Button class="mt-4" on:click={() => (showNewVersionDialog = true)}
						>Add New Version</Button
					>
				{:else}
					<p class="text-muted-foreground">Select a pricelist to view versions</p>
				{/if}
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Product Prices</CardTitle>
			</CardHeader>
			<CardContent>
				{#if selectedVersionId}
					<TableShow.Table>
						<TableShow.Header>
							<TableShow.Row>
								<TableShow.Head>Product ID</TableShow.Head>
								<TableShow.Head>Price</TableShow.Head>
								<TableShow.Head>Actions</TableShow.Head>
							</TableShow.Row>
						</TableShow.Header>
						<TableShow.Body>
							{#each productPrices as price}
								<TableShow.Row>
									<TableShow.Cell>{price.m_product_id}</TableShow.Cell>
									<TableShow.Cell>
										<Input type="number" value={price.pricestd?.toFixed(2)} class="w-24" />
									</TableShow.Cell>
									<TableShow.Cell>
										<Button size="sm" on:click={() => updatePrice(price, data.supabase)}
											>Save</Button
										>
									</TableShow.Cell>
								</TableShow.Row>
							{/each}
						</TableShow.Body>
					</TableShow.Table>
					<Button class="mt-4" on:click={() => (showNewProductDialog = true)}
						>Add New Product</Button
					>
				{:else}
					<p class="text-muted-foreground">Select a version to view product prices</p>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>

<Dialog bind:open={showNewVersionDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Add New Version</DialogTitle>
		</DialogHeader>
		<div class="grid gap-4 py-4">
			<Input placeholder="Version Name" bind:value={newVersion.name} />
			<input type="text" bind:value={newVersion.fromDate} placeholder="DD/MM/YYYY" />
			<input type="text" bind:value={newVersion.toDate} placeholder="DD/MM/YYYY" />
		</div>
		<DialogFooter>
			<Button on:click={addNewVersion}>Add Version</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<Dialog bind:open={showNewProductDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Add New Product</DialogTitle>
		</DialogHeader>
		<div class="grid gap-4 py-4">
			<Input placeholder="Product ID" bind:value={newProduct.productName} />
			<Input type="number" placeholder="Price" bind:value={newProduct.price} />
		</div>
		<DialogFooter>
			<Button on:click={addNewProduct}>Add Product</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
