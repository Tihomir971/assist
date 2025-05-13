<script lang="ts">
	import { cn } from '$lib/utils.js';

	interface Props {
		name: string;
		value?: any;
		options: { value: any; label: string }[];
		class?: string;
	}
	let { name, value = $bindable(), options, class: className }: Props = $props();
</script>

<select
	{name}
	bind:value
	class={cn(
		'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid]:border-destructive [&>span]:line-clamp-1',
		className
	)}
>
	<!-- <option value={null} class="text-muted-foreground">-- Select Parent Category --</option> -->
	{#each options as option}
		<option value={option.value}>{option.label}</option>
	{/each}
</select>
