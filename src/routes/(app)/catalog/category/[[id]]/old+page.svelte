<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	// Superforms
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';

	// Components
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import ChannelCard from './channel-card.svelte';
	import PriceRulesCard from './price-rules-card.svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ComboboxZag, SwitchZag } from '$lib/components/zag/index.js';

	import { DateHelper } from '$lib/scripts/intl';

	const dateHelper = new DateHelper();

	let { data } = $props();
	const isCreateMode = !page.params.id;

	const superform = superForm(data.formCategory, {
		resetForm: false,
		onSubmit({ formData }) {
			formData.delete('created_at');
			formData.delete('updated_at');
			if (isCreateMode && formData.get('id') === '') {
				formData.delete('id'); // Ensure ID is not sent if empty for creation
			}
		},
		onUpdated({ form }) {
			const wasInitialCreateMode = isCreateMode; // Capture initial mode for this submission
			const isNowEditModeAfterCreate = wasInitialCreateMode && form.data.id && form.valid;

			if (form.valid) {
				toast.success(
					isNowEditModeAfterCreate
						? 'Category created successfully'
						: 'Category updated successfully',
					{
						description:
							form.message ||
							(isNowEditModeAfterCreate
								? 'The new category has been saved.'
								: 'Your changes have been saved.')
					}
				);
				if (isNowEditModeAfterCreate) {
					// Navigate after toast has a chance to show
					setTimeout(() => {
						goto(`/catalog/category/${form.data.id}`, { replaceState: true });
					}, 500); // Small delay for toast visibility
				}
			} else {
				toast.error(
					wasInitialCreateMode ? 'Failed to create category' : 'Failed to update category',
					{
						description: form.message || 'Please check the form for errors'
					}
				);
			}
		}
	});
	const { form: formData, enhance, message, isTainted, tainted, errors } = superform;
</script>

<div class="mx-auto grid h-full max-w-6xl grid-rows-[auto_1fr] py-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">{isCreateMode ? 'Create Category' : 'Edit Category'}</h1>
			<p class="text-muted-foreground">
				{isCreateMode ? 'Enter details for the new category' : 'Update category details'}
			</p>
		</div>
		<Button variant="link" href={`/catalog?${page.url.searchParams}`}>Back to List</Button>
	</div>
	<ScrollArea class="h-full">
		<Card.Root class="col-span-3">
			<form method="POST" use:enhance action="?/categoryUpsert">
				<Card.Header>
					<Card.Title>Category Detail</Card.Title>
				</Card.Header>
				<Card.Content class="flex w-full flex-col space-y-4">
					{#if $formData.id}
						<div class="grid grid-cols-3 gap-4">
							<Form.Field form={superform} name="id">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>ID</Form.Label>
										<Input {...props} bind:value={$formData.id} placeholder="ID" readonly />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={superform} name="created_at">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Created</Form.Label>
										<Input
											{...props}
											type="datetime"
											value={dateHelper.format($formData.created_at)}
											readonly
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={superform} name="updated_at">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Updated</Form.Label>
										<Input
											{...props}
											type="datetime"
											value={dateHelper.format($formData.updated_at)}
											readonly
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
					{/if}
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
						<Form.Button variant="default" disabled={!isTainted($tainted)}
							>{isCreateMode && !$formData.id ? 'Create' : 'Save'}</Form.Button
						>
						{#if $formData.id}
							<Button
								type="submit"
								formaction="?/categoryDelete"
								variant="destructive"
								onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}>Delete</Button
							>
						{/if}
					</div>
				</Card.Content>
				<Card.Footer class="flex justify-between"></Card.Footer>
			</form>
		</Card.Root>

		{#if $formData.id}
			<div class="col-span-3">
				<ChannelCard
					parentId={$formData.id}
					items={data.channelMapCategory}
					channels={data.channels}
					validatedForm={data.formChannel}
				/>
			</div>
			<div class="col-span-3">
				<PriceRulesCard
					parentId={$formData.id}
					items={data.priceRules}
					validatedForm={data.formPriceRules}
					priceFormulas={data.priceFormulas}
				/>
			</div>
		{/if}
	</ScrollArea>
</div>
