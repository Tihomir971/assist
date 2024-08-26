import type { Actions, PageServerLoad } from './$types';
import { ProductService } from '$lib/services/supabase/';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, message } from 'sveltekit-superforms';
import { crudmProductPoSchema } from '$lib/types/supabase/mProductPo.validator';

export const load = (async ({ params, locals: { supabase } }) => {
	const productId = params.slug as unknown as number;

	const [product, productPurchasing /* , { data: m_product_po } */, { data: c_bpartner }] =
		await Promise.all([
			ProductService.getProduct(supabase, productId),
			ProductService.getProductPurchasing(supabase, productId),
			/* supabase.from('m_product_po').select('*').eq('m_product_id', productId), */
			supabase.from('c_bpartner').select('value:id,label:name').eq('isvendor', true).order('name')
		]);
	if (!productPurchasing) {
		return;
	}
	const { data: m_product_po } = await supabase
		.from('m_product_po')
		.select('*')
		.eq('m_product_id', productId);
	//const form = await superValidate(m_product_po, zod(crudmProductPoSchema));
	//	const form = await superValidate(m_product_po[], zod(crudmProductPoSchema));

	return { product, productPurchasing, c_bpartner, m_product_po };
}) satisfies PageServerLoad;

export const actions = {
	mProductPo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(crudmProductPoSchema));
		if (!form.valid) return fail(400, { form });

		if (!form.data.id) {
			console.log('form.data', form.data);

			const { error: insertError } = await supabase.from('m_product_po').insert(form.data);
			if (insertError) {
				return fail(500, { form });
			}
			return message(form, 'User created!');
		}

		return { form };
	}
} satisfies Actions;
