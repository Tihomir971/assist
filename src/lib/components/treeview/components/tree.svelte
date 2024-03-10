<script context="module" lang="ts">
	import JS from '$lib/icons/JS.svelte';
	import Svelte from '$lib/icons/Svelte.svelte';

	export const icons = {
		//svelte: Svelte,
		//folder: ChevronRight,
		//	folderOpen: ChevronDown,
		//folderOpen: `<iconify-icon icon="ph:caret-down" width="16" height="16"></iconify-icon>`,
		//js: JS,
		//highlight: ArrowLeft,
		//child: Dot
	};
</script>

<script lang="ts">
	import type { TreeItem } from '..';
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';

	export let treeItems: TreeItem[];
	export let level = 1;

	const {
		elements: { item, group },
		helpers: { isExpanded, isSelected }
	} = getCtx();
</script>

{#each treeItems as { id, title, icon, children }}
	{@const itemId = id.toString()}
	{@const hasChildren = !!children?.length}

	<li>
		<button
			type="button"
			class="active flex w-full items-center gap-1 px-1.5"
			class:active={$isSelected(itemId)}
			class:m4={$isSelected(itemId)}
			use:melt={$item({
				id: itemId,
				hasChildren
			})}
		>
			<!-- Add icon. -->
			{#if hasChildren}
				{#if $isExpanded(itemId)}
					<span class="size-4">
						<!-- <svelte:component this={icons['folderOpen']} class="size-5 text-base-content" /> -->
						<iconify-icon icon="ph:caret-down" width="16" height="16"></iconify-icon>
					</span>
				{:else}
					<span class="size-4">
						<!-- <svelte:component this={icons['folder']} class="size-5 text-base-content" /> -->
						<iconify-icon icon="ph:caret-right" width="16" height="16"></iconify-icon>
					</span>
				{/if}
			{:else}
				<!-- <svelte:component this={icons['child']} class="size-5" /> -->
				<iconify-icon icon="ph:dot-bold" width="16" height="16"></iconify-icon>
			{/if}

			<!-- {#if icon}
				<svelte:component this={icons[icon]} class="h-4 w-4" />
			{/if} -->

			<span class="select-none text-left">{title}</span>
		</button>

		{#if children}
			<ul use:melt={$group({ id: itemId })} class="ms-2">
				<svelte:self treeItems={children} level={level + 1} on:select />
			</ul>
		{/if}
	</li>
{/each}
