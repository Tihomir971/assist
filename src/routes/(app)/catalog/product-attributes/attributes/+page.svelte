<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table/index.js';
	import { superForm } from 'sveltekit-superforms/client';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { generateCodeFromName } from '$lib/scripts/code-name-generation.js';
	import type { Enums } from '$lib/types/supabase.types.js';
	import { SelectZag } from '$lib/components/zag/index.js';
	import DataTable from '$lib/components/ui/data-table.svelte';
	import { columns } from './columns.js';
	import WalkerTable from '$lib/components/walker-tx/WalkerTable.svelte';
	let { data } = $props();

	// Pagination
	const currentPage = $state(data.page);
	const totalPages = $derived(Math.ceil(data.count / data.perPage));
	const showingFrom = $derived((currentPage - 1) * data.perPage + 1);
	const showingTo = $derived(Math.min(showingFrom + data.perPage - 1, data.count));

	// Delete form
	const deleteFormObj = superForm(data.deleteForm, {
		resetForm: true,
		onResult: ({ result }) => {
			if (result.type === 'success') {
				// Close the dialog
				deleteDialogOpen = false;
			}
		}
	});
	const { form: deleteForm, enhance: deleteEnhance } = deleteFormObj;

	// Create form
	const createFormObj = superForm(data.createForm, {
		resetForm: true,
		onResult: ({ result }) => {
			if (
				result.type === 'success' &&
				result.data &&
				result.data.success &&
				result.data.attributeId
			) {
				// Close the dialog
				createDialogOpen = false;
				// Redirect to the edit page using window.location
				window.location.href = `/catalog/product-attributes/attributes/${result.data.attributeId}`;
			}
		}
	});
	const { form: createForm, errors: createErrors, enhance: createEnhance } = createFormObj;

	// Dialog states
	let deleteDialogOpen = $state(false);
	let createDialogOpen = $state(false);

	// Define attribute types
	const attributeTypes: Array<Enums<'attribute_type'>> = [
		'single_select',
		'multi_select',
		'text',
		'number',
		'boolean',
		'date'
	];
	const attributeTypeOptions = Object.entries({
		single_select: 'Single Select',
		multi_select: 'Multi Select',
		text: 'Text',
		number: 'Number',
		boolean: 'Boolean',
		date: 'Date'
	} as const satisfies Record<Enums<'attribute_type'>, string>).map(([value, label]) => ({
		value: value as Enums<'attribute_type'>,
		label
	}));
	// Track selected attribute type
	let selectedAttributeType = $state($createForm.attribute_type || 'text');

	// Update selected attribute type when form changes
	$effect(() => {
		selectedAttributeType = $createForm.attribute_type || '';
	});

	// Handle name change to update code
	function handleNameChange(event: Event) {
		const nameValue = (event.target as HTMLInputElement).value;
		$createForm.name = nameValue;

		// Only update code if it hasn't been manually modified
		if (!codeManuallyModified) {
			$createForm.code = generateCodeFromName(nameValue);
		}
	}

	// Track if code has been manually modified
	let codeManuallyModified = $state(false);
	function handleCodeChange() {
		codeManuallyModified = true;
	}

	// Check if attribute type is a selection type
	function isSelectionType(type: string) {
		return type === 'single_select' || type === 'multi_select';
	}

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

	// Handle pagination
	function goToPage(pageNum: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', pageNum.toString());
		window.location.href = `?${params.toString()}`;
	}

	// Handle delete
	function confirmDelete(id: number) {
		deleteForm.update(($form) => {
			$form.id = id;
			return $form;
		});
		deleteDialogOpen = true;
	}

	// Get attribute type display name
	function getAttributeTypeDisplay(type: string) {
		switch (type) {
			case 'single_select':
				return 'Single Select';
			case 'multi_select':
				return 'Multi Select';
			case 'text':
				return 'Text';
			case 'number':
				return 'Number';
			case 'boolean':
				return 'Boolean';
			case 'date':
				return 'Date';
			default:
				return type;
		}
	}
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Attributes</h1>
		<Button onclick={() => (createDialogOpen = true)}>Create Attribute</Button>
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
	<!-- <WalkerTable  data={data.attributesNew} /> -->
	<!-- Results -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Attributes</Card.Title>
			<Card.Description>
				Showing {showingFrom} to {showingTo} of {data.count} attributes
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>ID</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Code</Table.Head>
						<Table.Head>Type</Table.Head>
						<Table.Head>Group</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.attributes && data.attributes.length > 0}
						{#each data.attributes as attribute}
							<Table.Row>
								<Table.Cell>{attribute.id}</Table.Cell>
								<Table.Cell>{attribute.name}</Table.Cell>
								<Table.Cell>{attribute.code}</Table.Cell>
								<Table.Cell>{getAttributeTypeDisplay(attribute.attribute_type)}</Table.Cell>
								<Table.Cell>{attribute.m_attribute_group?.name || 'Unknown'}</Table.Cell>
								<Table.Cell>
									{attribute.is_active ? 'Active' : 'Inactive'}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											href={`/catalog/product-attributes/attributes/${attribute.id}`}
										>
											Edit
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onclick={() => confirmDelete(attribute.id)}
										>
											Delete
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					{:else}
						<Table.Row>
							<Table.Cell colspan={7} class="py-4 text-center">No attributes found</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="mt-4 flex items-center justify-between">
					<div>
						Showing {showingFrom} to {showingTo} of {data.count} attributes
					</div>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage <= 1}
							onclick={() => goToPage(currentPage - 1)}
						>
							Previous
						</Button>
						{#each Array(totalPages) as _, i}
							<Button
								variant={currentPage === i + 1 ? 'default' : 'outline'}
								size="sm"
								onclick={() => goToPage(i + 1)}
							>
								{i + 1}
							</Button>
						{/each}
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage >= totalPages}
							onclick={() => goToPage(currentPage + 1)}
						>
							Next
						</Button>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
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

