<script lang="ts">
	import SuperDebug, { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import type { CrudCChannelMapCategorySchema } from './schema';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	type Props = {
		validatedForm: SuperValidated<Infer<CrudCChannelMapCategorySchema>>;
		categories: Array<{ value: string; label: string }>;
		channels: Array<{ value: string; label: string }>;
		isCategoryMapDrawerOpen: boolean;
	};
	let {
		validatedForm,
		categories,
		isCategoryMapDrawerOpen = $bindable(),
		channels
	}: Props = $props();

	const form = superForm(validatedForm, {
		dataType: 'json',
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Replenish data updated successfully', {
					description: form.message
				});
				invalidate('catalog:category');
			}
		}
	});
	const { form: formData, enhance: enhanceCategoryMap, message, isTainted, tainted } = form;
	const triggerChannel = $derived(
		channels.find((f) => f.value === $formData.c_channel_id.toString())?.label ?? 'Select Channel'
	);
</script>

<form method="POST" use:enhanceCategoryMap action="?/categoryMap">
	<Drawer.Root
		bind:open={isCategoryMapDrawerOpen}
		dismissible={false}
		onOpenChange={(open) => (isCategoryMapDrawerOpen = open)}
		direction="right"
	>
		<Drawer.Content class="inset-x-auto inset-y-0 right-0 mt-0 w-96">
			<Drawer.Header>
				<Drawer.Title>Channels</Drawer.Title>
				<Drawer.Description>Manage Category Channels</Drawer.Description>
			</Drawer.Header>
			<div class="p-4">
				<Form.Field {form} name="id">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>ID</Form.Label>
							<Input {...props} bind:value={$formData.id} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field
					{form}
					name="isactive"
					class="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4"
				>
					<Form.Control>
						{#snippet children({ props })}
							<Checkbox {...props} bind:checked={$formData.isactive} />
							<div class="space-y-1 leading-none">
								<Form.Label>Is Active?</Form.Label>
							</div>
						{/snippet}
					</Form.Control>
				</Form.Field>

				<Form.Field {form} name="c_channel_id">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Channel</Form.Label>
							<Select.Root
								type="single"
								value={$formData.c_channel_id.toString()}
								name={props.name}
								onValueChange={(v) => {
									$formData.c_channel_id = Number.parseInt(v);
								}}
							>
								<Select.Trigger {...props}>
									{triggerChannel}
								</Select.Trigger>
								<Select.Content>
									{#each channels as channel}
										<Select.Item value={channel.value} label={channel.label} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>

					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="resource_name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Resource Name</Form.Label>
							<Input {...props} bind:value={$formData.resource_name} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<SuperDebug data={$formData} />
			</div>
			<Drawer.Footer>
				<Drawer.Close>Close</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
</form>
