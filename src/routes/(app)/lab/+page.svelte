<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full content-center gap-4 p-8 *:size-28 *:place-content-center *:text-center">
	<div class="bg-primary">Primary</div>
	<div class="bg-secondary">Secondary</div>
	<div class="bg-error">Error</div>
	<div class="bg-warning">Warning</div>
	<div class="bg-info">Info</div>
	<div class="bg-success">Success</div>
</div>
