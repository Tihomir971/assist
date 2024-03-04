<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	let activePath: string | undefined = undefined;
	$: if (browser) activePath = $page.url.pathname;
</script>

<aside class="grid grid-rows-[auto_1fr_auto]">
	<!-- <AppRail width=""> -->
	<div class="join join-vertical">
		<div class="tooltip tooltip-right" data-tip="Dashboard">
			<a
				href="/dashboard"
				class="btn btn-square btn-ghost join-item"
				data-tip="Dashboard"
				class:btn-active={activePath === '/dashboard'}
			>
				<iconify-icon icon="ph:layout" width="24" height="24"></iconify-icon>
			</a>
		</div>
		<div class="tooltip tooltip-right" data-tip="Catalog">
			<a
				href="/catalog"
				data-tip="Catalog"
				class="btn btn-square btn-ghost join-item"
				class:btn-active={activePath === '/catalog'}
			>
				<iconify-icon icon="ph:tag" width="24" height="24"></iconify-icon>
			</a>
		</div>

		<div class="dropdown dropdown-right dropdown-hover">
			<div
				tabindex="0"
				role="button"
				class="btn btn-square btn-ghost join-item"
				class:btn-active={activePath?.startsWith('/catalog/')}
			>
				<iconify-icon icon="ph:test-tube" width="24" height="24"></iconify-icon>
			</div>
			<ul class="menu dropdown-content z-[1] w-52 rounded-box bg-base-300 p-2 shadow">
				<li class="menu-title">Catalog</li>
				<li><a href="/test" class:active={activePath === '/test'}>Test</a></li>
				<li>
					<a href="/catalog/attribute" class:active={activePath === '/catalog/attribute'}
						>Attribute</a
					>
				</li>
			</ul>
		</div>

		<!-- </AppRail> -->
	</div>
</aside>
