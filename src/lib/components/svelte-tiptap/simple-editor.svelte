<script lang="ts">
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { createEditor, Editor, EditorContent } from 'svelte-tiptap';
	import StarterKit from '@tiptap/starter-kit';
	import { cn } from '$lib/utils';
	import './tiptap-editor.css';

	// Define Content type based on TipTap's expected content types
	type HTMLContent = string;
	type JSONContent = {
		type?: string;
		attrs?: Record<string, any>;
		content?: JSONContent[];
		marks?: {
			type: string;
			attrs?: Record<string, any>;
			[key: string]: any;
		}[];
		text?: string;
		[key: string]: any;
	};

	type Content = HTMLContent | JSONContent | JSONContent[] | null;
	type Props = { content?: Content | undefined };

	let { content = $bindable() }: Props = $props();

	const extensions = [
		StarterKit
		// SvelteCounterExtension,
		// SvelteEditableExtension,
		// Placeholder.configure({ placeholder: 'Write something...' }),
	];

	let editor = $state() as Readable<Editor>;
	onMount(() => {
		editor = createEditor({
			extensions,
			content: content || `Hello world!`,
			editorProps: {
				attributes: {
					class: 'border-2 border-black rounded-b-md p-3 outline-hidden'
				}
			}
			/* onUpdate: ({ editor }) => {
				content = editor.getHTML();
			} */
		});
	});

	const toggleHeading = (level: 1 | 2) => {
		return () => {
			$editor.chain().focus().toggleHeading({ level }).run();
		};
	};

	const setParagraph = () => {
		$editor.chain().focus().setParagraph().run();
	};

	const toggleBold = () => {
		$editor.chain().focus().toggleBold().run();
	};

	const toggleItalic = () => {
		$editor.chain().focus().toggleItalic().run();
	};

	const isActive = (name: string, attrs = {}) => $editor.isActive(name, attrs);

	const menuItems = $derived([
		{
			name: 'heading-1',
			command: toggleHeading(1),
			content: 'H1',
			active: () => isActive('heading', { level: 1 })
		},
		{
			name: 'heading-2',
			command: toggleHeading(2),
			content: 'H2',
			active: () => isActive('heading', { level: 2 })
		},
		{
			name: 'paragraph',
			command: setParagraph,
			content: 'P',
			active: () => isActive('paragraph')
		},
		{
			name: 'bold',
			command: toggleBold,
			content: 'B',
			active: () => isActive('bold')
		},
		{
			name: 'italic',
			command: toggleItalic,
			content: 'I',
			active: () => isActive('italic')
		}
	]);
</script>

{#if editor}
	<div class="flex gap-1 rounded-t-md border-2 border-b-0 border-black p-2">
		{#each menuItems as item (item.name)}
			<button
				type="button"
				class={cn('h-7 w-7 rounded-sm hover:bg-black hover:text-white', {
					'bg-black text-white': item.active()
				})}
				onclick={item.command}
			>
				{item.content}
			</button>
		{/each}
	</div>
{/if}

<EditorContent editor={$editor} />
