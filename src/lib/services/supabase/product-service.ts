import type { Database, Tables } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
type Product = Partial<Tables<'m_product'>>;

// Get product details
export const getProduct = async (supabase: SupabaseClient<Database>, id: number) => {
	const { data: product } = await supabase.from('m_product').select().eq('id', id).maybeSingle();

	return product;
};

// Update product
export const updProduct = async (
	supabase: SupabaseClient<Database>,
	productId: number,
	product: Product
) => {
	const { error } = await supabase.from('m_product').update(product).eq('id', productId);

	return { error };
};

// Delete product
export const delProduct = async (supabase: SupabaseClient<Database>, productId: number) => {
	const { error } = await supabase.from('m_product').delete().eq('id', productId);

	return { error };
};

// Add Replanish for product
export const addReplenishes = async (
	supabase: SupabaseClient<Database>,
	data: { m_product_id: number; m_warehouse_id: number } & Partial<Tables<'m_replenish'>>
) => {
	const { error: addReplenishesError } = await supabase.from('m_replenish').insert(data);
	return { error: addReplenishesError };
};

// Get replanishes for product
export const getReplenishes = async (supabase: SupabaseClient<Database>, id: number) => {
	const { data: replenishes } = await supabase
		.from('m_replenish')
		.select()
		.order('m_warehouse_id')
		.eq('m_product_id', id);
	return replenishes;
};

export const getProductPurchasing = async (
	supabase: SupabaseClient<Database>,
	productId: number
) => {
	const { data: productPurchasing } = await supabase
		.from('m_product_po')
		.select(
			'id,isactive,barcode,c_bpartner_id,pricelist,vendorproductno,url,updated,c_bpartner(name)'
		)
		.eq('m_product_id', productId);
	return productPurchasing;
};

export const addProductPurchasing = async (
	supabase: SupabaseClient<Database>,
	data: { c_bpartner_id: number; m_product_id: number; vendorproductno: string } & Partial<
		Tables<'m_product_po'>
	>
) => {
	const { error: productPurchasingError } = await supabase.from('m_product_po').insert(data);
	return { error: productPurchasingError };
};
