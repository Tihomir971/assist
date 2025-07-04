import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import { AttributeGroupService } from '$lib/services/supabase/attribute-group.service';
import { attributeGroupPayloadBuilder } from './entity.payload.js';
import { mAttributeGroupInsertSchema } from '@tihomir971/assist-shared';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals: { supabase } }) => {
	const isCreateMode = !params.id;
	const service = new AttributeGroupService(supabase);

	if (isCreateMode) {
		const form = await superValidate(zod(mAttributeGroupInsertSchema));
		return {
			form,
			isCreateMode
		};
	} else {
		const entity = await service.getById(parseInt(params.id!));
		const form = await superValidate(entity, zod(mAttributeGroupInsertSchema));
		return {
			form,
			isCreateMode
		};
	}
};

const crud = createSimpleCRUD(
	'AttributeGroup',
	(supabase) => new AttributeGroupService(supabase),
	attributeGroupPayloadBuilder,
	mAttributeGroupInsertSchema
);

export const actions = {
	upsert: crud.upsert,
	delete: crud.delete
};
