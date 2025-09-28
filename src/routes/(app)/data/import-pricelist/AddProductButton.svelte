<script lang="ts">
	import PhPlus from '~icons/ph/plus';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		product,
		onAdd
	}: { product: import('./types').Product; onAdd: (product: import('./types').Product) => void } =
		$props();
</script>

<Button variant="default" size="icon" onclick={() => onAdd(product)} class="size-8 p-0">
	<span class="sr-only">Add product</span>
	<PhPlus />
</Button>
