<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	import { enhance } from '$app/forms';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import type { Database } from '$lib/types/supabase/database.types';
	type Props = {
		supabase: SupabaseClient<Database>;
		profile: {
			username: string | null;
			full_name: string | null;
			avatar_url: string | null;
		} | null;
	};
	let { supabase, profile }: Props = $props();

	let formEl: HTMLFormElement;
	let avatarUrl = $state<string | undefined>(undefined);

	const downloadImage = async (path: string) => {
		try {
			const { data, error } = await supabase.storage.from('avatars').download(path);

			if (error) {
				throw error;
			}

			const url = URL.createObjectURL(data);
			return url;
		} catch (error) {
			if (error instanceof Error) {
				console.log('Error downloading image: ', error.message);
			}
			return undefined;
		}
	};

	$effect(() => {
		if (profile?.avatar_url) {
			downloadImage(profile.avatar_url).then((url) => {
				avatarUrl = url;
			});
		}
	});

	const handleSignOut: SubmitFunction = () => {
		return async ({ update }) => {
			update();
		};
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Avatar.Root>
			<Avatar.Image src={avatarUrl} alt="@shadcn" />
			<Avatar.Fallback>CN</Avatar.Fallback>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>My Account</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onSelect={() => goto('/user')}>Settings</DropdownMenu.Item>
		<DropdownMenu.Item>Support</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<form method="post" action="/auth?/signout" use:enhance={handleSignOut} bind:this={formEl}>
			<DropdownMenu.Item
				onclick={() => {
					formEl.requestSubmit();
				}}
			>
				Logout
			</DropdownMenu.Item>
		</form>
	</DropdownMenu.Content>
</DropdownMenu.Root>
