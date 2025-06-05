<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { crudSchema } from './schema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Label } from '$lib/components/ui/label';

	import { SuperDebug } from 'sveltekit-superforms';
	import { formatDateTime } from '$lib/style/locale';
	import { DateTime, type DateTimeMaybeValid } from 'luxon';
	import Avatar from './Avatar.svelte';
	import { InputTextForm } from '$lib/components/my/input';
	import { dev } from '$app/environment';

	let { data } = $props();
	const superform = superForm(data.form, {
		validators: zodClient(crudSchema)
	});

	const { form: formData, enhance, errors } = superform;
	let valueCreated = $state<DateTimeMaybeValid>();

	$effect(() => {
		valueCreated = $formData.created_at ? DateTime.fromISO($formData.created_at) : undefined;
	});
</script>

<div class="grid h-full place-content-center">
	<Card.Root>
		<Card.Header>
			<Card.Title>Account</Card.Title>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance>
				<div class="space-y-2">
					<InputTextForm {superform} field="username" label="Username" />
					<InputTextForm {superform} field="full_name" label="Full name" />

					<Form.Field form={superform} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email</Form.Label>
								<Input {...props} bind:value={$formData.email} />
							{/snippet}
						</Form.Control>
						<Form.Description />
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field form={superform} name="email">
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

		<SuperDebug data={{ $formData, $errors }} display={dev} />
	</Card.Root>
</div>
