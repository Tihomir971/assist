import type { MProductCategoryInsert, MProductCategoryUpdate } from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';
import {
	mProductCategoryInsertSchema,
	mProductCategoryUpdateSchema
} from '@tihomir971/assist-shared';

// Helper function to ensure valid JSONB data
function validateJsonbField(
	value: unknown,
	fieldName: string,
	isRequired: boolean = false
): Record<string, string> | null {
	// If value is null/undefined
	if (value === null || value === undefined) {
		return isRequired ? { 'en-US': '' } : null;
	}

	// If value is not an object, return appropriate default
	if (typeof value !== 'object' || Array.isArray(value)) {
		return isRequired ? { 'en-US': '' } : null;
	}

	// If empty object
	const keys = Object.keys(value as object);
	if (keys.length === 0) {
		return isRequired ? { 'en-US': '' } : null;
	}

	// Return the value as-is if it's a valid object
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
			descriptions: {}
		},
		transformers: {
			parent_id: (value) => {
				if (value === '' || value === undefined || value === null) {
					return null;
				}
				return Number(value);
			},
			// Add JSONB field transformers
			names: (value) => validateJsonbField(value, 'names', true),
			descriptions: (value) => validateJsonbField(value, 'descriptions', false) || {}
		}
	},
	{
		schema: mProductCategoryUpdateSchema,
		transformers: {
			parent_id: (value) => {
				if (value === '' || value === undefined || value === null) {
					return null;
				}
				return Number(value);
			},
			// Add JSONB field transformers for updates too
			names: (value) => validateJsonbField(value, 'names', true),
			descriptions: (value) => validateJsonbField(value, 'descriptions', false) || {}
		}
	}
);