<!-- Create Attribute Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Create Attribute</Dialog.Title>
			<Dialog.Description>Add a new attribute to the system</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createAttribute" use:createEnhance class="space-y-6">
			<!-- Basic Information -->
			<div class="grid gap-6">
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="name">Name</Label>
						<Input
							id="name"
							name="name"
							value={$createForm.name}
							oninput={handleNameChange}
							required
						/>
						{#if $createErrors.name}
							<p class="text-red-500">{$createErrors.name}</p>
						{/if}
					</div>

					<div class="grid gap-2">
						<Label for="code">Code</Label>
						<Input
							id="code"
							name="code"
							bind:value={$createForm.code}
							oninput={handleCodeChange}
							required
						/>
						<p class="text-xs text-gray-500">
							Auto-generated from name, but can be manually changed
						</p>
						{#if $createErrors.code}
							<p class="text-red-500">{$createErrors.code}</p>
						{/if}
					</div>

					<div class="grid gap-2">
						<Label for="attribute_type">Type</Label>
						<Select.Root
							type="single"
							name="attribute_type"
							value={selectedAttributeType}
							onValueChange={(value: string) => {
								selectedAttributeType = value as Enums<'attribute_type'>;
								$createForm.attribute_type = value as Enums<'attribute_type'>;
							}}
						>
							<Select.Trigger id="attribute_type" name="attribute_type">
								<span>
									{selectedAttributeType
										? getAttributeTypeDisplay(selectedAttributeType)
										: 'Select type'}
								</span>
							</Select.Trigger>
							<Select.Content>
								{#each attributeTypes as type}
									<Select.Item value={type}>{getAttributeTypeDisplay(type)}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#if $createErrors.attribute_type}
							<p class="text-red-500">{$createErrors.attribute_type}</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Hidden fields for required attributes -->
			<input type="hidden" name="attribute_group_id" value={data.attributeGroups[0]?.value || 1} />

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Create</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
