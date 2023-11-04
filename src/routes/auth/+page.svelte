<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let email: string;
	let password: string;

	let loading: true;
</script>

<div class="flex h-full items-center justify-center">
	<div class="card w-96">
		<header class="card-header space-y-4">
			<h1 class="h2">Log in</h1>
			<p>Don't have account? Contact administrator.</p>
		</header>
		<form action="?/signin" method="post" use:enhance>
			<section class="p-4 space-y-4">
				<!-- 					{#if form?.signinWithPassword?.error}
						<Alert.Root variant="destructive">
							<RadixIconsExclamationTriangle></RadixIconsExclamationTriangle>
							<Alert.Title>Error</Alert.Title>
							<Alert.Description>
								{form.signinWithPassword.error}
							</Alert.Description>
						</Alert.Root>
					{/if} -->
				<label class="label">
					<span>Email</span>
					<input
						class="input"
						id="email"
						name="email"
						type="email"
						placeholder="Enter email..."
						autocomplete="email"
						value={form?.values?.email ?? ''}
						required
					/>
				</label>
				<label class="label">
					<span>Password</span>
					<input
						class="input"
						id="password"
						name="password"
						type="password"
						placeholder="Enter password"
						autocomplete="off"
						required
					/>
				</label>

				<button class="btn variant-filled-primary" type="submit" disabled={false}>Log in</button>
			</section>
		</form>
		<footer class="card-footer">
			<a class="anchor" href="/"> Forgot your Password? </a>
		</footer>
	</div>
</div>
