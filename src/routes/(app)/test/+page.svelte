<script lang="ts">
	import { enhance } from '$app/forms';
	import { Combobox } from '$lib/components/combobox';
	import { addToast } from '$lib/components/toaster/components/Toaster.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ categories } = data);

	const product = {
		id: 3259,
		sku: '3374',
		barcode: '8006540476574',
		name: 'Pantene Repair & Protect: 350ml Šampon za kosu',
		c_uom_id: 2,
		m_product_category_id: 800
	};
</script>

<div class="mx-auto my-4 h-full max-w-5xl">
	<form
		method="post"
		action="?/updateProduct"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') {
					addToast({
						data: {
							title: 'Product update',
							description: `Product:  successfully updated!`,
							color: 'alert-success'
						}
					});
				} else {
					addToast({
						data: {
							title: 'Product update',
							description: `Product:  successfully updated!`,
							color: 'alert-success'
						}
					});
				}
			};
		}}
	>
		<label class="form-control col-span-2 col-start-1">
			<div class="label">
				<span class="label-text">ID</span>
			</div>
			<input
				name="id"
				type="number"
				readonly
				value={product.id}
				class="input input-bordered w-full"
			/>
		</label>

		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">SKU</span>
			</div>
			<input
				name="sku"
				type="text"
				readonly
				value={product.sku}
				class="input input-bordered w-full"
			/>
		</label>
		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Barcode</span>
			</div>
			<input
				id="barcode"
				name="barcode"
				type="text"
				value={product.barcode}
				class="input input-bordered w-full"
			/>
		</label>
		<label class="form-control col-span-full">
			<div class="label">
				<span class="label-text">Name</span>
			</div>
			<input
				name="name"
				type="text"
				placeholder="Enter name..."
				value={product.name}
				required
				class="input input-bordered w-full"
				autocomplete="off"
			/>
		</label>
		<label class="form-control col-span-3">
			<div class="label">
				<span class="label-text">UoM</span>
			</div>
			<input
				name="c_uom_id"
				type="number"
				value={product.c_uom_id}
				class="input input-bordered w-full"
			/>
		</label>
		<label class="form-control col-span-3">
			<div class="label">
				<span class="label-text">Units per Pack</span>
			</div>
			<input name="unitsperpack" type="number" value="1" class="input input-bordered w-full" />
		</label>
		<label class="form-control col-span-3">
			<div class="label">
				<span class="label-text">Brand</span>
			</div>
			<input name="brand" type="text" class="input input-bordered w-full" />
		</label>
		<label class="form-control col-span-3">
			<div class="label">
				<span class="label-text">MPN</span>
			</div>
			<input name="mpn" type="text" autocomplete="off" class="input input-bordered w-full" />
		</label>

		<label class="col-span-2 flex cursor-pointer items-center gap-x-3">
			<input name="isselfservice" type="checkbox" checked={false} class="toggle toggle-primary" />
			<span class="label-text">Is Self-service?</span>
		</label>
		<label class="col-span-2 flex cursor-pointer items-center gap-x-3">
			<input type="checkbox" name="discontinued" checked={false} class="toggle toggle-primary" />
			<span class="label-text">Discontinued?</span>
		</label>
		<label class="col-span-2 flex cursor-pointer items-center gap-x-3">
			<input type="checkbox" name="isactive" checked={true} class="toggle toggle-primary" />
			<span class="label-text">Is Active?</span>
		</label>
		<label class="form-control col-span-3">
			<div class="label">
				<span class="label-text">Condition</span>
			</div>
			<input
				id="condition"
				name="condition"
				type="text"
				value="New"
				autocomplete="off"
				class="input input-bordered w-full"
			/>
		</label>
		{#if categories}
			<Combobox
				labela="Category"
				name="m_product_category_id"
				options={categories}
				bind:value={product.m_product_category_id}
			></Combobox>
		{/if}

		<button type="submit" class="btn btn-primary">Start</button>
	</form>
</div>
