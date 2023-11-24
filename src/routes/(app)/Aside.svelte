<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { AlignJustify, LayoutDashboard, Palette, Tag, TestTube2 } from 'lucide-svelte';
	let activePath: string | undefined = undefined;
	$: if (browser) activePath = $page.url.pathname;
	$: console.log('activePath', activePath);
</script>

<aside class="grid grid-rows-[auto_1fr_auto]">
	<div class="flex aspect-square w-full items-center justify-center"><AlignJustify /></div>
	<!-- <AppRail width=""> -->
	<div>
		<div class:bg-surface-2={activePath === '/dashboard'}>
			<a
				href="/dashboard"
				class="m-0 flex aspect-square w-full !max-w-full items-center justify-center p-0"
			>
				<LayoutDashboard size={20} strokeWidth={1.75} />
			</a>
		</div>
		<div class:bg-surface-2={activePath === '/catalog'}>
			<a
				href="/catalog"
				class="m-0 flex aspect-square w-full !max-w-full items-center justify-center p-0"
			>
				<Tag size="20" strokeWidth={1.75} />
			</a>
		</div>
		<div class:bg-surface-2={activePath === '/palette'}>
			<a
				href="/palette"
				class="m-0 flex aspect-square w-full !max-w-full items-center justify-center p-0"
			>
				<Palette size="20" strokeWidth={1.75} />
			</a>
		</div>
		<div class:bg-surface-3={activePath === '/test'}>
			<a
				href="/test"
				class="m-0 flex aspect-square w-full !max-w-full items-center justify-center p-0"
			>
				<TestTube2 size="20" strokeWidth={1.75} />
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
		background-color: hsl(var(--gray-11-hsl));
	}
</style>
