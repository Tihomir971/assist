<script lang="ts" generics="T extends SelectItem">
	import * as select from '@zag-js/select';
	import { normalizeProps, portal, useMachine } from '@zag-js/svelte';
	import type { SelectItem, SelectProps } from './types';
	import './select.css';
	import PhList from '~icons/ph/list';
	import PhCaretDown from '~icons/ph/caret-down';

	let { value = $bindable(), label, inline, items = [], ...restProps }: SelectProps<T> = $props();

	const id = $props.id();
	const service = useMachine(select.machine, {
		id,
		collection: select.collection({ items }),
		positioning: { sameWidth: true }
	});

	const api = $derived(select.connect(service, normalizeProps));
</script>

<div {...api.getRootProps()} class="root-props">
	{#if label}
		<div class="flex justify-between">
			<label {...api.getLabelProps()}>{label}</label>
			<button {...api.getClearTriggerProps()}>X</button>
		</div>
	{/if}
	<div {...api.getControlProps()} class="control-props">
		<div class="grid size-10 place-content-center">
			<PhList />
		</div>
		<button {...api.getTriggerProps()} class="flex w-full items-center justify-between gap-2">
			<span>{api.valueAsString || 'Select option'}</span>
			<span {...api.getIndicatorProps()} class="grid size-10 place-content-center">
				<PhCaretDown class="${api.open ? '&& rotate-180 transition-transform' : ''}" />
			</span>
		</button>
	</div>

	<select {...api.getHiddenSelectProps()}>
		{#each items as item}
			<option value={item.value}>
				{item.label}
			</option>
		{/each}
	</select>

	<div use:portal {...api.getPositionerProps()}>
		<ul {...api.getContentProps()} class="content-props">
			{#each items as item}
				<li {...api.getItemProps({ item })} class="item-props">
					<span {...api.getItemTextProps({ item })} class="content-center">{item.label}</span>
					<span {...api.getItemIndicatorProps({ item })}>✓</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
