<script lang="ts">
	import { createTabs, melt } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';
	import { setCtx } from './ctx';

	export let tabs: string[] = [];
	const value = writable(tabs[0]);

	const {
		elements: { root, content, list, trigger }
	} = createTabs({
		value
	});

	$: value.set(tabs[0]);

	const tabsStore = writable(tabs);
	$: tabsStore.update(() => tabs);

	setCtx({ root, content, list, trigger, tabs: tabsStore });
</script>

<div use:melt={$root} class="flex flex-col data-[orientation=vertical]:flex-row">
	<slot tab={$value} />
</div>
