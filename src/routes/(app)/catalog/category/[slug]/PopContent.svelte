<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils';
	import Check from 'lucide-svelte/icons/check';

	export let data: { value: number; label: string }[];
	export let value: number | null | undefined;
	export let open: boolean;
	export let ids: {
		content: string;
		trigger: string;
	};

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<Popover.Content class="max-h-[300px] w-[200px] p-0">
	<Command.Root class="overflow-auto">
		<Command.Input autofocus placeholder="Search ..." class="h-9" />
		<Command.Empty>Not found.</Command.Empty>
		<Command.Group>
			{#each data as each}
				<Command.Item
					value={each.label}
					onSelect={() => {
						value = each.value;
						closeAndFocusTrigger(ids.trigger);
					}}
				>
					{each.label}
					<Check class={cn('ml-auto h-4 w-4', each.value !== value && 'text-transparent')} />
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.Root>
</Popover.Content>
