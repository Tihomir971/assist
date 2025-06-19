import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { mAttributeOptionInsertSchema } from '$lib/types/supabase.zod.schemas';
import { mAttributeFormSchema } from './schema';
import { AttributeService } from '$lib/services/supabase/attribute.service';
import { AttributeOptionService } from '$lib/services/supabase/attribute-option.service';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import { attributePayloadBuilder } from './attribute.payload';
import { attributeOptionPayloadBuilder } from './attribute-option.payload';
import { AttributeGroupService } from '$lib/services/supabase/attribute-group.service';

export const load = async ({ params, locals: { supabase } }) => {
	const id = params.id ? parseInt(params.id) : null;
	if (params.id && isNaN(id as number)) {
		throw error(400, 'Invalid attribute ID');
	}

	const attributeService = new AttributeService(supabase);
	const attributeOptionService = new AttributeOptionService(supabase);
	const attributeGroupService = new AttributeGroupService(supabase);

	const [entity, attributeOptions, attributeGroups] = await Promise.all([
		id ? attributeService.getById(id) : Promise.resolve(null),
		id ? attributeOptionService.getByAttributeId(id) : Promise.resolve([]),
		attributeGroupService.getLookup()
	]);

	if (id && !entity) {
		throw error(404, 'Attribute not found');
	}

	const form = await superValidate(entity, zod(mAttributeFormSchema));
	const formAttributeOptions = await superValidate(zod(mAttributeOptionInsertSchema));

	return {
		form,
		formAttributeOptions,
		entity,
		attributeOptions,
		attributeGroups
	};
};

const crudAttribute = createSimpleCRUD(
	'Attribute',
	(supabase) => new AttributeService(supabase),
	attributePayloadBuilder,
	mAttributeFormSchema, // Use the new form schema here
	'/catalog/product-attributes/attributes'
);

const crudAttributeOption = createSimpleCRUD(
	'Attribute Option',
	(supabase) => new AttributeOptionService(supabase),
	attributeOptionPayloadBuilder,
	mAttributeOptionInsertSchema
);

export const actions = {
	upsert: crudAttribute.upsert,
	delete: crudAttribute.delete,
	optionUpsert: crudAttributeOption.upsert,
	optionDelete: crudAttributeOption.delete
};
