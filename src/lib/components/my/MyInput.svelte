<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import PhTextAa from '~icons/ph/text-aa';
	import PhNumpad from '~icons/ph/numpad';
	import PhPlusCircle from '~icons/ph/plus-circle';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';
	import PhMagnifyingGlass from '~icons/ph/magnifying-glass';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';
	import PhArrowSquareUpLeft from '~icons/ph/arrow-square-up-left';
	import PhCursorClick from '~icons/ph/cursor-click';
	import PhFile from '~icons/ph/file';

	type Props = HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
	};

	let {
		ref = $bindable(null),
		value = $bindable(''), // Initialize to empty string or handle potential undefined
		type = 'text',
		readonly,
		class: className,
		step = 1, // Default step is 1
		...restProps
	}: Props = $props();

	function updateValue(isIncrementing: boolean) {
		if (ref) {
			if (isIncrementing) {
				ref.stepUp();
			} else {
				ref.stepDown();
			}
			value = +ref.value;
		}
	}
</script>

<div
	class={cn(
		'flex h-10 w-full items-center rounded-sm border border-solid border-input bg-background px-2 focus-within:border-primary',

		className
	)}
>
	<div class="">
		{#if type === 'number'}
			<PhNumpad class=" text-muted-foreground" />
		{:else if type === 'file'}
			<PhFile class="  text-muted-foreground" />
		{:else if type === 'search'}
			<PhMagnifyingGlass class="text-muted-foreground" />
		{:else if type === 'url'}
			<PhArrowSquareUpLeft class=" text-muted-foreground" />
		{:else}
			<PhTextAa class=" text-base text-muted-foreground" />
		{/if}
	</div>
	<input
		bind:value
		bind:this={ref}
		{type}
		{step}
		class={cn(
			'peer flex h-full w-full [appearance:textfield] items-center border-none pl-2 text-primary-foreground outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
		)}
		{...restProps}
	/>
	{#if readonly}
		<div class="flex h-full items-center text-muted-foreground">
			<button class="flex h-full items-center justify-center rounded-sm" disabled>
				<PhPencilSimpleSlash />
			</button>
		</div>
	{:else if type === 'number' && !readonly}
		<div class="-mx-2 ml-auto flex h-full items-center text-muted-foreground">
			<button
				type="button"
				onclick={() => updateValue(false)}
				class="flex h-full items-center justify-center rounded-sm hover:text-primary-foreground"
				aria-label="Decrement"
			>
				<PhMinus />
			</button>
			<!-- <div class="h-4 w-px bg-muted-foreground"></div> -->
			<button
				type="button"
				onclick={() => updateValue(true)}
				class="flex aspect-square h-full w-full items-center justify-center rounded-sm hover:text-primary-foreground"
				aria-label="Increment"
			>
				<PhPlus />
			</button>
		</div>
	{:else if type === 'url' && value}
		<div
			class="-mx-2 ml-auto flex h-full items-center text-muted-foreground hover:text-primary-foreground"
		>
			<a
				href={value}
				target="_blank"
				class="flex aspect-square h-full items-center justify-center rounded-sm"
				aria-label="Visit URL"
			>
				<PhCursorClick />
			</a>
			<div id="tooltip-1" class="tooltip" popover="auto">Tooltip A</div>
		</div>
	{/if}
</div>
