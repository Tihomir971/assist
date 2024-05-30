<script lang="ts">
	//	import { Toaster } from '$lib/components/toaster';
	import Header from './Header.svelte';
	import Aside from './Aside.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	export let data;
</script>

<Toaster richColors />

<div class="AppShell h-full max-h-full w-full max-w-full">
	<div class="AreaHeader">
		<Header supabase={data.supabase}></Header>
	</div>
	<aside class="AreaAside">
		<Aside></Aside>
	</aside>
	<main class="[grid-area:AreaMain]">
		<slot />
	</main>
</div>

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
