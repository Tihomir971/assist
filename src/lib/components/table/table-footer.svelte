<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLTableSectionElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<tfoot class={cn(className)} {...$$restProps}>
	<slot />
</tfoot>
<!-- 
<style lang="postcss">
	tfoot {
		position: sticky;
		bottom: 0;
		inset-block-start: 0;
	}
</style>
 -->
