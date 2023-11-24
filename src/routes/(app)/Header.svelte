<script lang="ts">
	import { Avatar } from '$lib/components/avatar';
</script>

<header class="flex items-center justify-between border-b border-surface-1 px-4">
	<div><strong>KALSISI</strong> Assistant</div>
	<div>
		<input type="search" placeholder="Search..." class="focus-visible:outline-red-500" />
	</div>
	<div>
		<div class="flex justify-end space-x-2">
			<Avatar src=""></Avatar>
		</div>
	</div>
</header>

<style lang="postcss">
	header {
		grid-area: title-bar;
		position: relative;
		max-width: 100%;
		max-height: 100%;
		height: 100%;
		background-color: hsl(var(--gray-11-hsl));
	}
</style>
