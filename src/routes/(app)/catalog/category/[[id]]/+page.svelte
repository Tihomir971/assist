<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	// Superforms
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import PhDotsThreeBold from '~icons/ph/dots-three-bold.js';
	// Components
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import Sheet from './price-rules-sheet.svelte';

	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CheckboxZag, ComboboxZag, SwitchZag } from '$lib/components/zag/index.js';

	import { getLabelByValue } from '$lib/scripts/custom';
	import { Label } from '$lib/components/ui/label/index.js';
	import { DateHelper } from '$lib/scripts/DateHelper';

	const dateHelper = new DateHelper();

	let { data } = $props();
	data.formPriceRules.data.m_product_category_id = data.formCategory.data.id;
	data.formPriceRules.data.name = data.formCategory.data.name;

	const superform = superForm(data.formCategory, {
		resetForm: false,
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Category updated successfully', {
					description: form.message || 'Your changes have been saved.'
				});

				// invalidate('catalog:category');
			} else {
				console.log('form.message', form);

				toast.error('Failed to update category', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});
	const { form: formData, enhance, message, isTainted, tainted, errors } = superform;
	let isSheetOpen = $state(false);
	let selectedId: number | undefined = $state();
	let selected = $derived.by(() => {
		return data.priceRules.find((v) => v.id === selectedId);
	});
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Edit Category</h1>
			<p class="text-muted-foreground">Update attribute group details</p>
		</div>
		<Button variant="link" href={`/catalog?${page.url.searchParams}`}>Back to List</Button>
	</div>
	<div class="mb-8 grid grid-cols-[2fr_1fr] gap-2 overflow-hidden">
		<Card.Root>
			<form method="POST" use:enhance action="?/categoryUpsert">
				<Card.Header>
					<Card.Title>Category Detail</Card.Title>
				</Card.Header>
				<Card.Content class="flex w-full flex-col space-y-4">
					<input type="hidden" name="id" value={$formData.id} />
					<Form.Field form={superform} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$formData.name} placeholder="Category Name" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<div class="flex w-full items-center space-x-3">
						<Form.Field form={superform} name="is_active">
							<Form.Control>
								{#snippet children({ props })}
									<SwitchZag {...props} bind:checked={$formData.is_active} label="Is Active?" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={superform} name="is_self_service">
							<Form.Control>
								{#snippet children({ props })}
									<SwitchZag
										{...props}
										bind:checked={$formData.is_self_service}
										label="Is Self Service?"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<Form.Field form={superform} name="description">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Description</Form.Label>
								<Textarea {...props} bind:value={$formData.description} class="resize-y" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field form={superform} name="parent_id">
						<Form.Control>
							{#snippet children({ props })}
								<ComboboxZag
									{...props}
									bind:value={$formData.parent_id}
									items={data.categories}
									placeholder="Select a category"
									label="Category"
								/>
							{/snippet}
						</Form.Control>
						<Form.Description>Choose the product category</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					<div class="flex flex-row-reverse items-center gap-2">
						<Form.Button variant="default" disabled={!isTainted($tainted)}>Save</Form.Button>
						<Button
							type="submit"
							formaction="?/categoryDelete"
							variant="destructive"
							onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}>Delete</Button
						>
					</div>
				</Card.Content>
				<Card.Footer class="flex justify-between"></Card.Footer>
			</form>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Info</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<label for="id">ID</label>
					<Input name="id" id="id" value={$formData.id} readonly />
				</div>
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<Label for="created">Created</Label>
					<Input
						id="created"
						type="datetime"
						value={dateHelper.format($formData.created_at)}
						readonly
					/>
				</div>
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<Label for="updated">Updated</Label>
					<Input
						id="updated"
						type="datetime"
						value={dateHelper.format($formData.updated_at)}
						readonly
					/>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title>Price Rules</Card.Title>
				<Button
					variant="outline"
					onclick={() => {
						selectedId = undefined;
						isSheetOpen = !isSheetOpen;
					}}
				>
					Add rule ...
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]name">Name</Table.Head>
						<Table.Head>Is Active?</Table.Head>
						<Table.Head>Attribute ID</Table.Head>
						<Table.Head>Price Formula</Table.Head>
						<Table.Head>Created at</Table.Head>
						<Table.Head>Updated at</Table.Head>
						<Table.Head class="w-8"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.priceRules as row}
						<Table.Row>
							<Table.Cell class="font-medium">{row.name}</Table.Cell>
							<!-- <Table.Cell>{row.is_active}</Table.Cell> -->
							<Table.Cell><CheckboxZag checked={row.is_active} disabled /></Table.Cell>
							<Table.Cell>{row.m_attribute_id}</Table.Cell>
							<Table.Cell>{getLabelByValue(row.price_formula_id, data.priceFormulas)}</Table.Cell>
							<Table.Cell>{dateHelper.format(row.created_at)}</Table.Cell>
							<Table.Cell>{dateHelper.format(row.updated_at)}</Table.Cell>
							<Table.Cell>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => {
										selectedId = row.id;
										isSheetOpen = !isSheetOpen;
									}}
								>
									<PhDotsThreeBold />
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

{#if isSheetOpen}
	<Sheet
		bind:isSheetOpen
		bind:data={selected}
		validatedForm={data.formPriceRules}
		priceFormulas={data.priceFormulas}
	/>
{/if}

<SuperDebug data={{ $formData, $errors }} display={dev} />
