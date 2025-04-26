<script lang="ts">
	import * as select from '@zag-js/select';
	import { normalizeProps, portal, useMachine } from '@zag-js/svelte';

	const selectData = [
		{ label: 'Nigeria', value: 'NG' },
		{ label: 'Japan', value: 'JP' },
		{ label: 'Korea', value: 'KO' },
		{ label: 'Kenya', value: 'KE' },
		{ label: 'United Kingdom', value: 'UK' },
		{ label: 'Ghana', value: 'GH' },
		{ label: 'Uganda', value: 'UG' }
	];

	const id = $props.id();
	const service = useMachine(select.machine, {
		id,
		name: 'select',
		collection: select.collection({ items: selectData })
	});

	const api = $derived(select.connect(service, normalizeProps));
</script>

<div {...api.getRootProps()}>
	<div class="flex justify-between">
		<label {...api.getLabelProps()}>Label</label>
		<button {...api.getClearTriggerProps()}>X</button>
	</div>

	<div {...api.getControlProps()}>
		<button {...api.getTriggerProps()}>
			<span>{api.valueAsString || 'Select option'}</span>
			<span {...api.getIndicatorProps()}>▼</span>
		</button>
	</div>

	<select {...api.getHiddenSelectProps()}>
		{#each selectData as option}
			<option value={option.value}>
				{option.label}
			</option>
		{/each}
	</select>

	<div use:portal {...api.getPositionerProps()}>
		<ul {...api.getContentProps()}>
			{#each selectData as item}
				<li {...api.getItemProps({ item })}>
					<span {...api.getItemTextProps({ item })}>{item.label}</span>
					<span {...api.getItemIndicatorProps({ item })}>✓</span>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	[data-scope='select'][data-part='root'] {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	[data-scope='select'][data-part='label'] {
		font-size: 1.125rem;
	}

	[data-scope='select'][data-part='label'][data-disabled] {
		opacity: 0.6;
	}

	[data-scope='select'][data-part='trigger'] {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-align: start;
		cursor: pointer;
		font-weight: 500;
		padding-inline: 1rem;
		padding-block: 0.25rem;
		border-width: 1px;
		min-width: 200px;
		background: var(--colors-bg-subtle);
	}

	[data-scope='select'][data-part='trigger']:hover {
		background: var(--colors-bg-bold);
	}

	[data-scope='select'][data-part='trigger']:is(:focus, [data-focus]) {
		outline: 2px solid hsl(204, 100%, 40%);
	}

	[data-scope='select'][data-part='trigger'][data-disabled] {
		opacity: 0.6;
	}

	[data-scope='select'][data-part='trigger'] > span {
		padding: 0.25rem;
		flex: 1;
	}

	[data-scope='select'][data-part='content'] {
		background: var(--color-popover);
		width: 240px;
		padding: 0.5rem;
		isolation: isolate;
		list-style-type: none;
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.1),
			0 1px 2px 0 rgba(0, 0, 0, 0.06);
	}

	[data-scope='select'][data-part='content']:is(:focus, [data-focus]) {
		outline: 2px solid hsl(204, 100%, 40%);
	}

	[data-scope='select'][data-part='item'] {
		padding-inline: 0.5rem;
		padding-block: 0.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	[data-scope='select'][data-part='item-text'] {
		flex: 1;
	}

	[data-scope='select'][data-part='item'][data-highlighted] {
		background: var(--color-accent);
		color: var(--color-accent-foreground);
	}
</style>
