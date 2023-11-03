<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLTableRowElement> & {
		'data-state'?: unknown;
	};

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<tr class={cn('data-[state=selected]:bg-white', className)} {...$$restProps}>
	<!-- <tr class={cn('data-[state=selected]:bg-pink-4', className)} {...$$restProps}> -->
	<!-- <tr
	class={cn(
		"border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
		className
	)}
	{...$$restProps}
> -->
	<slot />
</tr>
