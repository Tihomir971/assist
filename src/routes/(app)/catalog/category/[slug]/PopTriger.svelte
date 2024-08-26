<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';

	export let attrs;
	export let id;
	export let data: { value: number; label: string }[];
</script>

<Popover.Trigger
	class={cn(
		buttonVariants({ variant: 'outline' }),
		'w-[200px] justify-between',
		!id && 'text-muted-foreground'
	)}
	role="combobox"
	{...attrs}
>
	{data.find((f) => f.value === id)?.label ?? 'Select ...'}
	<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
</Popover.Trigger>
