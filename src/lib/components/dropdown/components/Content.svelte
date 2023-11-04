<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getContent } from '../ctx';
	import { cn } from '$lib/scripts/tailwind';

	let className: string | undefined = undefined;
	export { className as class };

	const {
		elements: { menu },
		states: { open }
	} = getContent();
	$: builder = $menu;
</script>

{#if $open}
	<div use:melt={builder} {...$$restProps} class={cn('card z-50 min-w-[8rem] p-1', className)}>
		<slot />
	</div>
{/if}
