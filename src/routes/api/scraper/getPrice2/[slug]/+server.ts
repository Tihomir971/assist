import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductInfo } from '$lib/services/scraper';

export const GET: RequestHandler = async ({ params, locals: { supabase } }) => {
	//	const userFetch = await supabase.auth.getUser();
	//	if (userFetch.error) {
	//		console.error(userFetch.error);
	//		redirect(303, '/auth');
	//	}
	const m_product_id = Number(params.slug);

	const { name, vendorsProduct } = await ProductInfo.getProductInfo(supabase, m_product_id);
	if (vendorsProduct.length === 0) {
		return json({ code: 'warning', message: 'Define vendor sources first' });
	}

	if (vendorsProduct) {
		let smallestPrice = 0;
		for (let index = 0; index < vendorsProduct.length; index++) {
			const tempPrice = vendorsProduct[index].price ?? 0;
			const vendorPrice = tempPrice !== Infinity ? tempPrice : 0;
			const vendorPN = vendorsProduct[index].sku ?? undefined;
			const vendorBrand = vendorsProduct[index].brand ?? undefined;
			const vendorBarcode = vendorsProduct[index].barcode.join(',') ?? undefined;
			const vendorPOId = vendorsProduct[index].po_id ?? 0;
			const vendorOnStock = vendorsProduct[index].onStock;

			if (vendorPOId !== 0) {
				const { error } = await supabase
					.from('m_product_po')
					.update({
						pricelist: vendorOnStock ? vendorPrice : 0,
						vendorproductno: vendorPN,
						manufacturer: vendorBrand,
						barcode: vendorBarcode
					})
					.eq('id', vendorPOId);
				if (error) {
					throw new Error(`Failed to update: ${error.details}`);
				}
				if (
					(smallestPrice > vendorPrice || smallestPrice === 0) &&
					vendorOnStock &&
					vendorPrice > 0
				) {
					smallestPrice = vendorPrice;
				}
			}
		}

		const { count, error: errorUpdate } = await supabase
			.from('m_productprice')
			.update({ pricelist: smallestPrice }, { count: 'estimated' })
			.eq('m_product_id', m_product_id)
			.eq('m_pricelist_version_id', 15);

		if (count === 0) {
			const result = await supabase.from('m_productprice').insert({
				m_product_id: m_product_id,
				m_pricelist_version_id: 15,
				pricelist: smallestPrice
			});
			if (result.error) {
				error(400, `Failed to insert: ${result.error.details}`);
			}
		}
		if (errorUpdate) {
			error(400, `Failed to update: ${errorUpdate.details}`);
		}
		return json({ code: 'success', message: `${name} for ${vendorsProduct.length} vendors` });
	}

	return new Response();
};
