<script lang="ts">
	import { Avatar } from '$lib/components/avatar';
</script>

<header class="navbar bg-base-300">
	<div class="flex-1">
		<div class="text-xl"><strong>KALISI</strong> Assistant</div>
	</div>
	<div class="flex-none gap-2">
		<label class="form-control">
			<input type="search" placeholder="Search..." class="input input-bordered w-24 md:w-auto" />
		</label>
		<div class="dropdown dropdown-bottom">
			<div tabindex="0" role="button" class="avatar btn btn-circle btn-ghost">
				<div class="w-10 rounded-full">
					<img
						alt="Tailwind CSS Navbar component"
						src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
					/>
				</div>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-btn bg-base-100 p-2 shadow"
				>
					<li>
						<button class="justify-between">
							Profile
							<span class="badge">New</span>
						</button>
					</li>
					<li><button>Settings</button></li>
					<li><button>Logout</button></li>
				</ul>
			</div>
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
