<script lang="ts">
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { createEditor, Editor, EditorContent } from 'svelte-tiptap';
	import StarterKit from '@tiptap/starter-kit';
	import { cn } from '$lib/utils';
	import './tiptap-editor.css';
	import { ToggleGroup, useToggleGroup } from '@ark-ui/svelte/toggle-group';
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
			},
			onUpdate: ({ editor }) => {
				content = editor.getHTML();
			}
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
	const id = $props.id();
	const toggleGroup = useToggleGroup({ id });
	$inspect('tougleGroup', toggleGroup());
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
		<ToggleGroup.RootProvider value={toggleGroup}>
			{#each menuItems as item (item.name)}
				<ToggleGroup.Item value={item.name}>{item.content}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.RootProvider>
	</div>
{/if}

<EditorContent editor={$editor} />

<style>
	:global([data-scope='toggle-group']) {
		/* Container styles */
		display: inline-flex;
		border: 1px solid hsl(var(--border));
		border-radius: var(--radius);
		background-color: hsl(var(--background));
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	:global([data-scope='toggle-group'][data-orientation='horizontal']) {
		flex-direction: row;
	}

	:global([data-scope='toggle-group'][data-orientation='vertical']) {
		flex-direction: column;
	}

	:global([data-part='item']) {
		/* Base item styles */
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.25rem;
		color: hsl(var(--foreground));
		background-color: transparent;
		border: 0;
		cursor: pointer;
		transition: all 0.15s ease-in-out;
		user-select: none;

		/* Remove default button styles */
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
	}

	:global([data-part='item']:first-child) {
		border-top-left-radius: calc(var(--radius) - 1px);
		border-bottom-left-radius: calc(var(--radius) - 1px);
	}

	:global([data-part='item']:last-child) {
		border-top-right-radius: calc(var(--radius) - 1px);
		border-bottom-right-radius: calc(var(--radius) - 1px);
	}

	:global([data-scope='toggle-group'][data-orientation='vertical'] [data-part='item']:first-child) {
		border-top-left-radius: calc(var(--radius) - 1px);
		border-top-right-radius: calc(var(--radius) - 1px);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	:global([data-scope='toggle-group'][data-orientation='vertical'] [data-part='item']:last-child) {
		border-bottom-left-radius: calc(var(--radius) - 1px);
		border-bottom-right-radius: calc(var(--radius) - 1px);
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	:global([data-part='item']:not(:last-child)) {
		border-right: 1px solid hsl(var(--border));
	}

	:global(
		[data-scope='toggle-group'][data-orientation='vertical'] [data-part='item']:not(:last-child)
	) {
		border-right: 0;
		border-bottom: 1px solid hsl(var(--border));
	}

	:global([data-part='item'][data-state='off']) {
		color: black;
		/* color: hsl(var(--muted-foreground)); */
	}

	:global([data-part='item'][data-state='on']) {
		background-color: hsl(var(--accent));
		color: white;
		/* color: hsl(var(--accent-foreground)); */
	}

	:global([data-part='item']:hover:not([data-disabled])) {
		background-color: hsl(var(--accent) / 0.5);
	}

	:global([data-part='item'][data-state='on']:hover:not([data-disabled])) {
		background-color: hsl(var(--accent));
	}

	:global([data-part='item'][data-focus]) {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 2px;
		z-index: 1;
	}

	:global([data-part='item'][data-disabled]) {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	:global([data-part='item']:active:not([data-disabled])) {
		transform: scale(0.98);
	}
</style>
