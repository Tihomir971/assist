<script lang="ts">
	import InputTextForm from '$lib/components/my/input/input-text-form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { superForm } from 'sveltekit-superforms/client';

	let { data } = $props();

	// Edit form
	const superform = superForm(data.form, {
		onUpdated: ({ form }) => {
			if (form.valid) {
				// Display success message or toast
			}
		}
	});
	const { form, enhance, errors, message } = superform;
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Edit Attribute Group</h1>
			<p class="text-muted-foreground">Update attribute group details</p>
		</div>
		<Button variant="outline" href="/catalog/product-attributes/attribute-groups">
			Back to List
		</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Attribute Group Details</Card.Title>
			<Card.Description>Update the name and status of this attribute group</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/update" use:enhance>
				<input type="hidden" name="id" value={$form.id} />

				<div class="grid gap-6">
					<InputTextForm {superform} field="name" label="Name" placeholder="Attribute Group Name" />

					<div class="flex items-center gap-2">
						<Switch
							name="is_active"
							checked={$form.is_active === null ? false : $form.is_active}
							onCheckedChange={(checked) => ($form.is_active = checked)}
						/>
						<Label for="is_active">Active</Label>
					</div>

					<div class="flex justify-end gap-2">
						<Button type="submit">Save Changes</Button>
					</div>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
