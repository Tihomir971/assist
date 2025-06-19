import {
	mProductCategoryInsertSchema,
	mProductCategoryUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import type {
	MProductCategoryInsert,
	MProductCategoryUpdate
} from '$lib/types/supabase.zod.schemas.d';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const categoryPayloadBuilder = new SmartPayloadBuilder<
	MProductCategoryInsert,
	MProductCategoryUpdate
>(
	{
		schema: mProductCategoryInsertSchema, // Zod schema for validation and shape
		defaults: {
			is_active: false,
			is_self_service: false
			// parent_id will be null by default if not provided and nullable
		},
		transformers: {
			// parent_id is already handled by autoTransform if it's a number schema
			// and form sends empty string for "no selection"
			parent_id: (value) => (value === '' || value === undefined ? null : Number(value))
		}
	},
	{
		schema: mProductCategoryUpdateSchema,
		transformers: {
			parent_id: (value) => (value === '' || value === undefined ? null : Number(value))
		}
	}
);
