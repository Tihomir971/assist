import type { Editor } from '@tiptap/core';
import { Icon } from '@lucide/svelte';
import type { Component } from 'svelte';

export interface EdraToolBarCommands {
	name: string;
	icon: typeof Icon | Component;
	tooltip?: string;
	shortCut?: string;
	onClick?: (editor: Editor) => void;
	isActive?: (editor: Editor) => boolean;
	clickable?: (editor: Editor) => boolean;
	contextDependent?: boolean;
}
