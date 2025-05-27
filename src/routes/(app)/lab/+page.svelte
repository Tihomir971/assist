<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full content-center gap-4 p-8 *:size-28">
	<div class="bg-primary"></div>
	<div class="bg-secondary"></div>
	<div class="bg-warning"></div>
	<div class="bg-error"></div>
	<div class="bg-good"></div>
</div>
