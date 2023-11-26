<script lang="ts">
	import { Avatar } from '$lib/components/avatar';
</script>

<header class="flex items-center justify-between border-b border-surface-3 px-4">
	<div><strong>KALISI</strong> Assistant</div>
	<div>
		<input type="search" placeholder="Search..." class="focus-visible:outline-red-500" />
	</div>
	<div class="flex h-full items-center justify-end space-x-2">
		<Avatar src="" class="h-12"></Avatar>
	</div>
</header>

<style lang="postcss">
	header {
		grid-area: title-bar;
		position: relative;
		max-width: 100%;
		max-height: 100%;
		height: 100%;
		background-color: var(--well-2);
	}
</style>
