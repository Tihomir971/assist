<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let email: string;
	let password: string;

	let loading: true;
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content max-w-[800px] flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Login now!</h1>
			<p class="py-6">
				Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
				quasi. In deleniti eaque aut repudiandae et a id nisi.
			</p>
		</div>
		<div class="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
			<form class="card-body" action="?/signin" method="post" use:enhance>
				<div class="form-control">
					<label class="label">
						<span class="label-text">Email</span>
						<input
							type="email"
							name="email"
							placeholder="email"
							class="input input-bordered"
							required
							autocomplete="email"
							value={form?.values?.email ?? ''}
						/>
					</label>
				</div>
				<div class="form-control">
					<label class="label">
						<span class="label-text">Password</span>
						<input
							type="password"
							name="password"
							placeholder="password"
							class="input input-bordered"
							required
							autocomplete="off"
						/>
					</label>
				</div>
				<div class="form-control">
					<div class="label">
						<a href="/" class="link-hover link label-text-alt">Forgot password?</a>
					</div>
				</div>
				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary">Login</button>
				</div>
			</form>
		</div>
	</div>
</div>
