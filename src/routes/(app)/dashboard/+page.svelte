<script lang="ts">
	import Combobox from '$lib/components/Zag/Combobox/Combobox.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { tick } from 'svelte';
	import FormCombobox from '$lib/components/my/FormCombobox.svelte';
	import ComboboxDemo from '$lib/components/bits/combobox-demo.svelte';

	let { data } = $props();
	let { session, profile } = $derived(data);
	interface ComboxData {
		label: string;
		value: string;
	}

	const comboboxData: ComboxData[] = [
		{ label: 'United States', value: 'US' },
		{ label: 'Germany', value: 'DE' },
		{ label: 'Japan', value: 'JP' }
	];
	let selectedCountry = $state(['US']);

	let open = $state(false);
	let value = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);
	const selectedValue = $derived(comboboxData.find((f) => f.value === value)?.label);
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

{#if session}
	<!-- <pre>{JSON.stringify(session, null, 2)}</pre> -->
	<pre>{JSON.stringify(profile, null, 2)}</pre>
	<!-- 	<div>
		<Combobox
			data={comboboxData}
			bind:value={selectedCountry}
			label="Select Country"
			placeholder="Select..."
		/>
	</div> -->
{/if}

<FormCombobox />
<ComboboxDemo />
