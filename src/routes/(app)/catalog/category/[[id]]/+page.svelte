<script lang="ts">
	import { page } from '$app/state';
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

	import { Label } from '$lib/components/ui/label/index.js';
	import { DateHelper } from '$lib/scripts/intl';

	const dateHelper = new DateHelper();

	let { data } = $props();
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
</script>

<div class="mx-auto grid h-full max-w-6xl grid-rows-[auto_1fr] py-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Edit Category</h1>
			<p class="text-muted-foreground">Update attribute group details</p>
		</div>
		<Button variant="link" href={`/catalog?${page.url.searchParams}`}>Back to List</Button>
	</div>
	<ScrollArea class="h-full">
		<div class="mb-8 grid grid-cols-4 gap-4">
			<Card.Root class="col-span-3">
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
				<Card.Content class="space-y-4">
					<div class="flex flex-col space-y-2">
						<label for="id">ID</label>
						<Input name="id" id="id" value={$formData.id} readonly />
					</div>
					<div class="flex flex-col space-y-2">
						<Label for="created">Created</Label>
						<Input
							id="created"
							type="datetime"
							value={dateHelper.format($formData.created_at)}
							readonly
						/>
					</div>
					<div class="flex flex-col space-y-2">
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
		</div>
	</ScrollArea>
</div>
