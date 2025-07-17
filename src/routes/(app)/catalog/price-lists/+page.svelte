<script lang="ts">
	// Libs
	// Types
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { MProductpriceRow, Database, Tables } from '@tihomir971/assist-shared';
	// Components
	import * as TableShow from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DateHelper } from '$lib/scripts/intl';
	import { CalendarDate } from '@internationalized/date';

	let { data } = $props();

	const dateHelper = new DateHelper();

	let pricelistVersions = $state<Tables<'m_pricelist_version'>[]>([]);
	let productPrices = $state<MProductpriceRow[]>([]);

	let selectedPricelistId = $state<number | null>(null);
	let selectedVersionId = $state<number | null>(null);
	let showNewVersionDialog = $state(false);
	let showNewProductDialog = $state(false);
	let newVersion = $state({
		name: '',
		fromDate: dateHelper.format(new Date().toISOString()) ?? '',
		toDate: dateHelper.format(new Date().toISOString()) ?? ''
	});
	let newProduct = $state({ productName: '', price: '' });

	function parseDate(dateString: string): string {
		// Expects format like "DD.MM.YYYY." or "DD.MM.YYYY. HH:mm" from dateHelper.format()
		if (!dateString) {
			console.warn('parseDate received empty string, returning current ISO date');
			return new Date().toISOString();
		}

		const datePartStr = dateString.split(' ')[0]; // Get "DD.MM.YYYY."
		const parts = datePartStr.split('.');
		const filteredParts = parts.filter((p) => p.length > 0); // Handles potential trailing dot

		if (filteredParts.length !== 3) {
			console.error(
				`Invalid date string format for parsing (expected "DD.MM.YYYY." structure): "${dateString}" -> "${datePartStr}"`,
				filteredParts
			);
			return new Date().toISOString(); // Fallback
		}

		const [dayStr, monthStr, yearStr] = filteredParts;
		const day = parseInt(dayStr, 10);
		const month = parseInt(monthStr, 10);
		const year = parseInt(yearStr, 10);

		if (
			isNaN(day) ||
			isNaN(month) ||
			isNaN(year) ||
			month < 1 ||
			month > 12 ||
			day < 1 ||
			day > 31 // Basic validation
		) {
			console.error(
				`Invalid date components for parsing: D=${day}, M=${month}, Y=${year} from "${dateString}"`
			);
			return new Date().toISOString();
		}

		try {
			const calendarDate = new CalendarDate(year, month, day);
			// Assuming the date entered (like "30.12.2022.") is intended for 'Europe/Belgrade'
			return calendarDate.toDate('Europe/Belgrade').toISOString();
		} catch (error) {
			console.error(
				`Error creating CalendarDate for D=${day}, M=${month}, Y=${year} from "${dateString}":`,
				error
			);
			return new Date().toISOString();
		}
	}

	async function selectPricelist(id: number, supabase: SupabaseClient<Database>) {
		const { data } = await supabase
			.from('m_pricelist_version')
			.select('*')
			.eq('m_pricelist_id', id);
		if (data) {
			pricelistVersions = data as Tables<'m_pricelist_version'>[];
		}
		selectedPricelistId = id;
		selectedVersionId = null;
	}

	function selectVersion(id: number) {
		selectedVersionId = id;
	}

	function updatePrice(price: Tables<'m_productprice'>, supabase: SupabaseClient<Database>) {
		console.log('price', price);
		// Implement the update logic here
	}

	function updateVersionDate(
		version: Tables<'m_pricelist_version'>,
		field: 'validfrom' | 'validto',
		newDate: string
	) {
		version[field] = parseDate(newDate);
		// Implement the update logic here, e.g., call an API to update the database
	}

	function addNewVersion() {
		if (selectedPricelistId) {
			const newId = Math.max(...pricelistVersions.map((v) => v.id), 0) + 1;
			const newVersionObj: Tables<'m_pricelist_version'> = {
				id: newId,
				m_pricelist_id: selectedPricelistId,
				name: newVersion.name,
				validfrom: parseDate(newVersion.fromDate),
				validto: parseDate(newVersion.toDate),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				is_active: true,
				m_discountschema_id: 0,
				m_pricelist_version_base_id: null,
				description: null
			};
			pricelistVersions = [...pricelistVersions, newVersionObj];
			showNewVersionDialog = false;
			newVersion = {
				name: '',
				fromDate: dateHelper.format(new Date().toISOString()) ?? '',
				toDate: dateHelper.format(new Date().toISOString()) ?? ''
			};
		}
	}

	function addNewProduct() {
		if (selectedVersionId) {
			const newId = Math.max(...productPrices.map((p) => p.id), 0) + 1;
			const newProductObj: Tables<'m_productprice'> = {
				id: newId,
				m_pricelist_version_id: selectedVersionId,
				m_product_id: 0, // You might want to set this to a real product ID
				pricestd: parseFloat(newProduct.price),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				is_active: true,
				pricelimit: null,
				pricelist: null
			};
			productPrices = [...productPrices, newProductObj];
			showNewProductDialog = false;
			newProduct = { productName: '', price: '' };
		}
	}
