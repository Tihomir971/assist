<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';
	import { Portal } from '@ark-ui/svelte/portal';
	import { XIcon } from '@lucide/svelte';

	type Props = {
		open: boolean;
	};
	let { open = $bindable() }: Props = $props();
</script>

<Dialog.Root role="alertdialog" bind:open>
	<Dialog.Trigger>Delete Account</Dialog.Trigger>
	<Portal>
		<Dialog.Backdrop />
		<Dialog.Positioner>
			<Dialog.Content>
				<Dialog.Title>Are you absolutely sure?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently delete your account and remove your
					data from our servers.
				</Dialog.Description>
				<div>
					<Dialog.CloseTrigger>Cancel</Dialog.CloseTrigger>
					<button type="button">Delete Account</button>
				</div>
				<Dialog.CloseTrigger>
					<XIcon />
				</Dialog.CloseTrigger>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog.Root>
