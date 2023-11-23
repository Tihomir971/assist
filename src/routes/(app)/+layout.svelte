<script lang="ts">
	import { Toaster } from '$lib/components/toaster';
	import Header from './Header.svelte';
	import Aside from './Aside.svelte';
</script>

<!-- App Shell -->
<Toaster />
<div class="flex h-full flex-col">
	<Header></Header>
	<div class="flex h-full">
		<Aside></Aside>
		<!-- Page Route Content -->
		<main class="w-full">
			<slot />
		</main>
	</div>
</div>
