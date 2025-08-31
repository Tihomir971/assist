import { createSimpleCRUD } from '$lib/utils/simple-crud.factory4';
import { AttributeGroupService } from '$lib/services/supabase/attribute-group.service';
import { attributeGroupPayloadBuilder } from './entity.payload.js';
import { mAttributeGroupInsertSchema } from '$lib/types/supabase.schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals: { supabase } }) => {
	const isCreateMode = !params.id;
	const service = new AttributeGroupService(supabase);

	if (isCreateMode) {
		const form = await superValidate(zod4(mAttributeGroupInsertSchema));
		return {
			form,
			isCreateMode
		};
	} else {
		const entity = await service.getById(parseInt(params.id!));
		const form = await superValidate(entity, zod4(mAttributeGroupInsertSchema));
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
