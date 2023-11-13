<script lang="ts">
	//import { Card } from '$lib/components/card';
	import { cn } from '$lib/scripts/tailwind';
	//	import type { HTMLTableAttributes } from 'svelte/elements';

	//	type $$Props = HTMLTableAttributes;

	//	let className: $$Props['class'] = undefined;
	let className: string = '';
	export { className as class };
</script>

<!-- <div class="m-1 block max-h-full overflow-auto"> -->
<div class="table-wrapper">
	<table class={className} {...$$restProps}>
		<slot />
	</table>
</div>

<style lang="postcss">
	.table-wrapper {
		width: 100%;
		overflow-x: auto;
		border-radius: var(--theme-rounded-container);
	}
</style>
