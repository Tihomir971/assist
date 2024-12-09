<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';

	export let value: string;
	export let labels: { value: string; variant?: 'outline' | 'default' }[] = [];
</script>

<div class="flex space-x-2">
	{#each labels as label}
		<Badge variant={label.variant ?? 'outline'}>{label.value}</Badge>
	{/each}
	<span>
		{value}
	</span>
</div>
