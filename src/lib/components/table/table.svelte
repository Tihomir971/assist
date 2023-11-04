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
<div class="table-container">
	<table class={cn('table table-compact table-hover', className)} {...$$restProps}>
		<slot />
	</table>
</div>

<!-- <table class={cn('h-full w-full ', className)} {...$$restProps}> -->
<!-- <table class={cn("w-full caption-bottom text-sm", className)} {...$$restProps}> -->
