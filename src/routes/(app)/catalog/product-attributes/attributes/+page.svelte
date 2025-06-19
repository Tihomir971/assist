<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { superForm } from 'sveltekit-superforms/client';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { SelectZag } from '$lib/components/zag/index.js';
	import DataTable from '$lib/components/ui/data-table.svelte';
	import { columns } from './columns.js';

	let { data } = $props();

	// Pagination
	const currentPage = $state(data.page);
	const totalPages = $derived(Math.ceil(data.count / data.perPage));
	const showingFrom = $derived((currentPage - 1) * data.perPage + 1);
	const showingTo = $derived(Math.min(showingFrom + data.perPage - 1, data.count));

	// Delete form
	const { form: deleteForm, enhance: deleteEnhance } = superForm(data.deleteForm, {
		resetForm: true,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				deleteDialogOpen = false;
			}
		}
	});

	// Dialog states
	let deleteDialogOpen = $state(false);

	// Filter state
	let nameFilter = $state(page.url.searchParams.get('name') || '');
	let codeFilter = $state(page.url.searchParams.get('code') || '');
	let attributeTypeFilter = $state(page.url.searchParams.get('attributeType') || '');

	const searchParamGroupIdFilter = page.url.searchParams.get('attributeGroupId');
	let attributeGroupIdFilter = $state(
		searchParamGroupIdFilter ? parseInt(searchParamGroupIdFilter, 10) : null
	);

	const statusFilters = [
		{ value: 'true', label: 'Active' },
		{ value: 'false', label: 'Inactive' }
	];
	let isActiveFilter = $state(
		statusFilters.find((f) => f.value === page.url.searchParams.get('isActive'))?.value || null
	);

	const attributeTypeOptions = [
		{ value: 'single_select', label: 'Single Select' },
		{ value: 'multi_select', label: 'Multi Select' },
		{ value: 'text', label: 'Text' },
		{ value: 'number', label: 'Number' },
		{ value: 'boolean', label: 'Boolean' },
		{ value: 'date', label: 'Date' }
	];

	// Handle filter changes
	function applyFilters() {
		const params = new URLSearchParams();
		if (nameFilter) params.set('name', nameFilter);
		if (codeFilter) params.set('code', codeFilter);
		if (attributeTypeFilter) params.set('attributeType', attributeTypeFilter);

		if (attributeGroupIdFilter) {
			params.set('attributeGroupId', attributeGroupIdFilter.toString());
		} else {
			params.delete('attributeGroupId');
		}

		if (isActiveFilter) {
			params.set('isActive', isActiveFilter);
		} else {
			params.delete('isActive');
		}
		params.set('page', '1'); // Reset to first page when filtering
		window.location.href = `?${params.toString()}`;
	}
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Attributes</h1>
		<Button href="/catalog/product-attributes/attributes/edit">Create Attribute</Button>
	</div>

	<!-- Filters -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Filters</Card.Title>
			<Card.Description>Filter attributes by name, code, type, or group</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-5 gap-4">
				<div class="min-w-[200px] flex-1">
					<Label for="nameFilter">Name</Label>
					<Input id="nameFilter" bind:value={nameFilter} placeholder="Filter by name" />
				</div>
				<div class="min-w-[200px] flex-1">
					<Label for="codeFilter">Code</Label>
					<Input id="codeFilter" bind:value={codeFilter} placeholder="Filter by code" />
				</div>
				<div>
					<SelectZag
						bind:value={attributeTypeFilter}
						items={attributeTypeOptions}
						label="Type"
						placeholder="All types"
					/>
				</div>

				<SelectZag
					bind:value={attributeGroupIdFilter}
					items={data.attributeGroups}
					label="Group Filter"
				/>
				<SelectZag bind:value={isActiveFilter} items={statusFilters} label="Status Filter" />

				<div class="flex items-end">
					<Button onclick={applyFilters}>Apply Filters</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
	<DataTable {columns} data={data.attributesNew} />
</div>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Deletion</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this attribute? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/delete" use:deleteEnhance>
			<input type="hidden" name="id" value={$deleteForm.id} />

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (deleteDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit" variant="destructive">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
