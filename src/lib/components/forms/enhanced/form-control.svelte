<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	// Props that FormControl will generate and pass to its children
	export type FormControlProps = {
		id: string;
		name: string;
		'aria-invalid': boolean;
		'aria-describedby': string | undefined;
		required: boolean;
		disabled: boolean;
	};

	// Props for the FormControl component itself - receives field context
	export type FormControlComponentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		fieldContext: {
			constraints: Record<string, string | number | boolean> | undefined;
			errors: string[] | undefined;
			tainted: boolean | undefined;
			value: any;
			ids: {
				input: string;
				label: string;
				description: string;
				error: string;
			};
		};
		children: Snippet<[{ props: FormControlProps }]>; // Snippet that receives props object
	};
</script>

<script lang="ts">
	type Props = FormControlComponentProps;

	let { fieldContext, children, ...restProps }: Props = $props();

	// Generate the props that will be spread to input components using the field IDs
	const inputProps = $derived<FormControlProps>({
		id: fieldContext.ids.input, // Use the generated input ID (e.g., "formsnap-1")
		name: fieldContext.ids.input, // Use same ID for name
		'aria-invalid': !!(fieldContext.errors && fieldContext.errors.length > 0),
		'aria-describedby':
			[
				fieldContext.ids.description,
				fieldContext.errors && fieldContext.errors.length > 0 ? fieldContext.ids.error : undefined
			]
				.filter(Boolean)
				.join(' ') || undefined,
		required: !!fieldContext.constraints?.required,
		disabled: !!fieldContext.constraints?.disabled
	});
</script>

<div {...restProps}>
	{@render children({ props: inputProps })}
</div>
