import { HorizontalRule } from '@tiptap/extension-horizontal-rule';

export const CustomHorizontalRule = HorizontalRule.extend({
	name: 'customHorizontalRule',
	addAttributes() {
		return {
			type: {
				default: null,
				// Customize the HTML parsing (for example, to load the initial content)
				parseHTML: (element: HTMLElement) => element.getAttribute('data-type'),
				// … and customize the HTML rendering.
				renderHTML: (attributes: { type?: string }) => {
					if (attributes.type) {
						return {
							'data-type': attributes.type
						};
					}
					return {};
				}
			}
		};
	}
});

export default CustomHorizontalRule;
