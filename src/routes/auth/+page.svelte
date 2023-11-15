<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let email: string;
	let password: string;

	let loading: true;
</script>

<!-- <div class="flex h-full items-center justify-center"> -->
<div class="grid place-content-center p-[--size-5] gap-[--size-7] h-screen content-center">
	<!-- <div class="card w-96"> -->
	<form action="?/signin" method="post" use:enhance>
		<!-- <section class="p-4 space-y-4"> -->
		<fieldset>
			<!-- <header class="card-header space-y-4">
				<h3 class="h2">Log in</h3>
			</header> -->
			<!-- 					{#if form?.signinWithPassword?.error}
						<Alert.Root variant="destructive">
							<RadixIconsExclamationTriangle></RadixIconsExclamationTriangle>
							<Alert.Title>Error</Alert.Title>
							<Alert.Description>
								{form.signinWithPassword.error}
							</Alert.Description>
						</Alert.Root>
					{/if} -->
			<div>
				<label for="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					placeholder="Enter email..."
					autocomplete="email"
					value={form?.values?.email ?? ''}
					required
				/>
			</div>
			<div>
				<label for="password"> Password </label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="Enter password"
					autocomplete="off"
					required
				/>
			</div>

			<!-- <button class="btn variant-filled-primary" type="submit" disabled={false}>Log in</button> -->
			<footer>
				<menu>
					<button type="reset">Reset</button>
				</menu>
				<menu>
					<button type="button">Cancel</button>
					<button type="submit" disabled={false}>Log in</button>
				</menu>
			</footer>
			<div>
				<a class="anchor" href="/"> Forgot your Password? </a>
			</div>
			<legend>Log in</legend>
		</fieldset>
		<!-- </section> -->
	</form>
	<footer class="card-footer"></footer>
	<!-- </div> -->
</div>
