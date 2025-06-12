<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { MouseEventHandler } from 'svelte/elements';

	let {
		onclick
	}: {
		onclick?: MouseEventHandler<HTMLButtonElement> & MouseEventHandler<HTMLAnchorElement>;
	} = $props();
</script>

<Button variant="ghost" size="icon" {onclick}>
	<EllipsisIcon />
</Button>
