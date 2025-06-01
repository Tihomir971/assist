<script lang="ts">
	import './avatar.css';
	import * as avatar from '@zag-js/avatar';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import type { AvatarProps } from './types';

	let { src, srcSet, name, ...machineProps }: AvatarProps = $props();
	// const [machineProps, localProps] = avatar.splitProps(props);

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((word) => word[0])
			.join('');
	}

	const id = $props.id();
	const service = useMachine(avatar.machine, { id, ...machineProps });
	const api = $derived(avatar.connect(service, normalizeProps));
	const initials = $derived(getInitials(name));
</script>

<div {...api.getRootProps()}>
	<span {...api.getFallbackProps()}>{initials}</span>
	<img alt={initials} {src} {...api.getImageProps()} />
</div>
