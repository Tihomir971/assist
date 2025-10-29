import type { FieldRootBaseProps } from '@ark-ui/svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

// export interface Props extends FieldRootProps{}
export interface Props extends FieldRootBaseProps {
	value?: SvelteHTMLElements['input']['value'];
	placeholder?: SvelteHTMLElements['input']['placeholder'];
	label?: string;
}
