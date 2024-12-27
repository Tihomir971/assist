<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { loginSchema, type LoginSchema } from './schema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { redirect } from '@sveltejs/kit';

	export let data: SuperValidated<Infer<LoginSchema>>;

	const form = superForm(data, {
		validators: zodClient(loginSchema)
	});
	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email and password below to login to your account</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance action="?/login">
			<div class="grid gap-4">
				<Form.Field {form} name="email">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Email</Form.Label>
							<Input {...props} bind:value={$formData.email} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="password">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Password</Form.Label>
							<Input {...props} bind:value={$formData.password} type="password" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button>Login</Form.Button>
			</div>
		</form>
		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a href="##" class="underline"> Sign up </a>
		</div>
	</Card.Content>
</Card.Root>
