<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import type { HTMLThAttributes } from 'svelte/elements';

	type $$Props = HTMLThAttributes;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<th class={cn('px-1 py-2', className)} {...$$restProps}>
	<!-- <th
	class={cn(
		"h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
		className
	)}
	{...$$restProps}
> -->
	<slot />
</th>
