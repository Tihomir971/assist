<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import {
		type CrudReplenishSchema,
		type LoginSchema,
		type ReplenishSchema
	} from '../zod.validator';
	import { Button } from '$lib/components/ui/button';
	import { X } from 'lucide-svelte';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import * as Form from '$lib/components/ui/form';

	interface Props {
		form: SuperValidated<Infer<LoginSchema>>;
		replenishes: CrudReplenishSchema[];
		warehouses: Array<{ value: number; label: string }>;
	}

	let data: Props = $props();
	let replenishes = $state(data.replenishes);
	let productID = $state(data.replenishes[0].m_product_id);
	$inspect(replenishes);

	const { enhance, formId } = superForm(data.form, {
		dataType: 'json',
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Replenish data updated successfully', {
					description: form.message
				});
				invalidate('catalog:product');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error('Failed to update replenish data', {
					description: form.message || 'Please check the form for errors'
				});
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
		if (data.form.id && data.warehouses.length > 0) {
			replenishes.push({
				m_product_id: productID,
				m_warehouse_id: data.warehouses.reduce((min, warehouse) => {
					return warehouse.value < min ? warehouse.value : min;
				}, Number.MAX_SAFE_INTEGER),
				level_min: 0,
				level_max: 0,
				qtybatchsize: null,
				m_warehousesource_id: null
			});
		}
	}
</script>

<form method="post" use:enhance>
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
			{#each replenishes as replenish (replenish.id)}
				<Table.Row>
					<Table.Cell class="w-1/5">
						<Select.Root type="single" value={replenish.m_warehouse_id?.toString()}>
							<Select.Trigger>
								{selectedWarehouseLabel(replenish.m_warehouse_id)}
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
							bind:value={replenish.level_min}
							placeholder="Min level..."
						/>
					</Table.Cell>
					<Table.Cell class="w-1/5">
						<Input type="number" min="0" value={replenish.level_max} placeholder="Max level..." />
					</Table.Cell>
					<Table.Cell class="w-1/5">
						<Input
							type="number"
							min="0"
							value={replenish.qtybatchsize ?? 0}
							placeholder="Batch size..."
						/>
					</Table.Cell>
					<Table.Cell class="w-1/5">
						<Select.Root type="single" value={replenish.m_warehousesource_id?.toString()}>
							<Select.Trigger>
								{selectedWarehouseLabel(replenish.m_warehousesource_id)}
							</Select.Trigger>
							<Select.Content>
								{#each warehousesWithStringValues as warehouse}
									<Select.Item value={warehouse.value}>{warehouse.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Table.Cell>
					<Table.Cell class="w-1/5">
						<Form.Button
							name="id"
							formaction="?/replenish"
							variant="outline"
							size="icon"
							value="update-row"
							onclick={() => {
								if (replenish.id) {
									$formId = replenish.id?.toString();
								}
							}}
						>
							<!-- <X /> -->Add
						</Form.Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class=" flex flex-row-reverse gap-4 pt-4 pr-4">
		<Form.Button>Save</Form.Button>
		<Button type="button" variant="outline" onclick={addRow}>Add Row</Button>
	</div>
</form>
