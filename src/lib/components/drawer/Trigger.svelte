<script lang="ts">
	import { melt, type CreateDialogProps } from '@melt-ui/svelte';
	import { dialogRegistry } from '.';
	import { cn } from '$lib/scripts/tailwind';

	import type { DialogName } from './types';
	import type { HTMLAttributes } from 'svelte/elements';

	export let name: DialogName;
	export let role: CreateDialogProps['role'] = undefined;
	export let closeOnEscape: CreateDialogProps['closeOnEscape'] = undefined;
	export let closeOnOutsideClick: CreateDialogProps['closeOnOutsideClick'] = undefined;
	export let className: HTMLAttributes<HTMLDivElement>['class'];
	export { className as class };

	//	export let closeOnEscape: $$Props['closeOnEscape'] = undefined;

	const {
		elements: { trigger }
	} = dialogRegistry.get(name, { role, closeOnEscape, closeOnOutsideClick });
</script>

<button class={cn('', className)} use:melt={$trigger}>
	<slot>
		Open {name} Dialog
	</slot>
</button>
