<script>
	import { Checkbox } from '$lib/components/checkbox';
	import { Drawer } from '$lib/components/drawer';

	//import { Dialog } from "$lib/Dialog";
	import { melt } from '@melt-ui/svelte';
</script>

<div class="flex items-center space-x-2">
	<div class="p-5">
		<Checkbox id="terms" />
	</div>
	<label
		for="terms"
		class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
	>
		Accept terms and conditions
	</label>
</div>

<Drawer.Content name="settings" let:title let:description let:close>
	<h2 class="font-bold" use:melt={title}>Settings</h2>
	<p use:melt={description}>Placeholder description</p>

	<div class="flex">
		<button class="btn ml-auto mt-4" use:melt={close}> Close </button>
	</div>
</Drawer.Content>

<Drawer.Content name="login" let:title let:description let:close>
	<h2 class="font-bold" use:melt={title}>Login</h2>
	<p use:melt={description}>Placeholder description</p>

	<div class="flex">
		<button class="btn ml-auto mt-4" use:melt={close}> Close </button>
	</div>
</Drawer.Content>

<Drawer.Content name="delete" let:title let:description let:close>
	<h2 class="font-bold" use:melt={title}>Delete</h2>
	<p use:melt={description}>This one can't be closed with Esc!</p>

	<div class="flex">
		<button class="btn ml-auto mt-4 !bg-red-600" use:melt={close}> Delete </button>
	</div>
</Drawer.Content>
