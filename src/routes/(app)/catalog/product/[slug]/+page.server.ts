import { error, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNumber, getString } from '$lib/scripts/getForm';

export const load = (async ({ depends, params, locals: { supabase, getSession } }) => {
	depends('catalog:product');
	const session = await getSession();
	if (!session) {
		error(401, { message: 'Unauthorized' });
	}
	const productId = params.slug as unknown as number;
	const getProduct = async (id: number) => {
		const { data } = await supabase.from('m_product').select().eq('id', id).maybeSingle();

		return data;
	};

	const getCategories = async () => {
		const { data } = await supabase
			.from('m_product_category')
			.select('value:id,label:name')
			.order('name');
		/* .returns<AutocompleteOption<string>[]>(); */
		return data;
	};
	//const getImages = async (id: number) => {
	//	const { data: product } = await supabase
	//		.from('m_product')
	//		.select('imageurl')
	//		.eq('id', id)
	//		.single();
	//
	//	// Generate public image URLs from the Supabase bucket
	//	const imageURLs: (string | null)[] = [];
	//	const imageNames = product?.imageurl?.split(';');
	//	if (imageNames) {
	//		for (let i = 0; i < imageNames.length; i++) {
	//			const { data } = await supabase.storage.from('products').getPublicUrl(imageNames[i]);
	//			imageURLs.push(data.publicUrl);
	//		}
	//	}
	//
	//	/* 		if (imageNames) {
	//		imageURLs = await Promise.all(
	//			imageNames.map(async (imageName) => {
	//				const { data } = await supabase.storage.from('products').getPublicUrl(imageName);
	//				if (error) {
	//					console.error('Error getting public URL:', error);
	//					return null;
	//				}
	//				return data.publicUrl;
	//			})
	//		);
	//	} */
	//
	//	return { imageURLs };
	//};
	const getPricelist = async (id: number) => {
		const { data } = await supabase
			.from('m_product_po')
			.select('id,c_bpartner_id,pricelist,vendorproductno,url,updated,c_bpartner(name)')
			.eq('m_product_id', id);
		return data;
	};
	const getBPartners = async () => {
		const { data } = await supabase.from('c_bpartner').select('value:id,label:name').order('name');
		return data;
	};
	return {
		product: await getProduct(productId),
		categories: await getCategories(),
		pricelists: await getPricelist(productId),
		bpartners: await getBPartners()
	};
}) satisfies PageServerLoad;

export const actions = {
	updateProduct: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			error(401, { message: 'Unauthorized' });
		}
		const formData = await request.formData();
		let formValue = formData.get('id');
		if (formValue) {
			const productId = Number(formValue);
			formValue = formData.get('sku');
			const sku = formValue ? formValue.toString() : null;
			formValue = formData.get('name');
			const name = formValue ? formValue.toString() : undefined;
			formValue = formData.get('barcode');
			const barcode = formValue ? formValue.toString() : null;
			formValue = formData.get('c_uom_id');
			const c_uom_id = formValue ? Number(formValue) : undefined;
			formValue = formData.get('brand');
			const brand = formValue ? formValue.toString() : null;
			formValue = formData.get('mpn');
			const mpn = formValue ? formValue.toString() : null;
			formValue = formData.get('m_product_category_id');
			const m_product_category_id = formValue ? Number(formValue) : null;
			formValue = formData.get('condition');
			const condition = formValue ? formValue.toString() : null;
			formValue = formData.get('isselfservice');
			const isselfservice = formValue ? Boolean(formValue) : undefined;
			formValue = formData.get('discontinued');
			const discontinued = formValue ? Boolean(formValue) : undefined;
			formValue = formData.get('isactive');
			const isactive = formValue ? Boolean(formValue) : undefined;
			formValue = formData.get('unitsperpack');
			const unitsperpack = formValue ? Number(formValue) : undefined;

			if (productId) {
				const { error: updateProductError } = await supabase
					.from('m_product')
					.update({
						sku,
						name,
						barcode,
						c_uom_id,
						brand,
						mpn,
						m_product_category_id,
						condition,
						isselfservice,
						discontinued,
						isactive,
						unitsperpack
					})
					.eq('id', productId);
				if (updateProductError) {
					return fail(400, updateProductError);
				}
			}
		}
	},

	addProductPO: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			error(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const c_bpartner_id = getNumber(formData, 'bpartner');
		const m_product_id = getNumber(formData, 'm_product_id');
		const vendorproductno = getString(formData, 'partnerPN');
		const url = getString(formData, 'url');

		if (m_product_id && c_bpartner_id && vendorproductno && url) {
			const { error: addProductPOError } = await supabase
				.from('m_product_po')
				.insert({ m_product_id, c_bpartner_id, vendorproductno, url });
			if (addProductPOError) {
				return fail(400, addProductPOError);
			}
		}
	}
} satisfies Actions;
