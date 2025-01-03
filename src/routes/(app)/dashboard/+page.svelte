<script lang="ts">
	import Combobox from '$lib/components/Zag/Combobox/Combobox.svelte';

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
</script>

{#if session}
	<!-- <pre>{JSON.stringify(session, null, 2)}</pre> -->
	<pre>{JSON.stringify(profile, null, 2)}</pre>
	<div>
		<Combobox
			data={comboboxData}
			bind:value={selectedCountry}
			label="Select Country"
			placeholder="Select..."
		/>
	</div>
{/if}