</script>

<h1 class="mb-4 text-2xl font-bold">Pricelist Management</h1>
<div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr_2fr]">
	<Card.Root>
		<Card.Header>
			<Card.Title>Pricelists</Card.Title>
		</Card.Header>
		<Card.Content>
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
							onclick={() => selectPricelist(pricelist.id, data.supabase)}
						>
							<TableShow.Cell>{pricelist.name}</TableShow.Cell>
						</TableShow.Row>
					{/each}
				</TableShow.Body>
			</TableShow.Root>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Pricelist Versions</Card.Title>
		</Card.Header>
		<Card.Content>
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
								onclick={() => selectVersion(version.id)}
							>
								<TableShow.Cell>{version.name}</TableShow.Cell>
								<TableShow.Cell>
									<input
										type="text"
										value={dateHelper.format(version.validfrom) ?? ''}
										onchange={(e) => updateVersionDate(version, 'validfrom', e.currentTarget.value)}
										placeholder="DD.MM.YYYY. HH:mm"
										class="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
									/>
								</TableShow.Cell>
								<TableShow.Cell>
									<input
										type="text"
										value={dateHelper.format(version.validto) ?? ''}
										onchange={(e) => updateVersionDate(version, 'validto', e.currentTarget.value)}
										placeholder="DD.MM.YYYY. HH:mm"
										class="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
									/>
								</TableShow.Cell>
								<TableShow.Cell>
									<Button size="sm">Save</Button>
								</TableShow.Cell>
							</TableShow.Row>
						{/each}
					</TableShow.Body>
				</TableShow.Table>
				<Button class="mt-4" onclick={() => (showNewVersionDialog = true)}>Add New Version</Button>
			{:else}
				<p class="text-muted-foreground">Select a pricelist to view versions</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Product Prices</Card.Title>
		</Card.Header>
		<Card.Content>
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
									<Button size="sm" onclick={() => updatePrice(price, data.supabase)}>Save</Button>
								</TableShow.Cell>
							</TableShow.Row>
						{/each}
					</TableShow.Body>
				</TableShow.Table>
				<Button class="mt-4" onclick={() => (showNewProductDialog = true)}>Add New Product</Button>
			{:else}
				<p class="text-muted-foreground">Select a version to view product prices</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<Dialog.Root bind:open={showNewVersionDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add New Version</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<Input placeholder="Version Name" bind:value={newVersion.name} />
			<input
				type="text"
				bind:value={newVersion.fromDate}
				placeholder="DD.MM.YYYY. HH:mm"
				class="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			/>
			<input
				type="text"
				bind:value={newVersion.toDate}
				placeholder="DD.MM.YYYY. HH:mm"
				class="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			/>
		</div>
		<Dialog.Footer>
			<Button onclick={addNewVersion}>Add Version</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={showNewProductDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add New Product</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<Input placeholder="Product ID" bind:value={newProduct.productName} />
			<Input type="number" placeholder="Price" bind:value={newProduct.price} />
		</div>
		<Dialog.Footer>
			<Button onclick={addNewProduct}>Add Product</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
