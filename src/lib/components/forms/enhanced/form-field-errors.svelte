<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type FormFieldErrorsProps = HTMLAttributes<HTMLDivElement> & {
		fieldContext: {
			errors: string[] | undefined;
			ids: {
				input: string;
				label: string;
				description: string;
				error: string;
			};
		};
		errorClasses?: string | undefined | null;
		children?: Snippet<[{ errors: string[]; errorProps: Record<string, any> }]> | undefined;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	type Props = FormFieldErrorsProps;

	let {
		fieldContext,
		errorClasses,
		children: childrenProp,
		class: className,
		...restProps
	}: Props = $props();

	const errors = fieldContext.errors || [];
</script>

<!-- This mimics FormPrimitive.FieldErrors behavior -->
<div
	id={fieldContext.ids.error}
	class={cn('text-sm font-medium text-destructive', className)}
	{...restProps}
>
	{#if childrenProp}
		{@render childrenProp({ errors, errorProps: {} })}
	{:else if errors && errors.length > 0}
		{#each errors as error (error)}
			<div class={cn(errorClasses)}>{error}</div>
		{/each}
	{/if}
</div>
