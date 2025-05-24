<script lang="ts" module>
	import type { FormPathLeaves, SuperForm, FormPathType } from 'sveltekit-superforms';
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	// Type for the data passed to the children snippet
	export type FieldContext<T extends Record<string, unknown>, P extends FormPathLeaves<T>> = {
		value: FormPathType<T, P> | undefined;
		errors: string[] | undefined;
		constraints: Record<string, string | number | boolean> | undefined;
		tainted: boolean | undefined;
		// Generated IDs for child components
		ids: {
			input: string;
			label: string;
			description: string;
			error: string;
		};
	};

	// Props for the EnhancedFormField component, matching shadcn pattern exactly
	export type EnhancedFormFieldProps<
		T extends Record<string, unknown>,
		P extends FormPathLeaves<T>
	> = {
		form: SuperForm<T>;
		name: P;
		children: Snippet<[FieldContext<T, P>]>; // Snippet that receives form state
	} & WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>, P extends FormPathLeaves<T>">
	import { formFieldProxy } from 'sveltekit-superforms';
	import { cn } from '$lib/utils.js';

	type Props = EnhancedFormFieldProps<T, P>;

	let {
		ref = $bindable(null),
		class: className,
		form,
		name,
		children: childrenProp,
		...restProps
	}: Props = $props();

	const fieldProxy = formFieldProxy(form, name);
	const { value, errors, constraints, tainted } = fieldProxy;

	// Generate a unique base ID for this field (like formsnap does)
	let idCounter = 0;
	const generateBaseId = () => `formsnap-${++idCounter}`;
	const baseId = generateBaseId();

	// Create IDs for child components
	const fieldIds = {
		input: `${baseId}`, // formsnap-1
		label: `${baseId}-label`, // formsnap-1-label
		description: `${baseId}-desc`, // formsnap-1-desc
		error: `${baseId}-error` // formsnap-1-error
	};
</script>

<!-- This mimics FormPrimitive.Field's pattern exactly -->
<div bind:this={ref} class={cn('space-y-2', className)} {...restProps}>
	{@render childrenProp?.({
		constraints: $constraints as Record<string, string | number | boolean> | undefined,
		errors: $errors,
		tainted: $tainted,
		value: $value,
		ids: fieldIds
	})}
</div>
