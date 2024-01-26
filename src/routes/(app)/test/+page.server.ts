import { fail, type Actions } from '@sveltejs/kit';

export const load = async ({ locals: { supabase } }) => {
	const getCategories = async () => {
		const { data } = await supabase
			.from('m_product_category')
			.select('value:id,label:name')
			.order('name');
		/* .returns<AutocompleteOption<string>[]>(); */
		return data;
	};
	return {
		categories: await getCategories()
	};
};

export const actions = {
	updateProduct: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		console.log('id', id);

		const sku = formData.get('sku') as string;
		const name = 'Pantene Repair & Protect: 350ml Šampon za kosu';
		const barcode = formData.get('barcode') as string;
		const c_uom_id = Number(formData.get('c_uom_id'));
		const brand = formData.get('brand') as string;
		const mpn = formData.get('mpn') as string;
		const m_product_category_id = Number(formData.get('m_product_category_id'));
		const condition = formData.get('condition') as string;
		const isselfservice = Boolean(formData.get('condition'));
		const discontinued = Boolean(formData.get('discontinued'));
		const isactive = Boolean(formData.get('isactive'));
		const units = Number(formData.get('unitsperpack'));
		const unitsperpack = isNaN(units) ? undefined : units;

		const { error } = await supabase
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
			.eq('id', id);

		if (error) {
			return fail(500, {});
		}

		return {};
	}
} satisfies Actions;
