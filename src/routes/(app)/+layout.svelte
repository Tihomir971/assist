<script lang="ts">
	import { page } from '$app/stores';
	import { AppShell, AppBar, AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import { AlignJustify, LayoutDashboard, Package, Palette, Tag, TestTube2 } from 'lucide-svelte';
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
		<AppBar padding="px-4 py-2 bg-sur">
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
	<aside class="w-12 grid grid-rows-[auto_1fr_auto] bg-surface-2">
		<div class="w-full aspect-square flex justify-center items-center"><AlignJustify /></div>
		<!-- <AppRail width=""> -->
		<div>
			<div class:bg-surface-3={activePath === '/dashboard'}>
				<a
					href="/dashboard"
					class="m-0 p-0 w-full aspect-square flex justify-center items-center !max-w-full"
				>
					<LayoutDashboard size={20} strokeWidth={1.75} />
				</a>
			</div>
			<div class:bg-surface-3={activePath === '/catalog'}>
				<a
					href="/catalog"
					class="m-0 p-0 w-full aspect-square flex justify-center items-center !max-w-full"
				>
					<Tag size="20" strokeWidth={1.75} />
				</a>
			</div>
			<div class:bg-surface-3={activePath === '/palette'}>
				<a
					href="/palette"
					class="m-0 p-0 w-full aspect-square flex justify-center items-center !max-w-full"
				>
					<Palette size="20" strokeWidth={1.75} />
				</a>
			</div>
			<div class:bg-surface-3={activePath === '/test'}>
				<a
					href="/test"
					class="w-full aspect-square m-0 p-0 flex justify-center items-center !max-w-full"
				>
					<TestTube2 size="20" strokeWidth={1.75} />
				</a>
			</div>
		</div>
		<!-- </AppRail> -->
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
