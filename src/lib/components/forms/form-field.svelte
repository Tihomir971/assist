<script lang="ts" module>
	import type { FormFieldContext } from './core/types.js';
	import type { SuperForm, FormPath } from 'sveltekit-superforms';

	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import { formFieldProxy } from 'sveltekit-superforms';
	import { setContext } from 'svelte';

	type Props = {
		form: SuperForm<T>;
		name: FormPath<T>;
		children: any;
	};

	let { form, name, children }: Props = $props();

	// Create the form field proxy for superforms integration
	const fieldProxy = formFieldProxy(form, name as any);
	const { value, errors, constraints, tainted } = fieldProxy;

	// Create the context for child components with reactive getters
	const context: FormFieldContext = {
		isFormMode: true,
		name: name, // Pass the name to the context
		fieldProxy: fieldProxy as any,
		get currentValue() {
			return $value as number | undefined;
		},
		get currentErrors() {
			return $errors;
		},
		get currentConstraints() {
			return $constraints;
		},
		get currentTainted() {
			return $tainted ?? false;
		}
	};

	// Set the context so child components can access it
	setContext('form-field', context);
</script>

<!-- Render children with the form context -->
{@render children()}
