<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { AlignJustify, LayoutDashboard, Palette, Tag, TestTube2 } from 'lucide-svelte';
	let activePath: string | undefined = undefined;
	$: if (browser) activePath = $page.url.pathname;
</script>

<aside class="grid grid-rows-[auto_1fr_auto]">
	<div class="btn btn-square"><AlignJustify /></div>
	<!-- <AppRail width=""> -->
	<div>
		<div class="tooltip tooltip-right" data-tip="Dashboard">
			<a
				href="/dashboard"
				class="btn btn-square btn-ghost"
				class:btn-active={activePath === '/dashboard'}
			>
				<LayoutDashboard size="24" strokeWidth={1.75} />
			</a>
		</div>
		<div class="tooltip tooltip-right" data-tip="Catalog">
			<a
				href="/catalog"
				class="btn btn-square btn-ghost"
				class:btn-active={activePath === '/catalog'}
			>
				<Tag size="24" strokeWidth={1.75} />
			</a>
		</div>
		<div class="tooltip tooltip-right" data-tip="Test">
			<a href="/test" class="btn btn-square btn-ghost" class:btn-active={activePath === '/test'}>
				<TestTube2 size="24" strokeWidth={1.75} />
			</a>
		</div>
	</div>
	<!-- </AppRail> -->
</aside>
