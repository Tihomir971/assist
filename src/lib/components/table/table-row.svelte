<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLTableRowElement> & {
		'data-state'?: unknown;
	};

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<tr
	class={cn(
		'border-b transition-colors  hover:!bg-surface-2 data-[state=selected]:bg-white',
		className
	)}
	{...$$restProps}
>
	<slot />
</tr>
