import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductInfo } from '$lib/services/scraper';

export const GET: RequestHandler = async ({ params, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		redirect(303, '/auth');
	}
	const m_product_id = Number(params.slug);
	const { name, vendorsProduct } = await ProductInfo.getProductInfo(supabase, m_product_id);

	if (vendorsProduct) {
		let smallestPrice = null;
		for (let index = 0; index < vendorsProduct.length; index++) {
			const vendorPrice = vendorsProduct[index].price ?? 0;
			const vendorPN = vendorsProduct[index].sku ?? undefined;
			const vendorBrand = vendorsProduct[index].brand ?? undefined;
			const vendorBarcode = vendorsProduct[index].barcode.join(',') ?? undefined;
			const vendorPOId = vendorsProduct[index].po_id ?? 0;
			if (vendorPOId !== 0) {
				const { error } = await supabase
					.from('m_product_po')
					.update({
						pricelist: vendorPrice,
						vendorproductno: vendorPN,
						manufacturer: vendorBrand,
						barcode: vendorBarcode
					})
					//.eq('c_bpartner_id', vendorsProduct[index].c_bpartner_id)
					.eq('id', vendorPOId);
				if (error) {
					throw new Error(`Failed to update: ${error.details}`);
				}
				if (!smallestPrice || smallestPrice > vendorPrice) {
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
		return json({ name: name });
	}

	return new Response();
};
