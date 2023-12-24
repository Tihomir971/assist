<script context="module" lang="ts">
	import { ArrowLeft, ChevronRight, ChevronDown, Dot } from 'lucide-svelte';
	import JS from '$lib/icons/JS.svelte';
	import Svelte from '$lib/icons/Svelte.svelte';

	export const icons = {
		svelte: Svelte,
		folder: ChevronRight,
		folderOpen: ChevronDown,
		js: JS,
		highlight: ArrowLeft,
		child: Dot
	};
</script>

<script lang="ts">
	import type { TreeItem } from '..';
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { createEventDispatcher } from 'svelte';

	export let treeItems: TreeItem[];
	export let level = 1;

	const {
		elements: { item, group },
		helpers: { isExpanded, isSelected }
	} = getCtx();

	const dispatch = createEventDispatcher();
</script>

{#each treeItems as { id, title, icon, children }}
	{@const itemId = id.toString()}
	{@const hasChildren = !!children?.length}

	<li>
		<button
			type="button"
			class="title active flex w-full items-center gap-1 px-1.5"
			class:active={$isSelected(itemId)}
			class:m4={$isSelected(itemId)}
			use:melt={$item({
				id: itemId,
				hasChildren
			})}
			on:m-click={() => dispatch('select', itemId)}
		>
			<!-- Add icon. -->
			{#if hasChildren}
				{#if $isExpanded(itemId)}
					<svelte:component this={icons['folderOpen']} class="size-5 text-base-content" />
				{:else}
					<svelte:component this={icons['folder']} class="size-5 text-base-content" />
				{/if}
			{:else}
				<svelte:component this={icons['child']} class="size-5" />
			{/if}

			{#if icon}
				<svelte:component this={icons[icon]} class="h-4 w-4" />
				<!-- {:else}
				<span class="h-4 w-4" /> -->
			{/if}

			<!-- 			{#if icon === 'folder' && hasChildren && $isExpanded(itemId)}
				<svelte:component this={icons['folderOpen']} class="h-4 w-4" />
			{:else}
				<svelte:component this={icons[icon]} class="h-4 w-4" />
			{/if} -->

			<span class="select-none text-left">{title}</span>

			<!-- Selected icon. -->
			<!-- 			{#if $isSelected(itemId)}
				<svelte:component this={icons['highlight']} class="h-4 w-4" />
			{/if} -->
		</button>

		{#if children}
			<ul use:melt={$group({ id: itemId })}>
				<svelte:self treeItems={children} level={level + 1} on:select />
			</ul>
		{/if}
	</li>
{/each}
