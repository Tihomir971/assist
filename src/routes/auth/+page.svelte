<script lang="ts">
	import LoginForm from './login-form.svelte';
	//import SettingsForm from './signin-form.svelte';

	let { data } = $props();
</script>

<!-- <div class="grid h-full place-content-center">
	<SettingsForm data={data.form} />
</div> -->
<div class="flex h-screen w-full items-center justify-center px-4">
	<LoginForm data={data.form} />
</div>
