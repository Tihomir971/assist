<script lang="ts" module>
	import PhLayout from '~icons/ph/layout';
	import PhTag from '~icons/ph/tag';
	import PhMicrosoftExcelLogo from '~icons/ph/microsoft-excel-logo';
	import PhSquaresFour from '~icons/ph/squares-four';
	import PhFlask from '~icons/ph/flask';
	import SquareTerminalIcon from '@lucide/svelte/icons/square-terminal';
	import BotIcon from '@lucide/svelte/icons/bot';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
	import SendIcon from '@lucide/svelte/icons/send';
	import FrameIcon from '@lucide/svelte/icons/frame';
	import PieChartIcon from '@lucide/svelte/icons/pie-chart';
	import MapIcon from '@lucide/svelte/icons/map';
	import CommandIcon from '@lucide/svelte/icons/command';

	const data = {
		navMain: [
			{
				title: 'Catalog',
				url: '/catalog',
				icon: PhTag,
				items: [
					{
						title: 'Attributes',
						url: '/catalog/product-attributes/attributes'
					},
					{
						title: 'Attribute Groups',
						url: '/catalog/product-attributes/attribute-groups'
					},
					{
						title: 'Attribute Sets',
						url: '/catalog/product-attributes/attribute-sets'
					}
				]
			},
			{
				title: 'Import/Export',
				url: '/excel',
				icon: PhMicrosoftExcelLogo
			},
			{
				title: 'Laboratory',
				url: '/lab',
				icon: PhFlask
			}
		]
	};
</script>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SidebarNavMain from './layout-sidebar-nav-main.svelte';
	import SidebarNavUser from './layout-sidebar-nav-user.svelte';
	import PhList from '~icons/ph/list';
	import PhFolders from '~icons/ph/folders';
	import type { ComponentProps } from 'svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/supabase.types';

	let {
		ref = $bindable(null),
		profile,
		supabase,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		supabase: SupabaseClient<Database>;
		profile: {
			first_name: string | null;
			last_name: string | null;
			avatar_url: string | null;
		} | null;
	} = $props();

	const path = $derived(page.url.pathname);
</script>

<div>
	<Sidebar.Root
		class="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
		collapsible="icon"
		{...restProps}
	>
		<!-- <Sidebar.Header>Header</Sidebar.Header> -->
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg">
						{#snippet child({ props })}
							<a href="/dashboard" {...props}>
								<div
									class="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground"
								>
									<img src="/FluentEmojiFlatRedHeart.svg" alt="Logo" class="size-6" />
									<!-- <CommandIcon class="size-4" /> -->
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">Kalisi doo</span>
									<span class="truncate text-xs">Enterprise</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>
		<Sidebar.Content>
			<SidebarNavMain items={data.navMain} />
		</Sidebar.Content>
		<Sidebar.Footer>
			<SidebarNavUser {profile} {supabase} />
		</Sidebar.Footer>
	</Sidebar.Root>
</div>
