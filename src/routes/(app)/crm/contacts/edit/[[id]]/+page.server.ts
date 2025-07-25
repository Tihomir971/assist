import { PartnerService } from '$lib/services/supabase/partner.service';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import { contactPayloadBuilder } from './entity.payload';
import { cBpartnerInsertSchema } from '@tihomir971/assist-shared';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals: { supabase } }) => {
	const id = params.id ? parseInt(params.id) : null;
	const isCreateMode = id === null;

	const partnerService = new PartnerService(supabase);
	let form;

	if (isCreateMode) {
		form = await superValidate(zod(cBpartnerInsertSchema));
	} else {
		const entity = await partnerService.getById(id);
		if (!entity) {
			error(404, 'Contact not found');
		}
		form = await superValidate(entity, zod(cBpartnerInsertSchema));
	}

	return {
		form,
		entity: form.data,
		isCreateMode
	};
};

const crud = createSimpleCRUD(
	'Contact',
	(supabase) => new PartnerService(supabase),
	contactPayloadBuilder,
	cBpartnerInsertSchema
);

export const actions = {
	upsert: crud.upsert,
	delete: crud.delete
};
