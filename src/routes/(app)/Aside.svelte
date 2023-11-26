<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { AlignJustify, LayoutDashboard, Palette, Tag, TestTube2 } from 'lucide-svelte';
	let activePath: string | undefined = undefined;
	$: if (browser) activePath = $page.url.pathname;
</script>

<aside class="grid grid-rows-[auto_1fr_auto]">
	<div class="tile"><AlignJustify /></div>
	<!-- <AppRail width=""> -->
	<div>
		<div class="tile" class:bg-surface-2={activePath === '/dashboard'}>
			<a href="/dashboard">
				<LayoutDashboard size="24" strokeWidth={1.75} />
				<span>Dashboard</span>
			</a>
		</div>
		<div class="tile" class:bg-surface-2={activePath === '/catalog'}>
			<a href="/catalog">
				<Tag size="24" strokeWidth={1.75} />
				<span>Catalog</span>
			</a>
		</div>
		<div class="tile" class:bg-surface-2={activePath === '/palette'}>
			<a href="/palette">
				<Palette size="24" strokeWidth={1.75} />
				<span>Palette</span>
			</a>
		</div>
		<div class="tile" class:bg-surface-3={activePath === '/test'}>
			<a href="/test">
				<TestTube2 size="24" strokeWidth={1.75} />
				<span>Test</span>
			</a>
		</div>
	</div>
	<!-- </AppRail> -->
</aside>

<style lang="postcss">
	aside {
		grid-area: nav;
		position: relative;
		max-width: 100%;
		height: 100%;
		max-height: 100%;
		background-color: var(--well-2);
	}
	.tile {
		font-size: small;
		display: grid;
		place-content: center;
		aspect-ratio: 1 / 1;
		width: 100%;
		&:hover {
			background-color: var(--surface-1);
		}
		a {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin: 0px;
			padding: 0px;
			width: 100%;
			height: 100%;
			text-decoration: none;
		}
	}
</style>
