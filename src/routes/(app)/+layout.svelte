<script lang="ts">
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { Toaster } from '$lib/components/toaster';
	import Header from './Header.svelte';
	import Aside from './Aside.svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<!-- App Shell -->
<Toaster />
<div class="flex flex-col h-full">
	<Header></Header>
	<div class="flex h-full">
		<Aside></Aside>
		<!-- Page Route Content -->
		<main class="w-full">
			<slot />
		</main>
	</div>
</div>
