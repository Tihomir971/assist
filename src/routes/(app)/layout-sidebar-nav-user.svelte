<script lang="ts">
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';

	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Database } from '$lib/types/supabase.types';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let {
		profile,
		supabase
	}: {
		supabase: SupabaseClient<Database>;
		profile: {
			first_name: string | null;
			last_name: string | null;
			avatar_url: string | null;
		} | null;
	} = $props();

	const sidebar = Sidebar.useSidebar();

	let avatarUrl: string | undefined = $state();
	$effect(() => {
		if (!supabase || !profile?.avatar_url) {
			console.warn('Supabase client or path is undefined');
			return undefined;
		}
		const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
		avatarUrl = data.publicUrl;
	});
	function getInitials(name?: string | null) {
		if (!name) {
			return '';
		}
		return name
			.split(' ')
			.map((word) => word[0])
			.join('');
	}
	let fullName = $derived(`${profile?.first_name} ${profile?.last_name}`);
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={avatarUrl} alt={profile?.last_name} />
							<Avatar.Fallback class="rounded-lg">
								{getInitials(fullName)}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{profile?.first_name}</span>
							<span class="truncate text-xs">{fullName}</span>
						</div>
						<ChevronsUpDownIcon class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Group>
					<DropdownMenu.Item onSelect={() => goto('/account/profile')}>
						<BadgeCheckIcon />
						Account
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item onSelect={() => goto('/account/settings')}>
						<CreditCardIcon />
						Settings
					</DropdownMenu.Item>
					<!-- <DropdownMenu.Item>
						<BellIcon />
						Notifications
					</DropdownMenu.Item> -->
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<form method="post" action="/?/signout" use:enhance>
					<DropdownMenu.Item>
						{#snippet children()}
							<button type="submit" class="flex gap-2">
								<LogOutIcon />
								Log out
							</button>
						{/snippet}
					</DropdownMenu.Item>
				</form>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
