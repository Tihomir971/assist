import { error, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Tables } from '$lib/types/database.types';
import { getBoolean, getNumber, getString } from '$lib/scripts/getForm';

export const load = (async ({ depends, params, locals: { supabase, getSession } }) => {
	depends('catalog:product');
	const session = await getSession();
	if (!session) {
		throw error(401, { message: 'Unauthorized' });
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
		//		streamed: {
		//			images: await getImages(productId)
		//		}
	};
}) satisfies PageServerLoad;

export const actions = {
	updateProduct: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			throw error(401, { message: 'Unauthorized' });
		}
		const product: Partial<Tables<'m_product'>> = {};
		/* let temporary: FormDataEntryValue | null; */
		const formData = await request.formData();

		const productId = getNumber(formData, 'id');
		product.sku = getString(formData, 'sku');
		product.name = getString(formData, 'name') ?? undefined;
		product.barcode = getString(formData, 'barcode');
		product.c_uom_id = getNumber(formData, 'c_uom_id') ?? undefined;
		product.brand = getString(formData, 'brand');
		product.mpn = getString(formData, 'mpn') ?? undefined;
		product.m_product_category_id = getNumber(formData, 'm_product_category_id');
		product.condition = getString(formData, 'condition');
		product.isselfservice = getBoolean(formData, 'isselfservice');
		product.discontinued = getBoolean(formData, 'discontinued');
		product.isactive = getBoolean(formData, 'isactive');

		if (productId) {
			const { error: createPostError } = await supabase
				.from('m_product')
				.update(product)
				.eq('id', productId);
			if (createPostError) {
				return fail(500, { supabaseErrorMessage: createPostError.message });
			}
		}
		//		invalidate('catalog:product');
		return { success: true };
	},
	addProductPO: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			throw error(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const c_bpartner_id = getNumber(formData, 'bpartner');
		const m_product_id = getNumber(formData, 'm_product_id');
		const vendorproductno = getString(formData, 'partnerPN');
		const url = getString(formData, 'url');

		if (m_product_id && c_bpartner_id && vendorproductno && url) {
			const { error: createPostError } = await supabase
				.from('m_product_po')
				.insert({ m_product_id, c_bpartner_id, vendorproductno, url });
			if (createPostError) {
				return fail(500, { supabaseErrorMessage: createPostError.message });
			}
		}
	}
} satisfies Actions;
