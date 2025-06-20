import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import { AttributeSetService } from '$lib/services/supabase/attribute-set.service';
import { AttributeService } from '$lib/services/supabase/attribute.service';
import { AttributeSetAttributeService } from '$lib/services/supabase/attribute-set-attribute.service';
import {
	mAttributesetInsertSchema,
	mAttributesetAttributeInsertSchema
} from '$lib/types/supabase.zod.schemas';
import { attributeSetPayloadBuilder } from './attribute-set.payload.js';
import { attributeSetAttributePayloadBuilder } from './attribute-set-attribute.payload.js';

export const load = async ({ params, locals: { supabase } }) => {
	const id = params.id ? parseInt(params.id) : null;
	if (params.id && isNaN(id as number)) {
		throw error(400, 'Invalid attribute set ID');
	}

	const attributeSetService = new AttributeSetService(supabase);
	const attributeSetAttributeService = new AttributeSetAttributeService(supabase);
	const attributeService = new AttributeService(supabase);

	const [entity, attributeSetAttributes, attributes] = await Promise.all([
		id ? attributeSetService.getById(id) : Promise.resolve(null),
		id ? attributeSetAttributeService.getByAttributeSetId(id) : Promise.resolve([]),
		attributeService.getLookup()
	]);

	if (id && !entity) {
		throw error(404, 'Attribute set not found');
	}

	const form = await superValidate(entity, zod(mAttributesetInsertSchema));
	const formAttributeSetAttributes = await superValidate(zod(mAttributesetAttributeInsertSchema));

	return {
		form,
		formAttributeSetAttributes,
		entity,
		attributeSetAttributes,
		attributes
	};
};

const crudAttributeSet = createSimpleCRUD(
	'AttributeSet',
	(supabase) => new AttributeSetService(supabase),
	attributeSetPayloadBuilder,
	mAttributesetInsertSchema,
	'/catalog/product-attributes/attribute-sets'
);

const crudAttributeSetAttribute = createSimpleCRUD(
	'AttributeSetAttribute',
	(supabase) => new AttributeSetAttributeService(supabase),
	attributeSetAttributePayloadBuilder,
	mAttributesetAttributeInsertSchema
);

export const actions = {
	upsert: crudAttributeSet.upsert,
	delete: crudAttributeSet.delete,
	attributeUpsert: crudAttributeSetAttribute.upsert,
	attributeDelete: crudAttributeSetAttribute.delete
};
