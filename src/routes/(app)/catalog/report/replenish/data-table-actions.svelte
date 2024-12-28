<script lang="ts">
	import PhDotsThreeBold from '~icons/ph/dots-three-bold';
	import { Button } from '$lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';

	let { id }: { id: string } = $props();
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={() => {
		goto(`/catalog/products/${id}`);
	}}
	class="relative size-8 p-0"
>
	<span class="sr-only">Edit product</span>
	<PhDotsThreeBold />
</Button>
