<script lang="ts">
	import type { PageData } from './$types.js';
	import SettingsForm from './signin-form.svelte';
	export let data: PageData;
</script>

<div class="grid h-full place-content-center">
	<SettingsForm data={data.form} />
</div>
