<script lang="ts">
	//import { Card } from '$lib/components/card';
	//	import { cn } from '$lib/scripts/tailwind';
	//	import type { HTMLTableAttributes } from 'svelte/elements';

	//	type $$Props = HTMLTableAttributes;

	//	let className: $$Props['class'] = undefined;
	//	let className: string = '';
	//	export { className as class };
</script>

<div class="overflow-x-auto">
	<!-- <div role="region" aria-labelledby="caption" tabindex="-1"> -->
	<!-- <table class={cn('h-full w-full border-collapse overflow-auto', className)} {...$$restProps}> -->
	<table class="table table-pin-rows" {...$$restProps}>
		<slot />
	</table>
</div>
<!-- 
<style lang="postcss">
	[role='region'][aria-labelledby][tabindex] {
		width: 100%;
		max-height: 98vh;
		overflow: auto;
	}
	[role='region'][aria-labelledby][tabindex]:focus {
		box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
		outline: 0;
	}
</style>
 -->
