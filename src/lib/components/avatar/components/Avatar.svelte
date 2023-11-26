<script lang="ts">
	import { createAvatar, melt } from '@melt-ui/svelte';
	import type { Props } from '../types';
	import { cn } from '$lib/scripts/tailwind';

	type $$Props = Props;
	export let src: $$Props['src'] = '';
	let className: $$Props['class'] = undefined;
	//let className: string | undefined = undefined;
	export { className as class };

	// export let fallback:string;
	const {
		elements: { image, fallback }
	} = createAvatar({
		src
	});
</script>

<div class={cn('grid aspect-square place-content-center rounded-full bg-surface-4', className)}>
	<img use:melt={$image} alt="Avatar" class="h-full w-full rounded-[inherit]" />
	<span use:melt={$fallback} class="font-medium text-accent">RH</span>
</div>
