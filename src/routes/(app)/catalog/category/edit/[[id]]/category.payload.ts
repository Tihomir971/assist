import {
	mProductCategoryInsertSchema,
	mProductCategoryUpdateSchema
} from '$lib/types/supabase.schemas';
import type { MProductCategoryInsert, MProductCategoryUpdate } from '$lib/types/supabase.zod';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

// Helper function to ensure valid JSONB data
function validateJsonbField(
	value: unknown,
	fieldName: string,
	isRequired: boolean = false
): Record<string, string> | null {
	console.log(`[DEBUG] validateJsonbField - ${fieldName}:`, value, 'isRequired:', isRequired);

	// If value is null/undefined
	if (value === null || value === undefined) {
		const result = isRequired ? { 'en-US': '' } : null;
		console.log(`[DEBUG] ${fieldName} - null/undefined, returning:`, result);
		return result;
	}

	// If value is not an object, return appropriate default
	if (typeof value !== 'object' || Array.isArray(value)) {
		const result = isRequired ? { 'en-US': '' } : null;
		console.log(`[DEBUG] ${fieldName} - not object/array, returning:`, result);
		return result;
	}

	// If empty object
	const keys = Object.keys(value as object);
	if (keys.length === 0) {
		const result = isRequired ? { 'en-US': '' } : null;
		console.log(`[DEBUG] ${fieldName} - empty object, returning:`, result);
		return result;
	}

	// Return the value as-is if it's a valid object
	console.log(`[DEBUG] ${fieldName} - valid object, returning as-is:`, value);
	return value as Record<string, string>;
}

export const categoryPayloadBuilder = new SmartPayloadBuilder<
	MProductCategoryInsert,
	MProductCategoryUpdate
>(
	{
		schema: mProductCategoryInsertSchema,
		defaults: {
			is_active: false,
			is_self_service: false,
			names: { 'en-US': '' }, // Ensure names has at least one property
			descriptions: null
		},
		transformers: {
			parent_id: (value) => {
				console.log(`[DEBUG] parent_id transformer - input:`, value);
				if (value === '' || value === undefined || value === null) {
					console.log(`[DEBUG] parent_id transformer - returning null`);
					return null;
				}
				const result = Number(value);
				console.log(`[DEBUG] parent_id transformer - returning:`, result);
				return result;
			},
			// Add JSONB field transformers
			names: (value) => validateJsonbField(value, 'names', true),
			descriptions: (value) => validateJsonbField(value, 'descriptions', false)
		}
	},
	{
		schema: mProductCategoryUpdateSchema,
		transformers: {
			parent_id: (value) => {
				console.log(`[DEBUG] parent_id transformer (update) - input:`, value);
				if (value === '' || value === undefined || value === null) {
					console.log(`[DEBUG] parent_id transformer (update) - returning null`);
					return null;
				}
				const result = Number(value);
				console.log(`[DEBUG] parent_id transformer (update) - returning:`, result);
				return result;
			},
			// Add JSONB field transformers for updates too
			names: (value) => validateJsonbField(value, 'names', true),
			descriptions: (value) => validateJsonbField(value, 'descriptions', false)
		}
	}
);
