<script lang="ts">
	//	import { Toaster } from '$lib/components/toaster';
	import Header from './Header.svelte';
	import Aside from './Aside.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	//	export let data;
	let { data, children } = $props();
</script>

<!-- <Toaster richColors /> -->

<!-- <div class="AppShell h-full max-h-full w-full max-w-full overflow-hidden">
	<div class="AreaHeader">
		<Header supabase={data.supabase}></Header>
	</div>
	<aside class="AreaAside">
		<Aside></Aside>
	</aside>
	<main class="[grid-area:AreaMain]">
		<slot />
	</main>
</div> -->
<div class="grid h-screen w-screen grid-rows-[auto_1fr] overflow-hidden">
	<div class="h-full">
		<Header></Header>
	</div>
	<div class="grid h-full w-full grid-cols-[auto_1fr] overflow-hidden">
		<Aside></Aside>
		<!-- <Header supabase={data.supabase}></Header> -->
		<main class="flex h-full w-full flex-col items-center overflow-hidden p-2">
			<!-- <slot></slot> -->
			{@render children()}
		</main>
	</div>
</div>
<!-- 
<style lang="postcss">
	.AppShell {
		display: grid;
		grid-template-columns: 4rem minmax(0px, 1fr);
		grid-template-rows: 4rem minmax(0px, 1fr);
		gap: 0px 0px;
		grid-auto-flow: row;
		grid-template-areas:
			'AreaHeader AreaHeader'
			'AreaAside AreaMain';
	}

	.AreaHeader {
		grid-area: AreaHeader;
	}

	.AreaAside {
		grid-area: AreaAside;
	}
</style>
 -->
