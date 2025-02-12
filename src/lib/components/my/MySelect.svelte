<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	type Props = {
		value?: any;
		options: { value: any; label: string }[];
		name: string;
		label: string;
		onValueChange?: (value: any) => void;
	};

	let { value = $bindable(), options, name, label, onValueChange }: Props = $props();

	const triggerContent = $derived(
		options.find((f) => f.value === value)?.label ?? 'Select a fruit'
	);
</script>

<div class="grid w-full gap-1.5">
	<Label for={name}>{label}</Label>
	<Select.Root type="single" {name} bind:value {onValueChange}>
		<Select.Trigger class="w-full">
			{triggerContent}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#each options as option}
					<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
