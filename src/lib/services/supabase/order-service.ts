import type { Database, Tables } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const addProductPurchasing = async (
	supabase: SupabaseClient<Database>,
	data: { c_bpartner_id: number; m_product_id: number; vendorproductno: string } & Partial<
		Tables<'m_product_po'>
	>
) => {
	const { error: productPurchasingError } = await supabase.from('m_product_po').insert(data);
	return { error: productPurchasingError };
};

export const getProductPurchasing = async (
	supabase: SupabaseClient<Database>,
	productId: number
) => {
	const { data: productPurchasing } = await supabase
		.from('m_product_po')
		.select('id,c_bpartner_id,pricelist,vendorproductno,url,updated,c_bpartner(name)')
		.eq('m_product_id', productId);
	return productPurchasing;
};
