<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import MySelectForm from '$lib/components/my/MySelectForm.svelte';
	import { toast } from 'svelte-sonner';
	import type { Tables } from '$lib/types/supabase/database.types';
	import * as Table from '$lib/components/ui/table/index.js';
	import { zod } from 'sveltekit-superforms/adapters';
	import { packingSchema } from './schema';
	import SuperDebug from 'sveltekit-superforms';

	let { data } = $props();

	const { form, enhance, reset } = superForm(data.form, {
		validators: zod(packingSchema),
		dataType: 'json',
		onUpdated: ({ form }) => {
			if (form.valid) {
				toast.success('Operation successful');
				editingId = null;
			} else {
				console.log('JSON.stringify(form.errors)', JSON.stringify(form.errors));

				toast.error(form.message || 'Operation failed');
			}
		}
	});

	let editingId: number | null = $state(null);
	function getPackageLabel(id: number) {
		return data.packingTypes?.find((type) => type.id === id)?.name ?? '';
	}
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
						<Table.Cell class="px-6 py-4 whitespace-nowrap"
							>{getPackageLabel(packing.m_product_packing_type_id)}</Table.Cell
						>
						<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.unitsperpack}</Table.Cell>
						<Table.Cell class="px-6 py-4 whitespace-nowrap">{packing.gtin}</Table.Cell>
						<Table.Cell class="space-x-2 px-6 py-4 whitespace-nowrap">
							<Button
								variant="outline"
								onclick={() => {
									editingId = packing.id;
									$form = packing as Tables<'m_product_packing'>;
								}}
							>
								Edit
							</Button>
							<form method="POST" action="?/delete&id={packing.id}" use:enhance class="inline">
								<Button type="submit" variant="destructive">Delete</Button>
							</form>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Edit/Create Form -->
	<form
		method="POST"
		action={editingId ? '?/update' : '?/create'}
		use:enhance
		class="mt-8 max-w-xl space-y-4"
	>
		{#if editingId}
			<input type="hidden" name="id" bind:value={$form.id} />
		{/if}

		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<label for="m_product_id" class="text-sm font-medium">Product ID</label>
				<Input
					id="m_product_id"
					type="number"
					bind:value={$form.m_product_id}
					placeholder="Product ID"
				/>
			</div>

			<div class="space-y-2">
				<label for="m_product_packing_type_id" class="text-sm font-medium">Packing Type</label>
				<MySelectForm
					name="m_product_packing_type_id"
					bind:value={$form.m_product_packing_type_id}
					options={data.packingTypes?.map((type) => ({
						value: type.id,
						label: type.name
					})) ?? []}
				/>
			</div>

			<div class="space-y-2">
				<label for="unitsperpack" class="text-sm font-medium">Units Per Pack</label>
				<Input
					id="unitsperpack"
					type="number"
					bind:value={$form.unitsperpack}
					placeholder="Units Per Pack"
				/>
			</div>

			<div class="space-y-2">
				<label for="gtin" class="text-sm font-medium">GTIN</label>
				<Input id="gtin" type="text" bind:value={$form.gtin} placeholder="GTIN" />
			</div>
		</div>

		<div class="flex gap-2">
			<Button type="submit">
				{editingId ? 'Update' : 'Create'} Packing
			</Button>
			{#if editingId}
				<Button
					variant="outline"
					type="button"
					onclick={() => {
						editingId = null;
						reset();
					}}
				>
					Cancel
				</Button>
			{/if}
		</div>
	</form>
	<SuperDebug data={$form} />
</div>
