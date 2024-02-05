<script lang="ts">
	import { derived } from 'svelte/store';
	import { setCtx } from './ctx.js';
	import { melt, type CreateToolbarProps } from '@melt-ui/svelte';

	//  let className:string;
	//   export { className as class };
	type $$Props = CreateToolbarProps & {
		class: string;
	};

	export let loop: $$Props['loop'] = true;
	export let orientation: $$Props['orientation'] = undefined;
	const {
		elements: { root }
	} = setCtx({
		loop,
		orientation
	});

	$: builder = $root;
</script>

<div use:melt={builder} {...$$restProps}>
	<slot {builder} />
</div>
