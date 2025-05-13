<script lang="ts">
	import PhDotsThreeBold from '~icons/ph/dots-three-bold';
	import { Button } from '$lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { id }: { id: string } = $props();
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={() => {
		goto(`/catalog/products/${id}?${page.url.searchParams}`);
	}}
	class="relative size-8 p-0"
>
	<span class="sr-only">Edit product</span>
	<PhDotsThreeBold />
</Button>
