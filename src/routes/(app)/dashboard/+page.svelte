<script lang="ts">
	import FormCombobox from '$lib/components/my/FormCombobox.svelte';

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
</script>

{#if session}
	<pre>{JSON.stringify(profile, null, 2)}</pre>
{/if}

<FormCombobox />
