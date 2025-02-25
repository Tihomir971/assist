<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { crudSchema } from './schema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Label } from '$lib/components/ui/label';

	import SuperDebug from 'sveltekit-superforms';
	import { formatDateTime } from '$lib/style/locale';
	import { DateTime, type DateTimeMaybeValid } from 'luxon';
	import Avatar from './Avatar.svelte';

	let { data } = $props();
	const form = superForm(data.form, {
		validators: zodClient(crudSchema)
	});

	const { form: formData, enhance } = form;
	let valueCreated = $state<DateTimeMaybeValid>();

	$effect(() => {
		valueCreated = $formData.created_at ? DateTime.fromISO($formData.created_at) : undefined;
	});
</script>

<div class="grid h-full place-content-center">
	<Card.Root class="rounded-md">
		<Card.Header>
			<Card.Title>Account</Card.Title>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance>
				<div class="space-y-2">
					<Form.Field {form} name="username">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Username</Form.Label>
								<Input {...props} bind:value={$formData.username} />
							{/snippet}
						</Form.Control>
						<Form.Description />
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="full_name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Ful name</Form.Label>
								<Input {...props} bind:value={$formData.full_name} />
							{/snippet}
						</Form.Control>
						<Form.Description />
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email</Form.Label>
								<Input {...props} bind:value={$formData.email} />
							{/snippet}
						</Form.Control>
						<Form.Description />
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Label>Created</Label>
								<Input value={valueCreated?.toISODate()} readonly type="date" />
								<input hidden value={$formData.created_at} name={props.name} />
							{/snippet}
						</Form.Control>
						<Form.Description />
						<Form.FieldErrors />
					</Form.Field>
					<div>
						<Label>Updated</Label>
						<Input value={formatDateTime($formData.updated_at)} readonly />
					</div>
				</div>
			</form>
			<Avatar supabase={data.supabase} bind:url={$formData.avatar_url} size={10} />
		</Card.Content>
		<Card.Footer class="Footer">
			<SuperDebug data={formData} />
		</Card.Footer>
	</Card.Root>
</div>
