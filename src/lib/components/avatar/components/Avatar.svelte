<script lang="ts">
	import { createAvatar, melt } from '@melt-ui/svelte';
	import type { Props } from '../types';

	type $$Props = Props;
	export let src: $$Props['src'] = '';

	// export let fallback:string;
	const {
		elements: { image, fallback }
	} = createAvatar({
		src
	});
</script>

<div class="flex w-full items-center justify-center gap-6">
	<div class="flex items-center justify-center rounded-full bg-neutral-100">
		<img use:melt={$image} alt="Avatar" class="h-full w-full rounded-[inherit]" />
		<span use:melt={$fallback} class=" font-medium text-accent">RH</span>
	</div>
</div>
