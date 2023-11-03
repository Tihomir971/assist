<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLTableSectionElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<tfoot class={cn('sticky bottom-0', className)} {...$$restProps}>
	<slot />
</tfoot>
<!-- "bg-primary font-medium text-primary-foreground" -->
