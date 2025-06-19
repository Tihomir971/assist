<script lang="ts">
	import { ComboboxZag, NumberInputZag } from '$lib/components/zag/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { dev } from '$app/environment';
	import * as Form from '$lib/components/ui/form/index.js';
	import type { MReplenishInsert } from '$lib/types/supabase.zod.schemas.d';

	type Item = { value: number; label: string };
	type Props = {
		isSheetOpen: boolean;
		data: MReplenishInsert | undefined;
		validatedForm: SuperValidated<MReplenishInsert>;
		warehouses: Item[];
	};
	let {
		isSheetOpen = $bindable(),
		data = $bindable(),
		validatedForm,
		warehouses
	}: Props = $props();
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
	const { form: formData, enhance, message, isTainted, tainted, errors, constraints } = superform;
	if (data) {
		$formData = { ...data };
	}
</script>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content>
		<form method="post" action="?/mReplenishUpsert" use:enhance>
			<Sheet.Header>
				<Sheet.Title>
					{`${$formData.id ? 'Update' : 'Create'} Product Purchase for Vendor`}
				</Sheet.Title>
				<Sheet.Description>
					This action cannot be undone. This will permanently delete your account and remove your
					data from our servers.
				</Sheet.Description>
			</Sheet.Header>
			<div class="grid gap-3 overflow-y-auto p-4">
				<input type="hidden" name="id" value={$formData.id?.toString() || ''} />
				<input type="hidden" name="m_product_id" value={$formData.m_product_id?.toString() || ''} />

				<Form.Field form={superform} name="m_warehouse_id">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Warehouse</Form.Label>
							<ComboboxZag
								{...props}
								bind:value={$formData.m_warehouse_id}
								items={warehouses}
								placeholder="Select a Warehouse"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={superform} name="m_warehousesource_id">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Source Warehouse</Form.Label>
							<ComboboxZag
								{...props}
								bind:value={$formData.m_warehousesource_id}
								items={warehouses}
								placeholder="Select a Warehouse"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={superform} name="level_min">
					<Form.Control>
						{#snippet children({ props })}
							<NumberInputZag
								{...props}
								label="Min. Level"
								bind:value={$formData.level_min}
								fraction={0}
								min={1}
							/>
						{/snippet}
					</Form.Control>
				</Form.Field>
				<Form.Field form={superform} name="level_max">
					<Form.Control>
						{#snippet children({ props })}
							<NumberInputZag
								{...props}
								label="Max. Level"
								bind:value={$formData.level_max}
								fraction={0}
							/>
						{/snippet}
					</Form.Control>
				</Form.Field>
				<Form.Field form={superform} name="qtybatchsize">
					<Form.Control>
						{#snippet children({ props })}
							<NumberInputZag
								{...props}
								label="Batch size"
								bind:value={$formData.qtybatchsize}
								fraction={0}
								min={1}
							/>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
			<Sheet.Footer class="flex gap-2">
				<Button type="submit" variant="default" class="w-full">Save</Button>
				<Button
					type="submit"
					formaction="?/mReplenishDelete"
					variant="destructive"
					disabled={!$formData.id}
					class="w-full">Delete</Button
				>
				<SuperDebug data={{ $formData, $errors }} display={dev} />
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
