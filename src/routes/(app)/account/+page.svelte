<!-- src/routes/account/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Avatar from './Avatar.svelte';

	export let data;
	export let form;

	let { session, supabase, profile } = data;
	$: ({ session, supabase, profile } = data);

	let profileForm: HTMLFormElement;
	let loading = false;
	let fullName: string = profile?.full_name ?? '';
	let username: string = profile?.username ?? '';
	let avatarUrl: string = profile?.avatar_url ?? '';

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async () => {
			loading = false;
		};
	};

	const handleSignOut: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			update();
		};
	};
</script>

<div class="grid h-full place-content-center">
	<div>
		<Avatar
			{supabase}
			bind:url={avatarUrl}
			size={10}
			on:upload={() => {
				profileForm.requestSubmit();
			}}
		/>
		<form method="post" action="?/update" use:enhance={handleSubmit} bind:this={profileForm}>
			<fieldset>
				<div>
					<label for="email">Email</label>
					<input name="email" id="email" type="text" value={session?.user.email} disabled />
				</div>

				<div>
					<label for="fullName">Full Name</label>
					<input id="fullName" name="fullName" type="text" value={form?.fullName ?? fullName} />
				</div>

				<div>
					<label for="username">Username</label>
					<input id="username" name="username" type="text" value={form?.username ?? username} />
				</div>

				<div>
					<input
						type="submit"
						class="button primary block"
						value={loading ? 'Loading...' : 'Update'}
						disabled={loading}
					/>
				</div>
			</fieldset>
		</form>

		<form method="post" action="?/signout" use:enhance={handleSignOut}>
			<div>
				<button class="button block" disabled={loading}>Sign Out</button>
			</div>
		</form>
	</div>
</div>
