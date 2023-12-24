<script lang="ts">
	import { Toaster } from '$lib/components/toaster';
	import Header from './Header.svelte';
	import Aside from './Aside.svelte';
</script>

<!-- App Shell -->
<Toaster />
<!-- <div class="flex h-full flex-col"> -->
<div class="AppLayout h-full w-full">
	<div class="h-full [grid-area:title-bar]">
		<Header></Header>
	</div>
	<div class="bg-base-100 [grid-area:aside]">
		<Aside></Aside>
	</div>
	<!-- Page Route Content -->
	<main class="w-full [grid-area:main]">
		<slot />
	</main>
</div>

<style lang="postcss">
	.AppLayout {
		max-width: 100%;
		max-height: 100%;
		display: grid;
		grid-template-areas:
			'title-bar title-bar'
			'aside main';
		grid-template-rows: 4rem minmax(0px, 1fr);
		grid-template-columns: 3rem minmax(0px, 1fr);
		transition-delay: 0ms, 146ms;
		transition-duration: 146ms, 0ms;
		transition-timing-function: cubic-bezier(0.3, 0, 0.6, 1);
		transition-property: height, width;
	}
</style>
