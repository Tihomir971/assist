<script lang="ts" generics="T extends Record<string, unknown>, U">
	import { formFieldProxy, type FormFieldProxy } from 'sveltekit-superforms';
	import type { SuperForm, FormPathLeaves } from 'sveltekit-superforms';
	import type { Snippet } from 'svelte';

	type Props = {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, U>;
		children?: Snippet<[FormFieldProxy<U>]>;
	};

	let { superform, field, children }: Props = $props();

	const proxy = formFieldProxy(superform, field);
</script>

{@render children?.(proxy as FormFieldProxy<U>)}
