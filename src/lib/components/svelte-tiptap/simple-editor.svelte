<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { createEditor, Editor, EditorContent } from 'svelte-tiptap';
	import StarterKit from '@tiptap/starter-kit';
	import Table from '@tiptap/extension-table';
	import TableCell from '@tiptap/extension-table-cell';
	import TableHeader from '@tiptap/extension-table-header';
	import TableRow from '@tiptap/extension-table-row';
	import TextAlign from '@tiptap/extension-text-align';
	// import ListItem from '@tiptap/extension-list-item';
	// import OrderedList from '@tiptap/extension-ordered-list';
	// import BulletList from '@tiptap/extension-bullet-list';

	import MdiTablePlus from '~icons/mdi/table-plus';
	import MdiTableRemove from '~icons/mdi/table-remove';
	import MdiTableColumnPlusBefore from '~icons/mdi/table-column-plus-before';
	import MdiTableColumnPlusAfter from '~icons/mdi/table-column-plus-after';
	import MdiTableColumnRemove from '~icons/mdi/table-column-remove';
	import MdiTableRowPlusBefore from '~icons/mdi/table-row-plus-before';
	import MdiTableRowPlusAfter from '~icons/mdi/table-row-plus-after';
	import MdiTableRowRemove from '~icons/mdi/table-row-remove';
	import MdiTableMergeCells from '~icons/mdi/table-merge-cells';
	import MdiTableSplitCell from '~icons/mdi/table-split-cell';

	import './tiptap-editor.css';
	import { ToggleGroup } from '@ark-ui/svelte/toggle-group';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Bold,
		Italic,
		Strikethrough,
		Code,
		Heading1,
		Heading2,
		Pilcrow,
		AlignLeft,
		AlignCenter,
		AlignRight,
		AlignJustify,
		List,
		ListOrdered
	} from '@lucide/svelte';

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
		StarterKit,
		Table.configure({
			resizable: true
		}),
		TableRow,
		TableHeader,
		TableCell,
		TextAlign.configure({
			types: ['heading', 'paragraph']
		})
	];

	let editor = $state() as Readable<Editor>;

	onMount(() => {
		editor = createEditor({
			extensions,
			content: content || ``,
			editorProps: {
				attributes: {
					class:
						// 'prose dark:prose-invert min-h-[512px] w-full max-w-none rounded-b-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
						//'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none'
						'prose focus:outline-none bg-white max-w-none'
				}
			},
			onUpdate: ({ editor }) => {
				content = editor.getHTML();
			}
		});
	});

	type Command = () => void;

	type MenuItem = {
		name: string;
		command: Command;
		icon?: Component;
		content?: string;
		active: () => boolean;
		disabled?: () => boolean;
	};

	type MenuGroup = MenuItem[];

	const isActive = (nameOrAttrs: string | Record<string, any>, attrs = {}) => {
		if (!editor) return false;
		if (typeof nameOrAttrs === 'string') {
			return $editor.isActive(nameOrAttrs, attrs);
		}
		return $editor.isActive(nameOrAttrs);
	};

	const headingItems: MenuGroup = $derived([
		{
			name: 'heading-1',
			command: () => $editor?.chain().focus().toggleHeading({ level: 1 }).run(),
			icon: Heading1,
			content: 'H1',
			active: () => isActive('heading', { level: 1 })
		},
		{
			name: 'heading-2',
			command: () => $editor?.chain().focus().toggleHeading({ level: 2 }).run(),
			icon: Heading2,
			content: 'H2',
			active: () => isActive('heading', { level: 2 })
		},
		{
			name: 'paragraph',
			command: () => $editor?.chain().focus().setParagraph().run(),
			icon: Pilcrow,
			content: 'P',
			active: () => isActive('paragraph')
		}
	]);

	const markItems: MenuGroup = $derived([
		{
			name: 'bold',
			command: () => $editor?.chain().focus().toggleBold().run(),
			icon: Bold,
			active: () => isActive('bold'),
			disabled: () => !$editor?.can().chain().focus().toggleBold().run()
		},
		{
			name: 'italic',
			command: () => $editor?.chain().focus().toggleItalic().run(),
			icon: Italic,
			active: () => isActive('italic'),
			disabled: () => !$editor?.can().chain().focus().toggleItalic().run()
		},
		{
			name: 'strike',
			command: () => $editor?.chain().focus().toggleStrike().run(),
			icon: Strikethrough,
			active: () => isActive('strike'),
			disabled: () => !$editor?.can().chain().focus().toggleStrike().run()
		},
		{
			name: 'code',
			command: () => $editor?.chain().focus().toggleCode().run(),
			icon: Code,
			active: () => isActive('code'),
			disabled: () => !$editor?.can().chain().focus().toggleCode().run()
		}
	]);

	const tableItems: MenuGroup = $derived([
		{
			name: 'insertTable',
			command: () =>
				$editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
			icon: MdiTablePlus,
			active: () => false
		},
		{
			name: 'addColumnBefore',
			command: () => $editor?.chain().focus().addColumnBefore().run(),
			icon: MdiTableColumnPlusBefore,
			active: () => false,
			disabled: () => !$editor?.can().addColumnBefore()
		},
		{
			name: 'addColumnAfter',
			command: () => $editor?.chain().focus().addColumnAfter().run(),
			icon: MdiTableColumnPlusAfter,
			active: () => false,
			disabled: () => !$editor?.can().addColumnAfter()
		},
		{
			name: 'deleteColumn',
			command: () => $editor?.chain().focus().deleteColumn().run(),
			icon: MdiTableColumnRemove,
			active: () => false,
			disabled: () => !$editor?.can().deleteColumn()
		},
		{
			name: 'addRowBefore',
			command: () => $editor?.chain().focus().addRowBefore().run(),
			icon: MdiTableRowPlusBefore,
			active: () => false,
			disabled: () => !$editor?.can().addRowBefore()
		},
		{
			name: 'addRowAfter',
			command: () => $editor?.chain().focus().addRowAfter().run(),
			icon: MdiTableRowPlusAfter,
			active: () => false,
			disabled: () => !$editor?.can().addRowAfter()
		},
		{
			name: 'deleteRow',
			command: () => $editor?.chain().focus().deleteRow().run(),
			icon: MdiTableRowRemove,
			active: () => false,
			disabled: () => !$editor?.can().deleteRow()
		},
		{
			name: 'deleteTable',
			command: () => $editor?.chain().focus().deleteTable().run(),
			icon: MdiTableRemove,
			active: () => false,
			disabled: () => !$editor?.can().deleteTable()
		},
		{
			name: 'mergeCells',
			command: () => $editor?.chain().focus().mergeCells().run(),
			icon: MdiTableMergeCells,
			active: () => isActive('tableCell'),
			disabled: () => !$editor?.can().mergeCells()
		},
		{
			name: 'splitCell',
			command: () => $editor?.chain().focus().splitCell().run(),
			icon: MdiTableSplitCell,
			active: () => false,
			disabled: () => !$editor?.can().splitCell()
		}
	]);

	const alignItems: MenuGroup = $derived([
		{
			name: 'align-left',
			command: () => $editor?.chain().focus().setTextAlign('left').run(),
			icon: AlignLeft,
			active: () => isActive({ textAlign: 'left' })
		},
		{
			name: 'align-center',
			command: () => $editor?.chain().focus().setTextAlign('center').run(),
			icon: AlignCenter,
			active: () => isActive({ textAlign: 'center' })
		},
		{
			name: 'align-right',
			command: () => $editor?.chain().focus().setTextAlign('right').run(),
			icon: AlignRight,
			active: () => isActive({ textAlign: 'right' })
		},
		{
			name: 'align-justify',
			command: () => $editor?.chain().focus().setTextAlign('justify').run(),
			icon: AlignJustify,
			active: () => isActive({ textAlign: 'justify' })
		}
	]);

	const listItems: MenuGroup = $derived([
		{
			name: 'bulletList',
			command: () => $editor?.chain().focus().toggleBulletList().run(),
			icon: List,
			active: () => isActive('bulletList')
		},
		{
			name: 'orderedList',
			command: () => $editor?.chain().focus().toggleOrderedList().run(),
			icon: ListOrdered,
			active: () => isActive('orderedList')
		}
	]);

	const menuGroups = $derived([headingItems, markItems, tableItems, alignItems, listItems]);

	let activeValues = $state<string[]>([]);
	$effect(() => {
		if (!editor) return;
		const newActiveValues: string[] = [];
		for (const group of menuGroups) {
			for (const item of group) {
				if (item.active()) {
					newActiveValues.push(item.name);
				}
			}
		}
		activeValues = newActiveValues;
	});
