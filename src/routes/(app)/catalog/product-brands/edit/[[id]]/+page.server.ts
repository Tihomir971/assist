import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { mProductBrandsInsertSchema } from '$lib/types/supabase.zod.schemas';
import { BrandService } from '$lib/services/supabase/brand.service';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import { brandPayloadBuilder } from './brand.payload';

export const load = async ({ params, locals: { supabase } }) => {
	const id = params.id ? parseInt(params.id) : null;
	if (params.id && isNaN(id as number)) {
		throw error(400, 'Invalid brand ID');
	}

	const brandService = new BrandService(supabase);

	const entity = id ? await brandService.getById(id) : null;

	if (id && !entity) {
		throw error(404, 'Brand not found');
	}

	const form = await superValidate(entity, zod(mProductBrandsInsertSchema));

	return {
		form,
		entity
	};
};

const crud = createSimpleCRUD(
	'Brand',
	(supabase) => new BrandService(supabase),
	brandPayloadBuilder,
	mProductBrandsInsertSchema,
	'/catalog/product-brands'
);

export const actions = {
	upsert: crud.upsert,
	delete: crud.delete
};
