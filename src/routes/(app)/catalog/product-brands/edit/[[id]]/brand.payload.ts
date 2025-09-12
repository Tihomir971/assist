import {
	mProductBrandsInsertSchema,
	mProductBrandsUpdateSchema
} from '$lib/types/supabase.schemas';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';

export const brandPayloadBuilder = new SmartPayloadBuilder(
	{
		schema: mProductBrandsInsertSchema,
		defaults: {
			is_active: true
		}
	},
	{
		schema: mProductBrandsUpdateSchema
	}
);
