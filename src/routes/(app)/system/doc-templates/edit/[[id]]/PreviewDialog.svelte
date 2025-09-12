<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import SmartSelect from '$lib/components/forms/fields/SmartSelect.svelte';
	import type { PartnerLookup } from '$lib/services/supabase/partner.service';
	import { Label } from '$lib/components/ui/label';
	import type { FieldConfig } from '$lib/utils/schema-analyzer';

	type Role = {
		name: string;
		label: string;
		source_table: string;
	};

	type ContextSchema = {
		roles: Role[];
	};

	let {
		open = $bindable(),
		contextSchema,
		onPreview
	}: {
		open: boolean;
		contextSchema: ContextSchema | null;
		onPreview: (dataContext: Record<string, { table: string; id: number }>) => void;
	} = $props();

	let selectedData: Record<string, number | undefined> = $state({});

	// In a real app, you'd fetch this lookup data dynamically
	const samplePartners: PartnerLookup[] = [
		{ value: 1, label: 'John Doe (Sample)' },
		{ value: 2, label: 'Jane Smith (Sample)' }
	];

	function handlePreviewClick() {
		if (!contextSchema) return;

		const dataContext: Record<string, { table: string; id: number }> = {};
		let allSet = true;

		for (const role of contextSchema.roles) {
			const selectedId = selectedData[role.name];
			if (selectedId) {
				dataContext[role.name] = { table: role.source_table, id: selectedId };
			} else {
				allSet = false;
			}
		}

		if (allSet) {
			onPreview(dataContext);
			open = false;
		} else {
			alert('Please select data for all roles.');
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Select Preview Data</Dialog.Title>
			<Dialog.Description>
				Choose sample data to fill the placeholders in your template.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			{#if contextSchema?.roles}
				{#each contextSchema.roles as role (role.name)}
					<div class="space-y-2">
						<Label>{role.label}</Label>
						<!-- Note: This only supports c_bpartner for now as an example -->
						{#if role.source_table === 'c_bpartner'}
							{@const mockField: FieldConfig = {
								name: role.name,
								label: role.label,
								type: 'select',
								required: true,
								options: samplePartners,
								placeholder: `Select a ${role.name}...`,
								validation: {}
							}}
							<SmartSelect field={mockField} bind:value={selectedData[role.name]} />
						{:else}
							<p class="text-sm text-muted-foreground">
								Unsupported source table: {role.source_table}
							</p>
						{/if}
					</div>
				{/each}
			{:else}
				<p class="text-sm text-muted-foreground">
					No roles defined in the template's context schema.
				</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<Button onclick={handlePreviewClick}>Generate Preview</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
