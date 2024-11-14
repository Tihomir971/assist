import { invalidate } from '$app/navigation';
import { browser } from '$app/environment';
import { toast } from 'svelte-sonner';
import { superForm } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';
import { crudmProductPoSchema } from '$lib/types/supabase/mProductPo.validator';
import { crudMProductSchema } from '$lib/types/supabase/product.validator';
import { schemaProductGtinID, replenishSchema } from '../zod.validator.js';

export function setupProductForms(data: any) {
	async function deleteProductPORow(rowToBeDeleted: number) {
		const { error } = await data.supabase.from('m_product_po').delete().eq('id', rowToBeDeleted);
		if (error) throw error;
		return;
	}

	const productForm = superForm(data.formProduct, {
		validators: zodClient(crudMProductSchema),
		onUpdated(event) {
			const { form } = event;
			if (form.valid) {
				toast.success('Product updated successfully', {
					description: form.message || 'Your changes have been saved.'
				});
				invalidate('catalog:product');
			} else {
				toast.error('Failed to update product', {
					description: form.message || 'Please check the form for errors'
				});
			}
		},
		dataType: 'json'
	});

	const formPPO = superForm(data.formProductPO, {
		validators: zodClient(crudmProductPoSchema),
		onUpdated({ form }) {
			console.log('Form updated', form);
			if (form.valid) {
				toast.success('Product added successfully', {
					description: form.message
				});
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error('Failed to add product', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});

	const formGtin = superForm(data.formProductGtin, {
		validators: zodClient(schemaProductGtinID),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success(form.message || 'Barcode operation successful');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error(form.message || 'Barcode operation failed');
			}
		}
	});

	const formReplenish = superForm(data.formReplenish, {
		dataType: 'json',
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Replenish data updated successfully', {
					description: form.message
				});
				invalidate('catalog:product');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error('Failed to update replenish data', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});

	return {
		productForm,
		formPPO,
		formGtin,
		formReplenish,
		deleteProductPORow
	};
}

export function setupDerivedValues(data: any, formProduct: any, formProductPO: any) {
	let selectedVendor = $derived(
		formProductPO.c_bpartner_id
			? data.c_bpartner?.find((v: any) => v.value === formProductPO.c_bpartner_id)
			: undefined
	);

	let selectedUomLabel = $derived(
		data.uom.find((v: any) => v.value === formProduct.c_uom_id?.toString())?.label
	);

	let selectedTaxLabel = $derived(
		data.tax?.find((v: any) => v.value === formProduct.c_taxcategory_id?.toString())?.label
	);

	let selectedCategoryLabel = $derived(
		data.categories?.find((v: any) => v.value === formProduct.m_product_category_id?.toString())
			?.label
	);

	const warehousesWithStringValues = data.warehouses.map((warehouse: any) => ({
		value: warehouse.value.toString(),
		label: warehouse.label
	}));

	return {
		selectedVendor,
		selectedUomLabel,
		selectedTaxLabel,
		selectedCategoryLabel,
		warehousesWithStringValues
	};
}
