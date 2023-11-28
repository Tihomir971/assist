<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import type { HTMLTdAttributes } from 'svelte/elements';

	type $$Props = HTMLTdAttributes;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<td class={cn('h-8 overflow-x-auto truncate  px-1 py-0 !align-middle', className)} {...$$restProps}>
	<slot />
</td>

<!-- <td class={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...$$restProps}> -->

<style lang="postcss">
	td:not(:has(input)) {
		text-align: left;
	}
</style>
