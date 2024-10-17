<script lang="ts">
	import { authSchema, type AuthSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card/index.js';

	export let data: SuperValidated<Infer<AuthSchema>>;

	const form = superForm(data, {
		validators: zodClient(authSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="post" action="?/signin" use:enhance>
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Enter your email below to login to your account.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-2">
			<Form.Field {form} name="email">
				<Form.Control let:attrs>
					<Form.Label>Email</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.email}
						type="email"
						class="max-w-xs"
						placeholder="m@example.com"
						required
					/>
				</Form.Control>
				<Form.Description>This is your Email.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Form.Label>Password</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.password}
						type="password"
						class="max-w-xs"
						required
					/>
				</Form.Control>
				<Form.Description>This is your password.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
		<Card.Footer>
			<Form.Button class="w-full" type="submit">Sign in</Form.Button>
		</Card.Footer>
	</Card.Root>
</form>
