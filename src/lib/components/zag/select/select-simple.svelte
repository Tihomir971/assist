<script lang="ts" generics="T extends SelectSimpleItem">
	import * as select from '@zag-js/select';
	import { normalizeProps, portal, useMachine } from '@zag-js/svelte';
	import type { SelectSimpleItem, SelectSimpleProps } from './types';
	import './select.css';
	import PhList from '~icons/ph/list';
	import PhCaretDown from '~icons/ph/caret-down';
	import PhCheck from '~icons/ph/check';
	import PhX from '~icons/ph/x';

	let {
		value = $bindable(),
		label,
		inline,
		items = [],
		...restProps
	}: SelectSimpleProps<T> = $props();

	const id = $props.id();
	const service = useMachine(select.machine, {
		id,
		collection: select.collection({ items }),
		positioning: { sameWidth: true },
		defaultValue: value ? [typeof value === 'number' ? value.toString() : value] : undefined,
		onValueChange(details) {
			value = details.value.length > 0 ? details.value[0] : null;
		}
	});

	const api = $derived(select.connect(service, normalizeProps));
</script>

<div {...api.getRootProps()} class="root-props text-sm">
	{#if label}
		<div class="flex justify-between">
			<label {...api.getLabelProps()}>{label}</label>
			<button {...api.getClearTriggerProps()}><PhX /></button>
		</div>
	{/if}
	<div {...api.getControlProps()} class="control-props">
		<div class="grid size-10 place-content-center">
			<PhList />
		</div>
		<button {...api.getTriggerProps()} class="flex w-full items-center justify-between gap-2">
			<span class={api.valueAsString ? '' : 'text-ink-dim'}>
				{api.valueAsString || 'Select option'}
			</span>
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
		<ul {...api.getContentProps()} class="content-props pl-0">
			{#each items as item}
				<li {...api.getItemProps({ item })} class="flex w-full items-center py-1 pr-2 pl-0">
					<!-- Container that reserves space for the checkmark -->
					<span class="flex w-10 shrink-0 items-center justify-center">
						<!-- w-5 is 1.25rem (20px). shrink-0 prevents it from shrinking. -->
						<span {...api.getItemIndicatorProps({ item })}><PhCheck /></span>
						<!-- Actual checkmark, Zag.js controls its visibility -->
					</span>
					<span {...api.getItemTextProps({ item })} class="flex-grow">{item.label}</span>
					<!-- flex-grow allows label to take remaining space -->
				</li>
			{/each}
		</ul>
	</div>
</div>
