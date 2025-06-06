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

<Card class="mx-auto mt-8 w-full max-w-md">
	<CardHeader>
		<CardTitle>User Profile</CardTitle>
	</CardHeader>
	<CardContent>
		<form method="post" use:enhance>
			<div class="space-y-4">
				<Form.Field form={superform} name="email">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Email</Form.Label>
							<Input {...props} type="email" bind:value={$form.email} />
						{/snippet}
					</Form.Control>
				</Form.Field>

				<div>
					<Label for="full_name">Full Name</Label>
					<Input type="text" id="full_name" name="full_name" bind:value={$form.full_name} />
					{#if $errors.full_name}<span class="text-red-500">{$errors.full_name}</span>{/if}
				</div>
				<div>
					<Label for="username">Username</Label>
					<Input type="text" id="username" name="username" bind:value={$form.username} />
					{#if $errors.username}<span class="text-red-500">{$errors.username}</span>{/if}
				</div>
				<div>
					<Label for="password">New Password (optional)</Label>
					<Input type="password" id="password" name="password" bind:value={$form.password} />
					{#if $errors.password}<span class="text-red-500">{$errors.password}</span>{/if}
				</div>
				<div>
					<Label for="confirm_password">Confirm New Password</Label>
					<Input
						type="password"
						id="confirm_password"
						name="confirm_password"
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

{#if $message}
	<div class="mt-4 rounded-md bg-green-100 p-4 text-green-700">
		{$message}
	</div>
{/if}
