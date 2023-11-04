<script lang="ts">
	import { goto } from '$app/navigation';
	import { AlignJustify } from 'lucide-svelte';
	//	import { ListBox, ListBoxItem, popup, type PopupSettings } from '@skeletonlabs/skeleton';

	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import { DropdownMenu, Content, Triger, Item } from '$lib/components/dropdown';
	const {
		elements: { menu, item, trigger, arrow }
	} = createDropdownMenu();

	export let id: string | undefined;

	//	let comboboxValue: string;

	//	const popupCombobox: PopupSettings = {
	//		event: 'click',
	//		target: 'popupCombobox',
	//		placement: 'bottom',
	//		closeQuery: '.listbox-item',
	//		state: (e: Record<string, boolean>) => console.log(e)
	//	};
	//	let open = false;
</script>

<!-- <button type="button" use:popup={popupCombobox}>
	<AlignJustify size={16}></AlignJustify>
</button>
<div class="card w-48 shadow-xl py-2 z-50" data-popup="popupCombobox">
	<ListBox rounded="rounded-none">
		<ListBoxItem name="medium" bind:group={comboboxValue} value="id">{id}</ListBoxItem>
		<ListBoxItem
			bind:group={comboboxValue}
			name="medium"
			value="edit"
			on:click={() => goto(`/catalog/product/${id}`)}>Edit</ListBoxItem
		>
		<ListBoxItem bind:group={comboboxValue} name="medium" value="else">Else...</ListBoxItem>
	</ListBox>
	<div class="arrow bg-surface-100-800-token" />
</div> -->
<!-- <button type="button" on:click={() => goto(`/catalog/product/${id}`)}>
	<AlignJustify class="opacity-80 hover:opacity-50 focus:opacity-100"></AlignJustify>
</button>
 -->
<DropdownMenu>
	<Triger>
		<AlignJustify />
		<span class="sr-only">Open Row Actions</span>
	</Triger>
	<Content>
		<Item on:click={() => goto(`/catalog/product/${id}`)}>Edit</Item>
		<Item>Delete</Item>
	</Content>
</DropdownMenu>

<button type="button" class="trigger" use:melt={$trigger} aria-label="Update dimensions">
	<AlignJustify class="square-4" />
	<span class="sr-only">Open Popover</span>
</button>

<!-- {#if $open} -->
<div class="menu" use:melt={$menu} transition:fly={{ duration: 150, y: -10 }}>
	<!-- class menu -->
	<div class="item" use:melt={$item} on:m-click={() => goto(`/catalog/product/${id}`)}>Edit</div>
	<div class="item" use:melt={$item}>Delete</div>
</div>

<!-- {/if} -->

<style lang="postcss">
	.menu {
		@apply z-10 flex max-h-[300px] min-w-[220px] flex-col shadow-lg;
		@apply rounded-md bg-surface-900-50-token p-1 shadow-neutral-900/30 lg:max-h-none;
		@apply ring-0 !important;
	}
	.subMenu {
		@apply min-w-[220px] shadow-md shadow-neutral-900/30;
	}
	.item {
		@apply relative h-6 min-h-[24px] select-none rounded-sm pl-6 pr-1;
		@apply z-20 outline-none;
		@apply data-[highlighted]:bg-primary-200-700-token data-[highlighted]:text-primary-900-50-token;
		@apply data-[disabled]:text-neutral-300;
		@apply flex items-center text-sm leading-none;
		@apply ring-0 !important;
	}
	.trigger {
		@apply inline-flex h-9 w-9 items-center justify-center rounded-full bg-white;
		@apply text-primary-900-50-token transition-colors hover:bg-white/90;
		@apply data-[highlighted]:ring-primary-400-500-token data-[highlighted]:ring-offset-2 !important;
		@apply p-0 text-sm font-medium  data-[highlighted]:outline-none;
	}
	/*   .check {
    @apply absolute left-2 top-1/2 text-magnum-500;
    translate: 0 calc(-50% + 1px);
  } */

	/*  .dot {
    @apply h-[4.75px] w-[4.75px] rounded-full bg-magnum-900;
  } */

	/* .separator {
    @apply m-[5px] h-[1px] bg-magnum-200;
  } */

	/*  .rightSlot {
    @apply ml-auto pl-5;
  } */

	/*  .icon {
    @apply h-[13px] w-[13px];
  } */
	/*  .check {
    @apply absolute left-0 inline-flex w-6 items-center justify-center;
  } */
	/*  .text {
    @apply pl-6 text-xs leading-6 text-neutral-600;
  } */
</style>
