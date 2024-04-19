import { BIZNISOFT_API, BIZNISOFT_BEARER_TOKEN } from '$env/static/private';
import type { ArticlesOnStock } from '$lib/types/biznisoft';
//import type { Tables } from '$lib/types/database.types';
//import { getItem } from '$lib/server/erp/article';
import { json, redirect, type RequestHandler } from '@sveltejs/kit';

const myHeaders = new Headers({ Authorization: 'Bearer ' + BIZNISOFT_BEARER_TOKEN });

export const GET: RequestHandler = async ({ url, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) {
		redirect(303, '/auth');
	}

	const m_product_id = url.searchParams.get('ID');
	if (!m_product_id) {
		return json({ code: 'warning', message: 'Product not found' });
	}

	const { data: product } = await supabase
		.from('m_product')
		.select('sku')
		.eq('id', Number(m_product_id))
		.maybeSingle();
	if (!product?.sku) {
		return json({ code: 'warning', message: 'Product not found' });
	}

	const articleUrl = BIZNISOFT_API + `/api/Article/GetItem?ID=${product.sku}`;
	const response = await fetch(articleUrl, {
		method: 'GET',
		headers: myHeaders
	});
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	const [erpArticle] = await response.json();
	console.log('erpArticle', erpArticle);

	const { data: categoryID } = await supabase
		.from('c_channel_map')
		.select('internal_code')
		.eq('channel_code', erpArticle.GroupID)
		.maybeSingle();

	//const converted: any.name = productErp.Name;
	const { error: errorProduct } = await supabase
		.from('m_product')
		.update({
			name: erpArticle.Name,
			mpn: erpArticle.CatalogNumber,
			barcode: erpArticle.Barcode,
			unitsperpack: erpArticle.TPAmount,
			m_product_category_id: categoryID?.internal_code
				? Number(categoryID.internal_code)
				: undefined,
			c_taxcategory_id: erpArticle.VatID === 'S1' ? 1 : 2
		})
		.eq('id', m_product_id)
		.maybeSingle();
	if (errorProduct) {
		return json({ code: 'error', message: ` for vendors`, erpArticle });
	}

	const onStockUrl = BIZNISOFT_API + `/api/ArticlesOnStock/GetItem?ID=${product.sku}`;
	const respOnStock = await fetch(onStockUrl, {
		method: 'GET',
		headers: myHeaders
	});
	if (!respOnStock.ok) {
		throw new Error('Network response was not ok');
	}
	const erpOnStock: ArticlesOnStock[] = await respOnStock.json();
	//const erpOnStock: Promise<{ [key: string]: any }> = await respOnStock.json();
	//	console.log('erpOnStock', erpOnStock);
	for (let index = 0; index < erpOnStock.length; index++) {
		const element = erpOnStock[index];
		console.log('element', element);

		const { data: warehouseID } = await supabase
			.from('c_channel_map')
			.select('internal_code')
			.eq('entity_type', 'Source')
			.eq('channel_code', element.StorageID.toString())
			.maybeSingle();

		console.log('m_product_id', Number(m_product_id));
		console.log('warehouse_id', Number(warehouseID?.internal_code));
		console.log('qtyonhand', element.Amount);
		const {
			data: stockUpdateData,
			error: stockUpdateError,
			count: stockUpdateCount
		} = await supabase
			.from('m_storageonhand')
			.update({ qtyonhand: element.Amount }, { count: 'estimated' })
			.eq('m_product_id', Number(m_product_id))
			.eq('warehouse_id', Number(warehouseID?.internal_code));
		if (stockUpdateCount === 0) {
			const {
				data: stockInsertData,
				error: stockInsertError,
				count: stockInsertCount
			} = await supabase.from('m_storageonhand').insert(
				{
					qtyonhand: element.Amount,
					m_product_id: Number(m_product_id),
					warehouse_id: Number(warehouseID?.internal_code)
				},
				{ count: 'estimated' }
			);
			console.log('stockInsertData', stockInsertData);
			console.log('stockInsertError', stockInsertError);
			console.log('stockInsertCount', stockInsertCount);
		}
		console.log('stockUpdateError', stockUpdateError);
		console.log('stockUpdateData', stockUpdateData);
		console.log('stockUpdateCount', stockUpdateCount);
		console.log('---------------------------------');

		/* 	const stock_update: Tables<m_storageonhand> = {
			m_product_id: Number(m_product_id)
		}; */
		/* console.log('stock_update', stock_update); */
	}

	return json({ code: 'success', message: ` for vendors` });
};
