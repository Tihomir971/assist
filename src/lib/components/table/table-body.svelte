<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLTableSectionElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<tbody class={cn('', className)} {...$$restProps}>
	<!-- <tbody class={cn('overflow-y-auto whitespace-nowrap', className)} {...$$restProps}> -->
	<slot />
</tbody>
