<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLTableSectionElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<!-- <thead class={cn("[&_tr]:border-b", className)} {...$$restProps}> -->
<thead class={cn('', className)} {...$$restProps}>
	<slot />
</thead>

<style lang="postcss">
	thead {
		position: sticky;
		top: 0;
		z-index: 1;
		inset-block-start: 0;
	}
</style>
