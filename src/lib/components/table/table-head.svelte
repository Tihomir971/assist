<script lang="ts">
	import { cn } from '$lib/scripts/tailwind';
	import type { HTMLThAttributes } from 'svelte/elements';

	type $$Props = HTMLThAttributes;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<th class={cn('', className)} {...$$restProps}>
	<slot />
</th>
