<script lang="ts">
	import type { TreeItem, Props } from '..';
	import Tree from './tree.svelte';
	import { setCtx } from '../ctx';
	import { createSync } from '@melt-ui/svelte';
	import { cn } from '$lib/scripts/tailwind';

	export let treeItems: TreeItem[];

	export let forceVisible: Props['forceVisible'] = undefined;
	export let onExpandedChange: Props['onExpandedChange'] = undefined;

	export let selected: HTMLElement | null = null;
	export let expanded: string[] = [];

	const {
		elements: { tree },
		states
	} = setCtx({ forceVisible, onExpandedChange });

	const sync = createSync(states);
	$: sync.expanded(expanded, (v) => (expanded = v));
	$: sync.selectedItem(selected, (v) => (selected = v));
</script>

<ul class={cn('menu flex-nowrap py-0', { ...$tree })}>
	<!-- <ul class="cn()menu h-full w-full flex-nowrap py-0" {...$tree}> -->
	<Tree {treeItems} />
</ul>
