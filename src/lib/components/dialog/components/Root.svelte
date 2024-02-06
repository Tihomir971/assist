<script lang="ts">
	import { setCtx } from '../ctx';

	/* 	const {
		elements: { trigger, overlay, content, title, description, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
	}); */
	const {} = setCtx({ forceVisible: true });
</script>

<slot />
