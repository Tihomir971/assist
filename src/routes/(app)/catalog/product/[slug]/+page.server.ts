import { error, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Tables } from '$lib/types/database.types';
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
		//		streamed: {
		//			images: await getImages(productId)
		//		}
	};
}) satisfies PageServerLoad;

export const actions = {
	updateProduct: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			error(401, { message: 'Unauthorized' });
		}
		const product: Partial<Tables<'m_product'>> = {};
		/* let temporary: FormDataEntryValue | null; */
		const formData = await request.formData();

		const productId = Number(formData.get('id'));
		product.sku = formData.get('sku') as string;
		product.name = formData.get('name') as string;
		product.barcode = formData.get('barcode') as string;
		product.c_uom_id = Number(formData.get('c_uom_id'));
		product.brand = formData.get('brand') as string;
		product.mpn = formData.get('mpn') as string;
		product.m_product_category_id = Number(formData.get('m_product_category_id'));
		product.condition = formData.get('condition') as string;
		product.isselfservice = Boolean(formData.get('condition'));
		product.discontinued = Boolean(formData.get('discontinued'));
		product.isactive = Boolean(formData.get('isactive'));
		product.unitsperpack = Number(formData.get('unitsperpack'));
		console.log('product', JSON.stringify(product));

		if (productId) {
			const { error: updateProductError } = await supabase
				.from('m_product')
				.update(product)
				.eq('id', productId);
			if (updateProductError) {
				return fail(400, updateProductError);
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
