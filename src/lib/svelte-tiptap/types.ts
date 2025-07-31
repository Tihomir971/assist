import type { Editor } from '@tiptap/core';
import type { Snippet } from 'svelte';

export interface EdraToolbarProps {
	editor: Editor;
	class?: string;
	excludedCommands?: string[];
	children?: Snippet<[]>;
}
