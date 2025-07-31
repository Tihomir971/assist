<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import commands from '../../commands/toolbar-commands.js';
	import type { Editor } from '@tiptap/core';
	import Table from '@lucide/svelte/icons/table';
	import EdraToolTip from '../EdraToolTip.svelte';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		editor: Editor;
	}
	const { editor }: Props = $props();

	const tables = commands['table'];

	const isActive = $derived.by(() => {
		return tables.find((table) => table.isActive?.(editor)) !== undefined;
	});

	const TableIcon = $derived.by(() => {
		const a = tables.find((table) => table.isActive?.(editor));
		if (a) return a.icon;
		else return Table;
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<EdraToolTip tooltip="Tables">
			<div
				class={buttonVariants({
					variant: 'ghost',
					size: 'icon',
					class: cn('gap-0')
				})}
				class:bg-muted={isActive}
			>
				<TableIcon />
				<ChevronDown class="!size-2 text-muted-foreground" />
			</div>
		</EdraToolTip>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content portalProps={{ disabled: true, to: undefined }}>
		{#each tables as table (table)}
			{@const Icon = table.icon}
			<DropdownMenu.Item onclick={() => table.onClick?.(editor)}>
				<Icon />
				<span>{table.tooltip}</span>
				<DropdownMenu.Shortcut>
					{table.shortCut}
				</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
