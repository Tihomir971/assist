<script lang="ts">
	import './style.css';
	import './editor.css';
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';
	import StarterKit from '@tiptap/starter-kit';
	import { Editor, EditorContent, createEditor } from './lib';
	import { TableKit } from '@tiptap/extension-table';
	import { EdraToolBar } from './index.js';

	const extensions = [StarterKit, TableKit];

	let editor = $state() as Readable<Editor>;

	onMount(() => {
		editor = createEditor({
			extensions,
			editable: true,
			content: `
        <p>This is still the text editor you're used to, but enriched with node views.</p>
        <svelte-counter-component count="0"></svelte-counter-component>
        <p>This is an editable component</p>
        <svelte-editable-component>This is editable</svelte-editable-component>
        <p>Did you see that? That's a Svelte component. We are really living in the future.</p>
      `,
			editorProps: {
				attributes: {
					class: 'border-2 border-black rounded-b-md p-3 outline-hidden'
				}
			}
		});
	});
</script>

<svelte:head>
	<title>Tiptap Svelte</title>
</svelte:head>

<h1 class="mb-2 font-bold">Editor with Nodeview Renderer</h1>

{#if editor}
	<EdraToolBar editor={$editor} />
{/if}
<EditorContent editor={$editor} />
