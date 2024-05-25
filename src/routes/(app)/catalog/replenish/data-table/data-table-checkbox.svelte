<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	export let checked: Writable<boolean | 'indeterminate'>;
	//export let checked: boolean | 'indeterminate';
</script>

<Checkbox bind:checked={$checked} />
