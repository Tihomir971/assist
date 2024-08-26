<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	export let value: string;
	export let labelValue: boolean;
	let className = '';
	export { className as class };
</script>

<div class="flex space-x-2">
	{#if labelValue}
		<Badge variant="outline" class="rounded">EOL</Badge>
	{/if}
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<span class={cn('', className)} use:builder.action {...builder}>
				<!-- <span class={cn('cursor-default truncate', className)} use:builder.action {...builder}> -->
				{value}
			</span>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p class="max-w-xs break-words">{value}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</div>
