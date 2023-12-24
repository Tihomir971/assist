<script lang="ts">
	import { Avatar } from '$lib/components/avatar';
</script>

<header class="flex items-center justify-between border-b border-neutral-300 px-4">
	<div><strong>KALISI</strong> Assistant</div>
	<label class="form-control w-full max-w-xs">
		<input type="search" placeholder="Search..." class="input input-bordered w-full max-w-xs" />
	</label>
	<div class="avatar">
		<div class="w-8 rounded">
			<img
				alt="Avatar"
				src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
			/>
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
	}
</style>
