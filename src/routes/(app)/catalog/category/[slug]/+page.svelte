<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { Combobox } from '$lib/components/combobox';
	import { DateTimeFormat, numberFormat } from '$lib/scripts/format';
	import { afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';

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
				addToast({
					data: {
						title: 'Category update',
						description: `Category: "${category?.name}" successfully updated!`,
						color: 'alert-success'
					}
				});
				// use the default behavior for this result type
				await applyAction(result);
				history.back();
			}
		};
	};
	let previousPage: string = base;
	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
		previousPage = previousPage + '?' + from?.url.searchParams.toString() || previousPage;
		localCopy = Object.assign({}, category);
	});
</script>

<div class="mx-auto max-w-2xl">
	<div class="card">
		<hgroup class="prose">
			<h2>Edit category</h2>
			<p>Some information about category</p>
		</hgroup>
		<form method="POST" action="?/setCategory" use:enhance={submit}>
			{#if category}
				<div class="space-y-12">
					<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
						<label class="form-control">
							<div class="label">
								<span class="label-text">ID</span>
							</div>
							<input
								name="id"
								type="text"
								readonly
								value={category.id}
								class="input input-bordered"
							/>
						</label>
						{#if categories}
							<Combobox
								labela="Parent Category"
								name="parent_id"
								options={categories}
								bind:value={category.parent_id}
							></Combobox>
						{/if}
						<div class="col-span-3 col-start-1 flex flex-col">
							<div class="form-control w-52">
								<label class="label cursor-pointer">
									<span class="label-text">Is Active?</span>
									<input
										type="checkbox"
										name="isactive"
										checked={category.isactive}
										class="toggle toggle-primary"
									/>
								</label>
							</div>
							<div class="form-control w-52">
								<label class="label cursor-pointer">
									<span class="label-text">Is Self-service?</span>
									<input
										type="checkbox"
										name="isselfservice"
										checked={category.isselfservice}
										class="toggle toggle-secondary"
									/>
								</label>
							</div>
						</div>

						<label class="form-control col-span-full">
							<div class="label">
								<span class="label-text">Name</span>
							</div>
							<input
								name="name"
								type="text"
								placeholder="Enter email..."
								bind:value={category.name}
								required
								class="input input-bordered"
							/>
						</label>

						<label class="form-control col-span-3 col-start-1">
							<div class="label">
								<span class="label-text">Created</span>
							</div>
							<input
								name="created"
								type="datetime"
								readonly
								value={DateTimeFormat(category.created)}
								class="input input-bordered"
							/>
						</label>
						<label class="form-control col-span-3">
							<div class="label">
								<span class="label-text">Updated</span>
							</div>
							<input
								id="updated"
								name="updated"
								type="datetime"
								readonly
								value={DateTimeFormat(category.updated)}
								class="input input-bordered"
							/>
						</label>

						<!-- name="m_product_category_id"
					labelText="Product category"
					placeholder="Choose category"
					options={categories}
					bind:value={product.m_product_category_id} -->

						<footer class="col-span-full flex items-center justify-end gap-x-6">
							<button type="button" on:click={() => history.back()} class="btn btn-outline"
								>Back</button
							>
							<button
								type="reset"
								disabled={!modified}
								on:click={() => (category = localCopy)}
								class="btn btn-outline btn-secondary">Reset</button
							>
							<button type="submit" disabled={!modified} class="btn btn-primary">Save</button>
						</footer>
					</div>
				</div>
			{/if}
		</form>
	</div>
</div>
