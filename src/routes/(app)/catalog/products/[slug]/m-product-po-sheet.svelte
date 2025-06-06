<script lang="ts">
	import type { SuperValidated } from 'sveltekit-superforms';
	import { ComboboxZag, NumberInputZag } from '$lib/components/zag/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import type { mProductPoInsertSchema } from '$lib/types/supabase.zod.schemas.js';
	import { dev } from '$app/environment';

	type Item = { value: number; label: string };
	type Schema = z.infer<typeof mProductPoInsertSchema>;
	type Props = {
		isSheetOpen: boolean;
		data: Schema | undefined;
		validatedForm: SuperValidated<Schema>;
		partners: Item[];
	};

	let { isSheetOpen = $bindable(), data = $bindable(), validatedForm, partners }: Props = $props();
	const superform = superForm(validatedForm, {
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
	if (data) {
		$form = { ...data };
	}
</script>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content>
		<form method="post" action="?/mProductPoUpsert" use:enhance>
			<Sheet.Header>
				<Sheet.Title>
					{`${$form.id ? 'Update' : 'Create'} Product Purchase for Vendor`}
				</Sheet.Title>
				<Sheet.Description>This will create or update Purchase for Vendor.</Sheet.Description>
			</Sheet.Header>
			<div class="grid flex-1 auto-rows-min gap-3 px-4">
				<input type="hidden" name="id" value={$form.id?.toString() || ''} />
				<input type="hidden" name="m_product_id" value={$form.m_product_id?.toString() || ''} />
				<Form.Field form={superform} name="vendorproductno">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$form.vendorproductno} placeholder="Vendor PN" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={superform} name="c_bpartner_id">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Vendor</Form.Label>
							<ComboboxZag
								{...props}
								bind:value={$form.c_bpartner_id}
								items={partners}
								placeholder="Select a partner"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Choose the product category</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={superform} name="pricelist">
					<Form.Control>
						{#snippet children({ props })}
							<NumberInputZag
								{...props}
								label="Pricelist"
								bind:value={$form.pricelist}
								fraction={2}
							/>
						{/snippet}
					</Form.Control>
				</Form.Field>
				<Form.Field form={superform} name="order_min">
					<Form.Control>
						{#snippet children({ props })}
							<NumberInputZag
								{...props}
								label="MOQ"
								bind:value={$form.order_min}
								fraction={0}
								min={1}
							/>
						{/snippet}
					</Form.Control>
				</Form.Field>
				<Form.Field form={superform} name="url">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>URL</Form.Label>
							<Input {...props} type="url" bind:value={$form.url} />
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
			<Sheet.Footer>
				<Button type="submit" variant="default" class="w-full">Save</Button>
				<Button
					type="submit"
					formaction="?/mProductPoDelete"
					variant="destructive"
					disabled={!$form.id}
					>Delete
				</Button>
				<SuperDebug data={{ $form, $errors }} display={dev} />
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
