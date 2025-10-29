<script lang="ts">
	import PhArrowSquareOut from '~icons/ph/arrow-square-out';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		value?: any;
		label?: string;
		placeholder?: string | null;
		disabled?: boolean | null;
		readonly?: boolean | null;
		class?: ClassValue | null;
	}
	let {
		value = $bindable(),
		label,
		placeholder = 'Enter url...',
		class: className,
		...restProps
	}: Props = $props();
</script>

<Field.Field class="gap-1.5">
	{#if label}
		<Field.Label for="username">{label}</Field.Label>
	{/if}
	<ButtonGroup.Root class={className}>
		<InputGroup.Root>
			<InputGroup.Input {placeholder} {...restProps} bind:value />
			<InputGroup.Addon align="inline-end">
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<InputGroup.Button
								{...props}
								disabled={!value}
								onclick={() => {
									const url = value.match(/^https?:\/\//) ? value : `https://${value}`;
									window.open(url, '_blank');
								}}
								size="icon-xs"
								class="data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100"
							>
								<PhArrowSquareOut />
							</InputGroup.Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>Open link</Tooltip.Content>
				</Tooltip.Root>
			</InputGroup.Addon>
		</InputGroup.Root>
	</ButtonGroup.Root>
</Field.Field>
