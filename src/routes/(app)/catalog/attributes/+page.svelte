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
	import { attributeTypeSchema } from '$lib/types/supabase/supabase-zod-schemas';
	import type { Enums } from '$lib/types/supabase/database.helper.js';

	let { data } = $props();

	// Pagination
	const currentPage = $state(data.page);
	const totalPages = $derived(Math.ceil(data.count / data.perPage));
	const showingFrom = $derived((currentPage - 1) * data.perPage + 1);
	const showingTo = $derived(Math.min(showingFrom + data.perPage - 1, data.count));

	// Delete form
	const deleteFormObj = superForm(data.deleteForm, {
		resetForm: true
	});
	const { form: deleteForm, enhance: deleteEnhance } = deleteFormObj;

	// Dialog states
	let deleteDialogOpen = $state(false);

	// Filter state
	let nameFilter = $state(page.url.searchParams.get('name') || '');
	let codeFilter = $state(page.url.searchParams.get('code') || '');
	let attributeTypeFilter = $state(page.url.searchParams.get('attributeType') || '');
	let attributeGroupIdFilter = $state(page.url.searchParams.get('attributeGroupId') || '');
	let isActiveFilter = $state(page.url.searchParams.get('isActive') || '');

	// Handle filter changes
	function applyFilters() {
		const params = new URLSearchParams();
		if (nameFilter) params.set('name', nameFilter);
		if (codeFilter) params.set('code', codeFilter);
		if (attributeTypeFilter) params.set('attributeType', attributeTypeFilter);
		if (attributeGroupIdFilter) params.set('attributeGroupId', attributeGroupIdFilter);
		if (isActiveFilter) params.set('isActive', isActiveFilter);
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
		<Button href="/catalog/attributes/create">Create Attribute</Button>
	</div>

	<!-- Filters -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Filters</Card.Title>
			<Card.Description>Filter attributes by name, code, type, or group</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-wrap gap-4">
				<div class="min-w-[200px] flex-1">
					<Label for="nameFilter">Name</Label>
					<Input id="nameFilter" bind:value={nameFilter} placeholder="Filter by name" />
				</div>
				<div class="min-w-[200px] flex-1">
					<Label for="codeFilter">Code</Label>
					<Input id="codeFilter" bind:value={codeFilter} placeholder="Filter by code" />
				</div>
				<div class="w-[200px]">
					<Label for="attributeTypeFilter">Type</Label>
					<Select.Root
						type="single"
						value={attributeTypeFilter}
						onValueChange={(value: string) => {
							attributeTypeFilter = value || '';
						}}
					>
						<Select.Trigger id="attributeTypeFilter">
							<span>
								{attributeTypeFilter ? getAttributeTypeDisplay(attributeTypeFilter) : 'All types'}
							</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">All types</Select.Item>
							{#each ['single_select', 'multi_select', 'text', 'number', 'boolean', 'date'] as type}
								<Select.Item value={type}>{getAttributeTypeDisplay(type)}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="w-[200px]">
					<Label for="attributeGroupFilter">Group</Label>
					<Select.Root
						type="single"
						value={attributeGroupIdFilter}
						onValueChange={(value: string) => {
							attributeGroupIdFilter = value || '';
						}}
					>
						<Select.Trigger id="attributeGroupFilter">
							<span>
								{attributeGroupIdFilter
									? data.attributeGroups.find((g) => g.id.toString() === attributeGroupIdFilter)
											?.name || 'Unknown group'
									: 'All groups'}
							</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">All groups</Select.Item>
							{#each data.attributeGroups as group}
								<Select.Item value={group.id.toString()}>{group.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="w-[200px]">
					<Label for="isActiveFilter">Status</Label>
					<Select.Root
						type="single"
						value={isActiveFilter}
						onValueChange={(value: string) => {
							isActiveFilter = value || '';
						}}
					>
						<Select.Trigger id="isActiveFilter">
							<span>
								{isActiveFilter === ''
									? 'All statuses'
									: isActiveFilter === 'true'
										? 'Active'
										: 'Inactive'}
							</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">All</Select.Item>
							<Select.Item value="true">Active</Select.Item>
							<Select.Item value="false">Inactive</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex items-end">
					<Button onclick={applyFilters}>Apply Filters</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

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
											href={`/catalog/attributes/${attribute.id}`}
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
