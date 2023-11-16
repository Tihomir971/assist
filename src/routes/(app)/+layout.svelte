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
<div class="main-grid">
	<header>
		<!-- App Bar -->
		<AppBar padding="px-4 py-2">
			<svelte:fragment slot="lead">
				<a href="/"><strong class="text-xl uppercase">Kalisi</strong></a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div>
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
						Logout
					</a>
				</div>
			</svelte:fragment>
		</AppBar>
	</header>
	<aside>
		<AppRail width="w-12">
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
	</aside>
	<!-- Page Route Content -->
	<main>
		<slot />
	</main>
</div>

<style lang="postcss">
	.main-grid {
		display: grid;
		grid-template: auto 1fr / auto 1fr;
		width: 100%;
		height: 100vh;
	}
	header {
		grid-column: 1 / 3;
	}
	aside {
		grid-column: 1/2;
	}
	main {
		grid-column: 2/2;
	}
</style>
