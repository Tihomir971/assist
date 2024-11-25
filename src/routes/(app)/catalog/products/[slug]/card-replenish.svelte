<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { type LoginSchema } from '../zod.validator';
	import { Button } from '$lib/components/ui/button';
	import { X } from 'lucide-svelte';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import * as Form from '$lib/components/ui/form';

	interface Props {
		form: SuperValidated<Infer<LoginSchema>>;
		productId: number;
		//replenishes: CrudReplenishSchema[];
		warehouses: Array<{ value: number; label: string }>;
	}

	let data: Props = $props();
	//let replenishes = $state(data.replenishes);

	const { form, enhance, tainted, isTainted, allErrors } = superForm(data.form, {
		dataType: 'json',
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Replenish data updated successfully', {
					description: form.message
				});
				invalidate('catalog:products');
			}
		}
	});

	let warehousesWithStringValues = $derived(
		data.warehouses.map((warehouse) => ({
			value: warehouse.value.toString(),
			label: warehouse.label
		}))
	);

	function selectedWarehouseLabel(value: number | null | undefined): string {
		if (value === null || value === undefined) return '';
		return data.warehouses?.find((v) => v.value === value)?.label ?? '';
	}
	function addRow() {
		$form.replenishes.push({
			m_product_id: data.productId,
			m_warehouse_id: data.warehouses.reduce((min, warehouse) => {
				return warehouse.value < min ? warehouse.value : min;
			}, Number.MAX_SAFE_INTEGER),
			level_min: 0,
			level_max: 0,
			qtybatchsize: null,
			m_warehousesource_id: null
		});
		$form.replenishes = $form.replenishes;
	}
</script>

{#if $allErrors.length}
	<ul>
		{#each $allErrors as error}
			<li class="text-red-500">
				! {error.messages.join('. ')}
			</li>
		{/each}
	</ul>
{/if}
<form method="post" use:enhance action="?/replenishUPD">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-1/5">Warehouse</Table.Head>
				<Table.Head class="w-1/5">Min Level</Table.Head>
				<Table.Head class="w-1/5">Max Level</Table.Head>
				<Table.Head class="w-1/5">Batch Size</Table.Head>
				<Table.Head class="w-1/5">Source Warehouse</Table.Head>
				<Table.Head></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $form.replenishes as _, i}
				<Table.Row>
					<Table.Cell class="w-1/5">
						<Select.Root
							type="single"
							value={$form.replenishes[i].m_warehouse_id.toString()}
							onValueChange={(v) => {
								$form.replenishes[i].m_warehouse_id = Number.parseInt(v);
							}}
						>
							<Select.Trigger>
								{selectedWarehouseLabel($form.replenishes[i].m_warehouse_id)}
							</Select.Trigger>
							<Select.Content>
								{#each warehousesWithStringValues as warehouse}
									<Select.Item value={warehouse.value}>{warehouse.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Table.Cell>
					<Table.Cell class="w-1/5">
						<Input
							type="number"
							min="0"
							bind:value={$form.replenishes[i].level_min}
							placeholder="Min level..."
						/>
					</Table.Cell>
					<Table.Cell class="w-1/5">
						<Input
							type="number"
							min="0"
							bind:value={$form.replenishes[i].level_max}
							placeholder="Max level..."
						/>
					</Table.Cell>
					<Table.Cell class="w-1/5">
						<Input
							type="number"
							min="0"
							bind:value={$form.replenishes[i].qtybatchsize}
							placeholder="Batch size..."
						/>
					</Table.Cell>
					<Table.Cell class="w-1/5">
						<Select.Root
							type="single"
							value={$form.replenishes[i].m_warehousesource_id?.toString()}
							onValueChange={(v) => {
								$form.replenishes[i].m_warehousesource_id = Number.parseInt(v);
							}}
						>
							<Select.Trigger>
								{selectedWarehouseLabel($form.replenishes[i].m_warehousesource_id)}
							</Select.Trigger>
							<Select.Content>
								{#each warehousesWithStringValues as warehouse}
									<Select.Item value={warehouse.value}>{warehouse.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Table.Cell>
					<Table.Cell class="w-1/5">
						<Button variant="outline" size="icon">
							<X />
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class=" flex flex-row-reverse gap-4 pt-4 pr-4">
		<Button variant="outline" onclick={addRow}>Add Row</Button>
		<Form.Button disabled={!isTainted($tainted)}>Save</Form.Button>
	</div>
</form>
