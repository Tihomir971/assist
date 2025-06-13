<script lang="ts">
	import { ComboboxZag, NumberInputZag } from '$lib/components/zag/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { cChannelMapCategoryInsertSchema } from '$lib/types/supabase.zod.schemas.js';
	import { dev } from '$app/environment';
	import { DateHelper } from '$lib/scripts/intl';
	import type { CChannelMapCategoryInsert } from '$lib/types/supabase.zod.schemas-ts';

	type ListItem = { value: number; label: string };
	type Props = {
		isSheetOpen: boolean;
		item: CChannelMapCategoryInsert | undefined;
		parentId: number | undefined;
		validatedForm: SuperValidated<CChannelMapCategoryInsert>;

		channels: ListItem[];
	};

	let {
		isSheetOpen = $bindable(),
		item = $bindable(),
		validatedForm,
		channels,
		parentId
	}: Props = $props();

	const dateHelper = new DateHelper();

	const superform = superForm(validatedForm, {
		onSubmit: async ({ formData }) => {
			formData.delete('created_at');
			formData.delete('updated_at');
		},
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Vendor PO operation successful');
				isSheetOpen = false;
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error(form.message || 'Vendor PO operation failed');
			}
		},
		onError({ result }) {
			console.error('Form submission failed:', result.error);
		}
	});
	const { form, enhance, message, isTainted, tainted, errors, constraints } = superform;

	$effect(() => {
		if (isSheetOpen) {
			if (item) {
				$form = { ...item };
			} else {
				const newEntryState = { ...validatedForm.data };
				newEntryState.id = undefined;
				newEntryState.m_product_category_id = parentId;
				$form = newEntryState;
			}
		}
	});
</script>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content class="sm:max-w-xl">
		<form method="post" action="?/channelMapUpsert" use:enhance>
			<Sheet.Header>
				<Sheet.Title>
					{`${$form.id ? 'Update' : 'Create'} Channel Mapping`}
				</Sheet.Title>
			</Sheet.Header>
			<div class="overflow-auto px-4">
				<input type="hidden" name="id" value={$form.id?.toString() || ''} />
				<input
					type="hidden"
					name="m_product_category_id"
					value={$form.m_product_category_id?.toString() || ''}
				/>
				<div class="flex flex-col space-y-4 py-4">
					<Form.Field form={superform} name="resource_name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>resource_name</Form.Label>
								<Input {...props} bind:value={$form.resource_name} />
							{/snippet}
						</Form.Control>
					</Form.Field>
					<Form.Field form={superform} name="resource_id">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>resource_id</Form.Label>
								<Input {...props} bind:value={$form.resource_id} />
							{/snippet}
						</Form.Control>
					</Form.Field>
					<Form.Field form={superform} name="c_channel_id">
						<Form.Control>
							{#snippet children({ props })}
								<ComboboxZag
									{...props}
									bind:value={$form.c_channel_id}
									items={channels}
									label="Channel"
								/>
							{/snippet}
						</Form.Control>
					</Form.Field>
					{#if $form.created_at}
						<Form.Field form={superform} name="created_at">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Created at</Form.Label>
									<Input {...props} value={dateHelper.format($form.created_at)} readonly />
								{/snippet}
							</Form.Control>
						</Form.Field>
					{/if}
					{#if $form.updated_at}
						<Form.Field form={superform} name="updated_at">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Updated at</Form.Label>
									<Input {...props} value={dateHelper.format($form.updated_at)} readonly />
								{/snippet}
							</Form.Control>
						</Form.Field>
					{/if}
				</div>
			</div>
			<Sheet.Footer>
				<Button type="submit" variant="default">Save</Button>
				<Button
					type="submit"
					formaction="?/channelMapDelete"
					variant="destructive"
					disabled={!$form.id}
				>
					Delete
				</Button>
			</Sheet.Footer>

			<SuperDebug data={{ $form, $errors }} display={dev} />
		</form>
	</Sheet.Content>
</Sheet.Root>
