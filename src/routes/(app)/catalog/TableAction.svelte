<script lang="ts">
	import { goto } from '$app/navigation';
	import { AlignJustify } from 'lucide-svelte';

	import { createDropdownMenu, melt } from '@melt-ui/svelte';
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
