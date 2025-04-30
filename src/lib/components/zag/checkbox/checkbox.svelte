<script lang="ts">
	import * as checkbox from '@zag-js/checkbox';
	import { normalizeProps, useMachine } from '@zag-js/svelte';

	const id = $props.id();
	const service = useMachine(checkbox.machine, { id });

	const api = $derived(checkbox.connect(service, normalizeProps));
</script>

<fieldset>
	<label {...api.getRootProps()}>
		<div {...api.getControlProps()}></div>
		<span {...api.getLabelProps()}>Input {api.checked ? 'Checked' : 'Unchecked'}</span>
		<input {...api.getHiddenInputProps()} data-testid="hidden-input" />
		<div {...api.getIndicatorProps()}>Indicator</div>
	</label>

	<button type="button" disabled={api.checked} onclick={() => api.setChecked(true)}>Check</button>
	<button type="button" disabled={!api.checked} onclick={() => api.setChecked(false)}
		>Uncheck</button
	>
</fieldset>

<style>
	[data-scope='checkbox'][data-part='control'][data-focus] {
		outline: 2px solid royalblue;
	}

	[data-scope='checkbox'][data-part='root'] {
		display: flex;
		align-items: center;
		position: relative;
		user-select: none;
		width: fit-content;
		margin-bottom: 10px;
		gap: 8px;
	}

	[data-scope='checkbox'][data-part='control'] {
		height: 16px;
		width: 16px;
		background-color: #eee;
		border: solid 2px grey;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	[data-scope='checkbox'][data-part='control'][data-hover] {
		background-color: #ccc;
	}

	[data-scope='checkbox'][data-part='control'][data-state='checked'] {
		background-color: #2196f3;
		border-color: #2196f3;
	}

	[data-scope='checkbox'][data-part='control'][data-state='checked']::after {
		display: block;
	}

	[data-scope='checkbox'][data-part='control']::after {
		content: '';
		display: none;
		position: relative;
		width: 4px;
		height: 9px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
		position: relative;
		top: -1px;
	}

	[data-scope='checkbox'][data-part='control'][data-state='indeterminate'] {
		background-color: white;
		border-color: gray;
	}

	[data-scope='checkbox'][data-part='control'][data-state='indeterminate']::after {
		display: block;
		left: 50%;
		top: 50%;
		width: 13px;
		height: 3px;
		border: none;
		background-color: grey;
		transform: translate(-50%, -50%);
	}
</style>
