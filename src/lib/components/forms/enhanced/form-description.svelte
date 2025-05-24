<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type FormDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
		fieldContext: {
			ids: {
				input: string;
				label: string;
				description: string;
				error: string;
			};
		};
		children: Snippet; // Snippet function for description content
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	type Props = FormDescriptionProps;

	let { fieldContext, class: className, children, ...restProps }: Props = $props();
</script>

<!-- This mimics FormPrimitive.Description behavior -->
<!-- The description gets proper ID for aria-describedby reference -->
<p
	id={fieldContext.ids.description}
	class={cn('text-sm text-muted-foreground', className)}
	{...restProps}
>
	{@render children()}
</p>
