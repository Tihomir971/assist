<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
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
	<Ellipsis class="size-4" />
</Button>
