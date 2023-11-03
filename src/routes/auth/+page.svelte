<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let email: string;
	let password: string;

	let loading: true;
</script>

<div class="flex h-full items-center justify-center">
	<div class="card w-[320px]">
		<header class="card-header">
			<h4>Log in</h4>
			<p>Don't have account? Contact administrator.</p>
		</header>
		<section class="p-4">
			<form action="?/signin" method="post" use:enhance>
				<div class="grid w-full items-center gap-4">
					<!-- 					{#if form?.signinWithPassword?.error}
						<Alert.Root variant="destructive">
							<RadixIconsExclamationTriangle></RadixIconsExclamationTriangle>
							<Alert.Title>Error</Alert.Title>
							<Alert.Description>
								{form.signinWithPassword.error}
							</Alert.Description>
						</Alert.Root>
					{/if} -->
					<div class="sm:col-span-3">
						<label for="email" class="text-sm font-medium">Email</label>
						<div class="mt-2">
							<input
								class="input"
								id="email"
								name="email"
								title="Input (email)"
								type="email"
								placeholder="john@example.com"
								autocomplete="email"
								value={form?.values?.email ?? ''}
								required
							/>
							<input
								id="email"
								name="email"
								value={form?.values?.email ?? ''}
								type="email"
								required
								placeholder="Enter email"
								class="w-full"
							/>
						</div>
					</div>
					<div class="sm:col-span-3">
						<label for="password" class="text-sm font-medium">Password</label>
						<div class="mt-2">
							<input
								autocomplete="off"
								id="password"
								name="password"
								type="password"
								placeholder="Enter password"
								class="w-full"
							/>
						</div>
					</div>

					<button class="btn" type="submit" disabled={false}>Log in</button>
				</div>
			</form>
		</section>
		<footer class="card-footer">
			<a href="/" type="button"> Forgot your Password? </a>
		</footer>
	</div>
</div>
