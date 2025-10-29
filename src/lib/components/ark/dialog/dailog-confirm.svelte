<script lang="ts">
	import { XIcon } from '@lucide/svelte';
	import { Portal } from '@ark-ui/svelte/portal';
	import { Dialog, type DialogRootProviderBaseProps } from '@ark-ui/svelte/dialog';

	type Props = DialogRootProviderBaseProps & {
		onConfirm: () => void;
	};
	let { value, onConfirm, ...restProps }: Props = $props();
</script>

<Dialog.RootProvider {value}>
	<Portal>
		<Dialog.Backdrop />
		<Dialog.Positioner>
			<Dialog.Content class="z-50 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
				<Dialog.Title>Unsaved Changes</Dialog.Title>
				<Dialog.Description>
					You have unsaved changes. Are you sure you want to close without saving?
				</Dialog.Description>
				<div>
					<button onclick={() => value().setOpen(false)}>Keep Editing</button>
					<button onclick={onConfirm}>Discard Changes</button>
				</div>
				<Dialog.CloseTrigger>
					<XIcon />
				</Dialog.CloseTrigger>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog.RootProvider>
