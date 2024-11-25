<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { enhance } from '$app/forms';
</script>

<div class="mx-auto grid h-full place-items-center p-2">
	<div class="card flex space-x-2">
		<form method="post" use:enhance action="?/importPartners">
			<Form.Button>Import Partners</Form.Button>
		</form>
		<form method="post" use:enhance action="?/importCategories">
			<Form.Button>Import Categories</Form.Button>
		</form>
	</div>
</div>
