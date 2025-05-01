<script lang="ts" module>
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		type FormFieldProxy
	} from 'sveltekit-superforms';
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps } from '@zag-js/svelte';
	import { matchSorter } from 'match-sorter';

	import PhX from '~icons/ph/x';
	import PhListPlus from '~icons/ph/list-plus';
	import PhPencilSimpleSlash from '~icons/ph/pencil-simple-slash';
	import PhCaretDown from '~icons/ph/caret-down';
	import { cn } from '$lib/utils';

	type Item = { value: number; label: string };
	type Props = {
		superform: SuperForm<T>;
		field: FormPathLeaves<T, number | null>;
		items: Item[];
		readonly?: boolean;
		placeholder?: string;
		labelText?: string;
	};

	let {
		superform,
		field,
		items,
		readonly,
		placeholder = 'Select an item',
		labelText
	}: Props = $props();

	//const formProxy = $derived.by(() => {
	//	if (superform && field) {
	//		return formFieldProxy(superform, field) satisfies FormFieldProxy<number | null>;
	//	}
	//	return undefined;
	//});
	const { value, errors, constraints } = formFieldProxy(superform, field) satisfies FormFieldProxy<
		number | null
	>;

	let options = $state.raw(items);
	const collection = $derived(
		combobox.collection({
			items: options,
			itemToValue: (item) => item.value.toString(),
			itemToString: (item) => item.label
		})
	);
	const id = $props.id();
	const service = useMachine(combobox.machine, {
		id,
		get collection() {
			return collection;
		},
		get defaultValue() {
			return $value ? [$value.toString()] : undefined;
		},
		// required: true,
		required: $constraints?.required,
		disabled: false,
		readOnly: readonly,
		placeholder: placeholder,
		invalid: $errors ? true : false,
		onInputValueChange({ inputValue }) {
			const filtered = matchSorter(items, inputValue, {
				keys: ['label']
			});
			const newOptions = filtered.length > 0 ? filtered : items;
			collection.setItems(newOptions);
			options = newOptions;
		},
		onValueChange({ value: selectedValue }) {
			$value = selectedValue.length > 0 ? parseInt(selectedValue[0]) : null;
		}
	});

	const api = $derived(combobox.connect(service, normalizeProps));
</script>

<input type="hidden" name={field} value={$value} />

<div {...api.getRootProps()} class="input-root">
	<div class="flex h-6 items-center justify-between">
		<div>
			<label {...api.getLabelProps()} class="input-label">{labelText}</label>
			{#if $constraints?.required}
				<span class="text-warning">*</span>
			{/if}
		</div>
		{#if !$constraints?.required}
			<button
				{...api.getClearTriggerProps()}
				class="flex aspect-square h-full items-center justify-center text-xs hover:text-base"
			>
				<PhX />
			</button>
		{/if}
	</div>
	<div {...api.getControlProps()} class="input-control data-disabled:opacity-50">
		{#if $errors}
			<span class="text-red-500">{errors}</span>
		{/if}

		<div class="input-icon">
			<PhListPlus />
		</div>
		<div class="input-input">
			<input {...api.getInputProps()} class="w-full focus:outline-none" />
		</div>
		<button {...api.getTriggerProps()} class="input-trigger">
			{#if readonly}
				<PhPencilSimpleSlash />
			{:else}
				<PhCaretDown class={cn('transition-transform', api.open && 'rotate-180')} />
			{/if}
		</button>
	</div>
</div>

<div {...api.getPositionerProps()}>
	{#if options.length > 0}
		<ul
			{...api.getContentProps()}
			class={cn(
				'isolate z-50 m-0 max-h-56 list-none overflow-auto overscroll-contain border border-border p-1',
				'rounded-sm border border-muted bg-popover shadow-popover outline-hidden select-none'
			)}
		>
			{#each options as item (item.value)}
				{@const state = api.getItemState({ item })}
				<li
					{...api.getItemProps({ item })}
					class="flex cursor-pointer items-center px-2 py-1 data-highlighted:rounded-sm data-highlighted:bg-accent"
				>
					<span>{item.label}</span>
					{#if state.selected}
						<span class="ml-auto pl-2">✓</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
