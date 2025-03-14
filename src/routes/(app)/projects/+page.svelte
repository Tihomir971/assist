<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import SuperDebug from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { packingInsertSchema } from './schema';

	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	import * as Table from '$lib/components/ui/table/index.js';
	import * as Form from '$lib/components/ui/form/index.js';

	import MySelectForm from '$lib/components/my/MySelectForm.svelte';

	import LoaderCircle from 'lucide-svelte/icons/loader-circle';

	let { data } = $props();
	const form = superForm(data.form, {
		validators: zod(packingInsertSchema),
		dataType: 'json',
		onSubmit: () => {
			// Set operation type based on whether we're editing or creating
			const operationType = editingId ? 'update' : 'create';
			console.log(`Starting ${operationType} operation`);
		},
		onUpdated: ({ form }) => {
			if (form.valid) {
				// Check the form message to determine which action was performed
				if (form.message === 'Deleted.') {
					toast.success('Product packing deleted successfully');
				} else {
					toast.success(
						editingId
							? 'Product packing updated successfully'
							: 'Product packing created successfully'
					);
					editingId = null;
				}
			} else {
				console.log('JSON.stringify(form.errors)', JSON.stringify(form.errors));

				// Extract more specific error messages
				const errorFields = Object.keys(form.errors);
				if (errorFields.length > 0) {
					// Show more descriptive error message based on specific fields
					const errorMessage = `Please check the following fields: ${errorFields.join(', ')}`;
					toast.error(errorMessage);
				} else {
					// Fallback for other errors
					toast.error(form.message || 'Operation failed');
				}
			}
		}
	});
	const { form: formData, formId, enhance, reset, delayed, message } = form;
	let editingId: number | null = $state(null);
</script>

<div class="container mx-auto p-4">
	<div class="rounded-md border">
		<Table.Root class="min-w-full">
			<Table.Header>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head>Product ID</Table.Head>
					<Table.Head>Packing Type</Table.Head>
					<Table.Head>Units Per Pack</Table.Head>
					<Table.Head>GTIN</Table.Head>
					<Table.Head>Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.packings ?? [] as packing}
					<Table.Row>
						<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.id}</Table.Cell>
						<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.m_product_id}</Table.Cell>
						<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.packing_type}</Table.Cell>
						<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.is_display}</Table.Cell>
						<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.unitsperpack}</Table.Cell>
						<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.gtin}</Table.Cell>
						<Table.Cell class="space-x-2 px-6 py-4 whitespace-nowrap">
							<Button
								variant="outline"
								disabled={$delayed}
								onclick={() => {
									editingId = packing.id;
									$formData = packing;
								}}
							>
								Edit
							</Button>
							<form method="POST" action="?/delete" use:enhance class="inline">
								<Button
									type="submit"
									name="id"
									value={packing.id}
									variant="destructive"
									disabled={$delayed && $formId !== packing.id.toString()}
									onclick={() => {
										$formData = packing;
										$formId = packing.id.toString();
									}}
								>
									{#if $delayed && $formId == packing.id.toString()}
										<LoaderCircle class="animate-spin" />
									{:else}
										Delete
									{/if}
								</Button>
							</form>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Edit/Create Form -->
	<form method="POST" action="?/upsert" use:enhance class="mt-8 max-w-xl space-y-4">
		{#if editingId}
			<input type="hidden" name="id" bind:value={$formData.id} />
		{/if}

		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<label for="m_product_id" class="text-sm font-medium">Product ID</label>
				<Input id="m_product_id" type="number" bind:value={$formData.m_product_id} required />
			</div>

			<div class="space-y-2">
				<label for="packing_type" class="text-sm font-medium">Packing Type</label>
				<MySelectForm
					name="packing_type"
					bind:value={$formData.packing_type}
					options={[
						{ value: 'Individual', label: 'Individual' },
						{ value: 'Box', label: 'Box' },
						{ value: 'Pallet', label: 'Pallet' }
					]}
				/>
			</div>

			<div class="space-y-2">
				<label for="unitsperpack" class="text-sm font-medium">Units Per Pack</label>
				<Input
					id="unitsperpack"
					type="number"
					bind:value={$formData.unitsperpack}
					placeholder="Units Per Pack"
				/>
			</div>

			<div class="space-y-2">
				<label for="gtin" class="text-sm font-medium">GTIN</label>
				<Input id="gtin" type="text" bind:value={$formData.gtin} placeholder="GTIN" />
			</div>
			<Form.Field
				{form}
				name="is_display"
				class="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4"
			>
				<Form.Control>
					{#snippet children({ props })}
						<Checkbox
							{...props}
							checked={$formData.is_display ?? false}
							onclick={() => {
								$formData.is_display = !($formData.is_display ?? false);
							}}
						/>
						<div class="space-y-1 leading-none">
							<Form.Label>Use different settings for my mobile devices</Form.Label>
							<Form.Description>
								You can manage your mobile notifications in the <a href="/examples/forms"
									>mobile settings</a
								> page.
							</Form.Description>
						</div>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</div>

		<div class="flex gap-2">
			<Button type="submit" disabled={$delayed}>
				{#if $delayed}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				{editingId ? 'Update' : 'Create'} Packing
			</Button>

			{#if editingId}
				<Button
					variant="outline"
					type="button"
					disabled={$delayed}
					onclick={() => {
						editingId = null;
						reset();
					}}
				>
					Cancel
				</Button>
			{/if}
			{#if $formData.id}
				<Button
					type="submit"
					name="delete"
					variant="destructive"
					disabled={$delayed}
					onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}
				>
					{#if $delayed}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					{:else}
						Delete
					{/if}
				</Button>
			{/if}
		</div>
	</form>
	<SuperDebug data={$formData} />
</div>
