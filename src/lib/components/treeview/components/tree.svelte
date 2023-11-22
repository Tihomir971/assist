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

	<li class={level !== 1 ? 'pl-4' : ''}>
		<!-- class="flex items-center bg-transparent gap-1 p-1 w-full hover:bg-accent/20 border-none justify-start" -->
		<button
			type="button"
			class:!bg-accent={$isSelected(itemId)}
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
					<svelte:component this={icons['folderOpen']} class="h-4 w-4" />
				{:else}
					<svelte:component this={icons['folder']} class="h-4 w-4" />
				{/if}
			{:else}
				<svelte:component this={icons['child']} class="h-4 w-4 text-text-1" />
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

<style lang="postcss">
	button {
		background-color: inherit;
		border: none;
		box-shadow: none;
		padding-inline: 0px;
		width: 100%;
		justify-content: start;
		text-shadow: none;
		font-weight: unset;
	}
</style>
