<script lang="ts">
	import LoginForm from './login-form.svelte';

	let { data } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<LoginForm data={data.form} />
</div>
