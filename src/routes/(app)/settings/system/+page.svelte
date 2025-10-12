<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form/index.js';

	let { data } = $props();
	const superform = superForm(data.form);
	const { errors, enhance, message, form } = superform;
</script>

<Card class="mx-auto mt-8 max-h-min w-full max-w-3xl">
	<CardHeader>
		<CardTitle>User Profile</CardTitle>
	</CardHeader>
	<CardContent>
		<form method="post" use:enhance>
			<div class="grid grid-cols-2 gap-4">
				<Form.Field form={superform} name="email" class="col-span-2">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Email</Form.Label>
							<Input {...props} type="email" bind:value={$form.email} />
						{/snippet}
					</Form.Control>
				</Form.Field>

				<div>
					<Label for="first_name">First Name</Label>
					<Input type="text" id="first_name" name="first_name" bind:value={$form.first_name} />
					{#if $errors.first_name}<span class="text-red-500">{$errors.first_name}</span>{/if}
				</div>
				<div>
					<Label for="last_name">Last Name</Label>
					<Input type="text" id="last_name" name="last_name" bind:value={$form.last_name} />
					{#if $errors.last_name}<span class="text-red-500">{$errors.last_name}</span>{/if}
				</div>
				<div>
					<Label for="password">New Password (optional)</Label>
					<Input
						type="password"
						id="password"
						name="password"
						autocomplete="new-password"
						bind:value={$form.password}
					/>
					{#if $errors.password}<span class="text-red-500">{$errors.password}</span>{/if}
				</div>
				<div>
					<Label for="confirm_password">Confirm New Password</Label>
					<Input
						type="password"
						id="confirm_password"
						name="confirm_password"
						autocomplete="new-password"
						bind:value={$form.confirm_password}
					/>
					{#if $errors.confirm_password}<span class="text-red-500">{$errors.confirm_password}</span
						>{/if}
				</div>
			</div>
			<CardFooter class="mt-4 flex justify-end">
				<Button type="submit">Update Profile</Button>
			</CardFooter>
		</form>
	</CardContent>
</Card>
