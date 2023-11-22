<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { AlignJustify, LayoutDashboard, Palette, Tag, TestTube2 } from 'lucide-svelte';
	let activePath: string | undefined = undefined;
	$: if (browser) activePath = $page.url.pathname;
	$: console.log("activePath", activePath);
	
</script>

<aside class="w-12 grid grid-rows-[auto_1fr_auto] bg-surface-3">
	<div class="w-full aspect-square flex justify-center items-center"><AlignJustify /></div>
	<!-- <AppRail width=""> -->
	<div>
		<div class:bg-surface-2={activePath === '/dashboard'}>
			<a
				href="/dashboard"
				class="m-0 p-0 w-full aspect-square flex justify-center items-center !max-w-full"
			>
				<LayoutDashboard size={20} strokeWidth={1.75} />
			</a>
		</div>
		<div class:bg-surface-2={activePath === '/catalog'}>
			<a
				href="/catalog"
				class="m-0 p-0 w-full aspect-square flex justify-center items-center !max-w-full"
			>
				<Tag size="20" strokeWidth={1.75} />
			</a>
		</div>
		<div class:bg-surface-2={activePath === '/palette'}>
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
