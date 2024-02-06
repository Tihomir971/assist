<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { dialogRegistry, type DialogName } from '.';
	import { cn } from '$lib/scripts/tailwind';

	import type { Props } from './types';
	type $$Props = Props;
	export let name: $$Props['name'];
	export let closeOnEscape: $$Props['closeOnEscape'] = undefined;

	//export let name: DialogName;
	//	let className: string = '';
	//	export { className as class };

	const {
		elements: { trigger }
	} = dialogRegistry.get(name);
</script>

<button class={cn('')} use:melt={$trigger}>
	<slot>
		Open {name} Dialog
	</slot>
</button>