</script>

{#if editor}
	<div class="flex flex-col items-start gap-2 rounded-t-md border border-b-0 border-input p-2">
		<div class="flex items-center gap-2">
			<ToggleGroup.Root value={activeValues}>
				{#each headingItems as item (item.name)}
					<ToggleGroup.Item
						value={item.name}
						aria-label={item.name}
						onclick={item.command}
						disabled={item.disabled?.()}
					>
						{#if item.icon}
							<item.icon />
						{/if}
					</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>

			<Separator orientation="vertical" class="h-6" />

			<ToggleGroup.Root multiple value={activeValues}>
				{#each markItems as item (item.name)}
					<ToggleGroup.Item
						value={item.name}
						aria-label={item.name}
						onclick={item.command}
						disabled={item.disabled?.()}
						class="data-[state=on]:bg-accent data-[state=on]:text-white"
					>
						{#if item.icon}
							<item.icon />
						{/if}
					</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>

			<Separator orientation="vertical" class="h-6" />

			<ToggleGroup.Root value={activeValues}>
				{#each alignItems as item (item.name)}
					<ToggleGroup.Item
						value={item.name}
						aria-label={item.name}
						onclick={item.command}
						disabled={item.disabled?.()}
						class="data-[state=on]:bg-accent data-[state=on]:text-white"
					>
						{#if item.icon}
							<item.icon />
						{/if}
					</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>

			<Separator orientation="vertical" class="h-6" />

			<ToggleGroup.Root value={activeValues}>
				{#each listItems as item (item.name)}
					<ToggleGroup.Item
						value={item.name}
						aria-label={item.name}
						onclick={item.command}
						disabled={item.disabled?.()}
						class="data-[state=on]:bg-accent data-[state=on]:text-white"
					>
						{#if item.icon}
							<item.icon />
						{/if}
					</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
		</div>
		<div class="flex items-center gap-2">
			<ToggleGroup.Root value={activeValues}>
				{#each tableItems as item (item.name)}
					<ToggleGroup.Item
						value={item.name}
						aria-label={item.name}
						onclick={item.command}
						disabled={item.disabled?.()}
						class="data-[state=on]:bg-accent data-[state=on]:text-white"
					>
						{#if item.icon}
							<item.icon />
						{/if}
					</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
		</div>
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
		padding: 0.1rem;
		height: 24px;
		width: 24px;
		/* font-size: 0.875rem; */
		/* font-weight: 500; */
		/* line-height: 1.25rem; */
		color: var(--foreground);
		background-color: var(--background);
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
		/* color: black; */
		color: var(--muted-foreground);
		background-color: var(--muted);
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
