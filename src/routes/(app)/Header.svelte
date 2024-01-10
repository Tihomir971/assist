<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';
	import { Avatar } from '$lib/components/avatar';
	import type { SubmitFunction } from '@sveltejs/kit';

	const handleLogout: SubmitFunction = () => {
		return async ({ result }) => {
			await invalidate('supabase:auth');
			await applyAction(result);
		};
	};
</script>

<div class="navbar">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">KALISI Assistant</a>
	</div>
	<div class="flex-none gap-2">
		<div class="form-control">
			<input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
		</div>
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="avatar btn btn-circle btn-ghost">
				<div class="w-10 rounded-full">
					<img
						alt="Tailwind CSS Navbar component"
						src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
					/>
				</div>
			</div>
			<ul class="menu dropdown-content menu-sm z-50 mt-3 w-52 rounded-box bg-base-100 p-2 shadow">
				<li>
					<a href="/account" class="justify-between">
						Profile
						<span class="badge">New</span>
					</a>
				</li>
				<li><a href="/">Settings</a></li>
				<li>
					<form action="/auth?/signout" method="post" class="p-0">
						<button type="submit" class="btn-block">Logout</button>
					</form>
				</li>
			</ul>
		</div>
	</div>
</div>
