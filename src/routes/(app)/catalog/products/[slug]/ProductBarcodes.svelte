<script lang="ts">
	import { browser } from '$app/environment';
	import * as Card from '$lib/components/ui/card';
	import { formatDateTime } from '$lib/style/locale';
	import * as Table from '$lib/components/ui/table';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		productGtinSchema,
		schemaProductGtinID,
		type ProductGtinSchema,
		type SchemaProductGtinID
	} from '../zod.validator';
	import SuperDebug, { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import {
		createColumnHelper,
		createSvelteTable,
		getCoreRowModel,
		FlexRender
	} from '$lib/components/tanstack';
	import * as Alert from '$lib/components/ui/alert';
	let { formProductGtin, formProductGtinId, productId, barcodes }: Props = $props();

	const colHelp = createColumnHelper<ProductGtinSchema>();
	const columnDefs = [
		colHelp.accessor('m_product_id', { header: 'm_product_id' }),
		colHelp.accessor('gtin', { header: 'gtin' }),
		colHelp.accessor('isactive', { header: 'Active' })
	];
	const table = createSvelteTable({
		data: barcodes,
		columns: columnDefs,
		getCoreRowModel: getCoreRowModel()
	});

	interface Props {
		formProductGtin: SuperValidated<ProductGtinSchema>;
		formProductGtinId: SuperValidated<SchemaProductGtinID>;
		productId: number;
		barcodes: {
			ad_org_id: number;
			created: string;
			gtin: string;
			id: number;
			isactive: boolean;
			m_product_id: number;
			updated: string;
		}[];
	}

	const formGtin = superForm(formProductGtin, {
		validators: zodClient(productGtinSchema),
		onResult: ({ result }) => {
			if (result.type === 'failure') {
				$message = result.data?.error || 'Unknown error';
				console.error('Database error:', result.data?.error);
			}
		},
		onUpdated({ form }) {
			if (form.valid) {
				console.log('Form updated', form); // Add this line for debugging
				if (form.message) {
					console.error('Form is not valid', form.errors, form.message);
				}
			}
		},
		onError({ result }) {
			$message = result.error.message || 'Unknown error';
		}
	});
	const formGtinId = superForm(formProductGtinId, {
		validators: zodClient(schemaProductGtinID),
		onUpdated({ form }) {
			if (form.valid) {
				console.log('Form updated', form); // Add this line for debugging
				if (form.message) {
					console.error('Form is not valid', form.errors, form.message);
				}
			}
		}
	});
	const { form, enhance, message } = formGtin;
	const { enhance: enhanceId, formId: formIdID } = formGtinId;
	$form.m_product_id = productId;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Product Barcodes</Card.Title>
	</Card.Header>
	<Card.Content>
		<!-- action="?/mProductGtin" -->
		<div class="overflow-x-auto">
			<form method="post" use:enhanceId>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="hidden">ID</Table.Head>
							<Table.Head>Updated</Table.Head>
							<Table.Head>GTIN</Table.Head>
							<Table.Head>Is Active</Table.Head>
							<Table.Head>Action</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each barcodes as barcode}
							<Table.Row>
								<Table.Cell class="hidden">{barcode.id}</Table.Cell>
								<Table.Cell class="text-center">{formatDateTime(barcode.updated)}</Table.Cell>
								<Table.Cell class="text-center">{barcode.gtin}</Table.Cell>
								<Table.Cell class="text-center">{barcode.isactive ? 'Yes' : 'No'}</Table.Cell>
								<Table.Cell class="text-center">
									<Button
										type="submit"
										formaction="?/gtinDEL"
										name="id"
										value={barcode.id}
										onclick={() => ($formIdID = barcode.id.toString())}
										variant="ghost"
									>
										<Trash2 />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</form>
			<form method="post" action="?/gtinADD" use:enhance>
				<Table.Root>
					<Table.Body>
						<Table.Row>
							<Table.Cell></Table.Cell>
							<Table.Cell class="text-right">Add new:</Table.Cell>
							<Table.Cell>
								<Form.Field form={formGtin} name="gtin">
									<Form.Control>
										{#snippet children({ props })}
											<Input {...props} bind:value={$form.gtin} placeholder="Enter GTIN..." />
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							</Table.Cell>
							<Table.Cell>
								<Form.Field form={formGtin} name="isactive">
									<Form.Control>
										{#snippet children({ props })}
											<Checkbox {...props} bind:checked={$form.isactive as boolean} />
											<input name={props.name} value={$form.isactive} hidden />
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							</Table.Cell>
							<Table.Cell>
								<input name="m_product_id" value={productId} hidden />
								<Button type="submit" variant="secondary">Add</Button>
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
				{#if $message}
					<Alert.Root variant="destructive">
						<Alert.Description>
							{$message.data?.error}
						</Alert.Description>
					</Alert.Root>
				{/if}
			</form>
			{#if browser}
				<SuperDebug data={$form} />
			{/if}
		</div>
	</Card.Content>
</Card.Root>

<div class="not-prose relative mt-4 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800/25">
	<div class="absolute inset-0"></div>
	<div class="relative overflow-auto rounded-xl">
		<div class="my-8 overflow-hidden shadow-sm">
			<table>
				<thead>
					<tr>
						<th
							class="border-b p-4 pb-3 pl-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200"
							>Song</th
						>
						<th
							class="border-b p-4 pb-3 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200"
							>Artist</th
						>
						<th
							class="border-b p-4 pb-3 pr-8 pt-0 text-left font-medium text-slate-400 dark:border-slate-600 dark:text-slate-200"
							>Year</th
						>
					</tr>
				</thead>
				<tbody class="bg-white dark:bg-slate-800">
					<tr>
						<td
							class="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400"
							>The Sliding Mr. Bones (Next Stop, Pottersville)</td
						>
						<td
							class="border-b border-slate-100 p-4 text-slate-500 dark:border-slate-700 dark:text-slate-400"
							>Malcolm Lockyer</td
						>
						<td
							class="border-b border-slate-100 p-4 pr-8 text-slate-500 dark:border-slate-700 dark:text-slate-400"
							>1961</td
						>
					</tr>
					<tr>
						<td
							class="border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400"
							>Witchy Woman</td
						>
						<td
							class="border-b border-slate-100 p-4 text-slate-500 dark:border-slate-700 dark:text-slate-400"
							>The Eagles</td
						>
						<td
							class="border-b border-slate-100 p-4 pr-8 text-slate-500 dark:border-slate-700 dark:text-slate-400"
							>1972</td
						>
					</tr>
					<tr>
						<td
							class="border-b border-slate-200 p-4 pl-8 text-slate-500 dark:border-slate-600 dark:text-slate-400"
							>Shining Star</td
						>
						<td
							class="border-b border-slate-200 p-4 text-slate-500 dark:border-slate-600 dark:text-slate-400"
							>Earth, Wind, and Fire</td
						>
						<td
							class="border-b border-slate-200 p-4 pr-8 text-slate-500 dark:border-slate-600 dark:text-slate-400"
							>1975</td
						>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
	<div
		class="pointer-events-none absolute inset-0 rounded-xl border border-black/5 dark:border-white/5"
	></div>
</div>
