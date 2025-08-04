import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import type { CommandProps } from '@tiptap/core';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		pageBreak: {
			insertPageBreak: () => ReturnType;
			deletePageBreak: () => ReturnType;
		};
	}
}

export const PageBreak = HorizontalRule.extend({
	name: 'pageBreak',
	atom: true,
	priority: 1000, // Higher priority than CustomHorizontalRule
	parseHTML() {
		return [
			{
				tag: 'hr[data-type="page-break"]'
			}
		];
	},
	renderHTML() {
		return [
			'hr',
			{
				'data-type': 'page-break'
			}
		];
	},
	addCommands() {
		return {
			insertPageBreak:
				() =>
				({ chain }: CommandProps) => {
					return chain().insertContent({ type: this.name }).createParagraphNear().focus().run();
				},
			deletePageBreak:
				() =>
				({ state, dispatch }: CommandProps) => {
					const { selection } = state;
					const { $from } = selection;

					// Check if current node is a page break
					if ($from.parent.type.name === this.name) {
						if (dispatch) {
							const tr = state.tr.delete($from.before(), $from.after());
							dispatch(tr);
						}
						return true;
					}

					// Check if there's a page break node at current position
					const pageBreakNode = state.doc.nodeAt(selection.from);
					if (pageBreakNode && pageBreakNode.type.name === this.name) {
						if (dispatch) {
							const tr = state.tr.delete(selection.from, selection.from + pageBreakNode.nodeSize);
							dispatch(tr);
						}
						return true;
					}

					return false;
				}
		};
	},
	addKeyboardShortcuts() {
		return {
			'Mod-Enter': () => this.editor.commands.insertPageBreak(),
			'Mod-Shift-Enter': () => this.editor.commands.deletePageBreak()
		};
	}
});

export default PageBreak;
