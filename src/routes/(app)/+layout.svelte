<script lang="ts">
	import { page } from '$app/stores';
	import { AppShell, AppBar, AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import { LayoutDashboard, Package, Tag } from 'lucide-svelte';
	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { browser } from '$app/environment';
	import { Toaster } from '$lib/components/toaster';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	let activePath: string | undefined = undefined;
	$: if (browser) activePath = $page.url.pathname;
</script>

<!-- App Shell -->
<Toaster />
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar padding="px-4 py-2">
			<svelte:fragment slot="lead">
				<a href="/"><strong class="text-xl uppercase">Kalisi</strong></a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://discord.gg/EXqV7W8MtY"
					target="_blank"
					rel="noreferrer"
				>
					Discord
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://twitter.com/SkeletonUI"
					target="_blank"
					rel="noreferrer"
				>
					Twitter
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/skeletonlabs/skeleton"
					target="_blank"
					rel="noreferrer"
				>
					GitHub
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft"
		><AppRail width="w-12">
			<AppRailAnchor
				href="/dashboard"
				selected={activePath === '/dashboard'}
				regionLabel="flex justify-center items-center"
			>
				<LayoutDashboard size={20} strokeWidth={1.75} />
			</AppRailAnchor>
			<AppRailAnchor
				href="/catalog"
				selected={activePath === '/catalog'}
				regionLabel="flex justify-center items-center"
			>
				<Tag size="20" strokeWidth={1.75} />
			</AppRailAnchor>
		</AppRail>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
