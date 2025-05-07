<script lang="ts">
	import './switch.css';
  
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import * as zagSwitch from '@zag-js/switch';

	const id = $props.id();
	const service = useMachine(zagSwitch.machine, {
		id,
		name: 'switch'
	});
	const api = $derived(zagSwitch.connect(service, normalizeProps));
</script>

<main class="switch">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label {...api.getRootProps()}>
		<input {...api.getHiddenInputProps()} data-testid="hidden-input" />
		<span {...api.getControlProps()}>
			<span {...api.getThumbProps()}></span>
		</span>
		<span {...api.getLabelProps()}>Feature is {api.checked ? 'enabled' : 'disabled'}</span>
	</label>
</main>
