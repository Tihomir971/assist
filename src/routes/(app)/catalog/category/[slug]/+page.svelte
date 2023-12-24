<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { Combobox } from '$lib/components/combobox';
	import { DateTimeFormat, numberFormat } from '$lib/scripts/format';

	export let data: PageData;
	$: ({ category, categories } = data);

	let localCopy: any = undefined;
	let modified = false;
	$: if (localCopy && JSON.stringify(category) !== JSON.stringify(localCopy)) {
		modified = true;
	} else {
		modified = false;
	}

	const submit: SubmitFunction = ({}) => {
		return async ({ result }) => {
			if (result.type === 'success') {
				// do something...
				// do something...
				addToast({
					data: {
						title: 'Success',
						description: 'Product updated!',
						color: 'bg-green-500'
					}
				});
				// use the default behavior for this result type
				await applyAction(result);
				history.back();
			}
			//await update({ reset: false, invalidateAll: false });
			//	let timeTaken = Date.now() - start;
			//	console.log('Total time taken : ' + timeTaken + ' ms');
		};
	};
</script>

<div class="grid h-full grid-cols-[1fr_130ch_1fr]">
	<div class="card col-[2] w-full overflow-auto pt-12">
		<hgroup>
			<h3>Edit category</h3>
			<p>Some information about category</p>
		</hgroup>
		<form method="POST" action="?/setCategory" use:enhance={submit}>
			{#if category}
				<div class="grid grid-cols-2 items-start gap-2 p-2">
					<fieldset class="col-span-2">
						<div>
							<label for="name">Name</label>
							<input
								id="name"
								name="name"
								type="text"
								placeholder="Enter email..."
								bind:value={category.name}
								required
							/>
						</div>
					</fieldset>
					<fieldset>
						<legend>Identification</legend>
						<div>
							<label for="id">ID</label>
							<input id="id" name="id" type="text" readonly value={category.id} />
						</div>
					</fieldset>

					<fieldset>
						<legend>Date/Time</legend>
						<div>
							<label for="created">Created</label>
							<input
								id="created"
								name="created"
								type="datetime"
								readonly
								value={DateTimeFormat(category.created)}
							/>
						</div>
						<div>
							<label for="updated">Updated</label>
							<input
								id="updated"
								name="updated"
								type="datetime"
								readonly
								value={DateTimeFormat(category.updated)}
							/>
						</div>
					</fieldset>
					<fieldset>
						<legend>Status</legend>
						<div>
							<label for="isselfservice">Is Self-service?</label>
							<input
								id="isselfservice"
								name="isselfservice"
								type="checkbox"
								checked={category.isselfservice}
							/>
						</div>

						<div>
							<label for="isactive">Is Active?</label><input
								type="checkbox"
								id="isactive"
								name="isactive"
								checked={category.isactive}
							/>
						</div>
					</fieldset>
					<fieldset>
						<!-- name="m_product_category_id"
					labelText="Product category"
					placeholder="Choose category"
					options={categories}
					bind:value={product.m_product_category_id} -->
						{#if categories}
							<Combobox
								labela="Category"
								name="parent_id"
								options={categories}
								bind:value={category.parent_id}
							></Combobox>
						{/if}
					</fieldset>
					<footer class="col-start-2 col-end-3 flex justify-between">
						<menu>
							<button type="button" on:click={() => history.back()}>Back</button>
						</menu>
						<menu>
							<button type="reset">Cancel</button>
							<button type="submit" disabled={!modified}>Save</button>
						</menu>
					</footer>
				</div>
			{/if}
		</form>
	</div>
</div>
