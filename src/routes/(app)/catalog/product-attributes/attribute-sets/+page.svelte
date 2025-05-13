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
	import { Textarea } from '$lib/components/ui/textarea';
	import { generateCodeFromName } from '$lib/scripts/code-name-generation.js';

	let { data } = $props();

	// Pagination
	let currentPage = $derived(data.page);
	let totalPages = $derived(Math.ceil(data.count / data.perPage));
	let showingFrom = $derived((currentPage - 1) * data.perPage + 1);
	let showingTo = $derived(Math.min(showingFrom + data.perPage - 1, data.count));

	// Create form
	const createFormObj = superForm(data.createForm, {
		resetForm: true
	});
	const { form: createForm, enhance: createEnhance, errors: createErrors } = createFormObj;

	// Delete form
	const deleteFormObj = superForm(data.deleteForm, {
		resetForm: true
	});
	const { form: deleteForm, enhance: deleteEnhance } = deleteFormObj;

	// Dialog states
	let createDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	// Filter state
	let nameFilter = $derived(page.url.searchParams.get('name') || '');
	let codeFilter = $derived(page.url.searchParams.get('code') || '');
	let isActiveFilter = $derived(page.url.searchParams.get('isActive') || '');

	// Handle filter changes
	function applyFilters() {
		const params = new URLSearchParams();
		if (nameFilter) params.set('name', nameFilter);
		if (codeFilter) params.set('code', codeFilter);
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

	$effect(() => {
		if (createDialogOpen) {
			const newCode = generateCodeFromName($createForm.name);
			if (newCode !== $createForm.code) {
				$createForm.code = newCode;
			}
		}
	});
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Attribute Sets</h1>
		<Button onclick={() => (createDialogOpen = true)}>Create Attribute Set</Button>
	</div>

	<!-- Filters -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Filters</Card.Title>
			<Card.Description>Filter attribute sets by name, code, or status</Card.Description>
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
					<Label for="isActiveFilter">Status</Label>
					<Select.Root
						type="single"
						value={isActiveFilter}
						onValueChange={(value) => {
							isActiveFilter = value;
						}}
					>
						<Select.Trigger id="isActiveFilter" class="w-full">
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
			<Card.Title>Attribute Sets</Card.Title>
			<Card.Description>
				Showing {showingFrom} to {showingTo} of {data.count} attribute sets
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>ID</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Code</Table.Head>
						<Table.Head>Created</Table.Head>
						<Table.Head>Updated</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.attributeSets && data.attributeSets.length > 0}
						{#each data.attributeSets as set}
							<Table.Row>
								<Table.Cell>{set.id}</Table.Cell>
								<Table.Cell>{set.name}</Table.Cell>
								<Table.Cell>{set.code}</Table.Cell>
								<Table.Cell>{new Date(set.created_at).toLocaleString()}</Table.Cell>
								<Table.Cell>{new Date(set.updated_at).toLocaleString()}</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											href={`/catalog/product-attributes/attribute-sets/${set.id}`}
										>
											Edit
										</Button>
										<Button variant="destructive" size="sm" onclick={() => confirmDelete(set.id)}>
											Delete
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					{:else}
						<Table.Row>
							<Table.Cell colspan={6} class="py-4 text-center">No attribute sets found</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="mt-4 flex items-center justify-between">
					<div>
						Showing {showingFrom} to {showingTo} of {data.count} attribute sets
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

<!-- Create Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create Attribute Set</Dialog.Title>
			<Dialog.Description>Add a new attribute set to the system.</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/create" use:createEnhance>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="name">Name</Label>
					<Input id="name" name="name" bind:value={$createForm.name} required />
					{#if $createErrors.name}
						<p class="text-red-500">{$createErrors.name}</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="code">Code</Label>
					<Input id="code" name="code" bind:value={$createForm.code} required />
					{#if $createErrors.code}
						<p class="text-red-500">{$createErrors.code}</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						name="description"
						bind:value={$createForm.description}
						rows={3}
					/>
					{#if $createErrors.description}
						<p class="text-red-500">{$createErrors.description}</p>
					{/if}
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Create</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Deletion</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this attribute set? This action cannot be undone.
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
