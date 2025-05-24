<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type FormLabelProps = HTMLAttributes<HTMLLabelElement> & {
		fieldContext: {
			ids: {
				input: string;
				label: string;
				description: string;
				error: string;
			};
		};
		children: Snippet; // Snippet function for label content
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	type Props = FormLabelProps;

	let { fieldContext, class: className, children, ...restProps }: Props = $props();
</script>

<label
	id={fieldContext.ids.label}
	for={fieldContext.ids.input}
	class={cn(
		'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[fs-error]:text-destructive',
		className
	)}
	{...restProps}
>
	{@render children()}
</label>
