<script lang="ts">
	import commands from '../../../commands/toolbar-commands.js';
	import type { Editor } from '@tiptap/core';
	import ToolBarIcon from '../ToolBarIcon.svelte';

	interface Props {
		editor: Editor;
	}
	const { editor }: Props = $props();

	const tables = commands['table'];

	// Separate always-visible commands from context-dependent ones
	const alwaysVisibleCommands = tables.filter((table) => !table.contextDependent);
	const contextDependentCommands = tables.filter((table) => table.contextDependent);

	// Check if cursor is inside a table to show context-dependent commands
	const isInsideTable = $derived.by(() => {
		return editor && editor.isActive('table');
	});
</script>

<!-- Always show insertTable/deleteTable icon -->
{#each alwaysVisibleCommands as command (command.name)}
	<ToolBarIcon {editor} {command} />
{/each}

<!-- Show context-dependent commands (like mergeOrSplit) only when cursor is inside table -->
{#if isInsideTable}
	{#each contextDependentCommands as command (command.name)}
		<ToolBarIcon {editor} {command} />
	{/each}
{/if}
