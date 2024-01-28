import type { Actions } from '@sveltejs/kit';

/* export const load = async ({ locals: { supabase } }) => {
	const getCategories = async () => {
		const { data } = await supabase
			.from('m_product_category')
			.select('value:id,label:name')
			.order('name');
		return data;
	};
	return {
		categories: await getCategories()
	};
}; */

export const actions = {
	default: async ({ request }) => {
		console.log('Старт');
		const formData = await request.formData();

		const formValue = formData.get('id');
		console.log('formValueID', formValue);
		const id = Number(formValue);
		console.log('id', id);

		return;
	}
} satisfies Actions;
