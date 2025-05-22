<script lang="ts" module>
	import { formFieldProxy, type FormFieldProxy, type FormPath } from 'sveltekit-superforms';

	// the form object
	type T = Record<string, unknown>;
	// the path/name of the field in the form object
	type U = unknown;
</script>

<script lang="ts" generics="T extends Record<string, unknown>, U extends FormPath<T>">
	import type { FormPathLeaves, SuperForm } from 'sveltekit-superforms';
	import type { Snippet } from 'svelte';

	type Props = {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, number>;
		children?: Snippet<[FormFieldProxy<number | null>]>;
	};
	let { superform, field, children }: Props = $props();

	const { constraints, errors, tainted, value, path } = formFieldProxy(
		superform,
		field
	) satisfies FormFieldProxy<number>;
</script>

{@render children?.({
	path,
	constraints,
	errors,
	tainted,
	value
})}
