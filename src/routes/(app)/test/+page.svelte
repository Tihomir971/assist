<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';

	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';
	let open = false;
	let value: number | null = null;

	$: selectedValue = data.data?.find((f) => f.value === value)?.label ?? 'Select a framework...';
	$: frameworks = data.data;
	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	import Combobox2 from '$lib/components/melt/ComboBox2.svelte';
	let mangas = [
		{
			value: 1,
			label: 'Berserk'
		},
		{
			value: 2,
			label: 'Mob Psycho 100'
		},
		{
			value: 3,
			label: 'Attack on Titan'
		},
		{
			value: 4,
			label: 'Uzumaki'
		},
		{
			value: 5,
			label: 'Steins Gate'
		},
		{
			value: 6,
			label: 'Bleach'
		},
		{
			value: 7,
			label: 'Naruto'
		},
		{
			value: 8,
			label: 'D.Gray Man'
		},
		{
			value: 9,
			label: 'Death Note'
		},
		{
			value: 10,
			label: 'Fullmetal Alchemist'
		}
	];
</script>

<Combobox2 options={mangas} name="manga" bind:value></Combobox2>
{value}
OK?
{#if frameworks}
	<Select.Root portal={null}>
		<Select.Trigger class="w-[360px]">
			<Select.Value placeholder="Select a fruit" />
		</Select.Trigger>
		<Select.Content class="h-[200px] w-[360px] overflow-auto">
			<Select.Group>
				<Select.Label class="w-[360px]">Fruits</Select.Label>
				{#each frameworks as fruit}
					<Select.Item value={fruit.value} label={fruit.label}>{fruit.label}</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
		<Select.Input name="favoriteFruit" class="w-[360px]" />
	</Select.Root>
{/if}
