import { z, type ZodSchema, type ZodRawShape, type ZodTypeAny } from 'zod';
// Removed: import type { FieldConfig, FormConfig } from '$lib/types/form-config.types';

// Define FieldConfig and FormConfig directly in this file
export interface FieldConfig {
	name: string;
	type: 'text' | 'number' | 'boolean' | 'select' | 'combobox' | 'textarea' | 'date' | 'datetime';
	label: string;
	required: boolean;
	placeholder?: string;
	description?: string;
	readonly?: boolean;
	disabled?: boolean;
	hidden?: boolean;
	options?: Array<{ value: string | number; label: string }>; // Ensure options align with LookupOption if used broadly
	validation: {
		min?: number;
		max?: number;
		pattern?: string;
		custom?: string[];
	};
}

export interface FormConfig {
	fields: FieldConfig[];
	title: string;
	description?: string;
}

export class SchemaAnalyzer {
	static analyzeSchema<T>(schema: ZodSchema<T>): FormConfig {
		const shape = this.getSchemaShape(schema);
		const fields: FieldConfig[] = [];

		for (const [fieldName, fieldSchemaUntyped] of Object.entries(shape)) {
			const fieldSchema = fieldSchemaUntyped as ZodSchema;
			const fieldConfig = this.analyzeField(fieldName, fieldSchema);
			if (fieldConfig) {
				fields.push(fieldConfig);
			}
		}

		return {
			fields,
			title: this.generateTitle(schema),
			description: this.extractDescription(schema) // This was schema.description, let's keep it consistent
		};
	}

	private static analyzeField(name: string, schema: ZodSchema): FieldConfig | null {
		const baseSchema = this.getBaseSchema(schema);
		const isOptional = this.isOptional(schema);
		const isNullable = this.isNullable(schema);

		// Mark system fields as readonly by default (they'll be excluded from submission by SmartPayloadBuilder)
		const isSystemField = ['created_at', 'updated_at'].includes(name);

		let type: FieldConfig['type'] = 'text';
		const validation: FieldConfig['validation'] = {};
		let options: FieldConfig['options'] = undefined;

		if (baseSchema instanceof z.ZodString) {
			// Check for datetime constraint
			const constraints = baseSchema._def.checks || [];
			const hasDatetimeCheck = constraints.some(
				(check: { kind: string }) => check.kind === 'datetime'
			);

			if (hasDatetimeCheck) {
				type = 'datetime';
			} else if (name.includes('description') || name.includes('note')) {
				type = 'textarea';
			} else {
				type = 'text';
			}
			validation.min = baseSchema.minLength ?? undefined;
			validation.max = baseSchema.maxLength ?? undefined;
		} else if (baseSchema instanceof z.ZodNumber) {
			type = 'number';
			validation.min = baseSchema.minValue ?? undefined;
			validation.max = baseSchema.maxValue ?? undefined;
		} else if (baseSchema instanceof z.ZodBoolean) {
			type = 'boolean';
		} else if (baseSchema instanceof z.ZodDate) {
			type = 'date';
		} else if (baseSchema instanceof z.ZodEnum) {
			type = 'select';
			options = (baseSchema.options as string[]).map((opt) => ({
				value: opt,
				label: this.generateLabel(opt)
			}));
		} else if (baseSchema instanceof z.ZodNativeEnum) {
			type = 'select';
			const enumValues = Object.values(baseSchema.enum);
			options = enumValues.map((opt) => ({
				value: opt as string | number,
				label: this.generateLabel(String(opt))
			}));
		}

		return {
			name,
			type,
			label: this.generateLabel(name),
			required: !isOptional && !isNullable,
			placeholder: this.generatePlaceholder(name, type),
			description: schema.description, // Get description from the field's schema
			readonly: isSystemField, // Mark system fields as readonly by default
			options,
			validation
		};
	}

	private static generateLabel(fieldName: string): string {
		return fieldName
			.replace(/_/g, ' ')
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, (str) => str.toUpperCase())
			.trim();
	}

	private static generatePlaceholder(fieldName: string, type: FieldConfig['type']): string {
		const label = this.generateLabel(fieldName).toLowerCase();
		switch (type) {
			case 'text':
			case 'number':
			case 'textarea':
				return `Enter ${label}...`;
			case 'select':
				return `Select ${label}...`;
			case 'date':
				return `Select a date...`;
			default:
				return '';
		}
	}

	private static extractDescription(schema: ZodSchema): string | undefined {
		// This is for the overall form description from the main schema
		return schema.description;
	}

	private static generateTitle(schema: ZodSchema): string {
		if (schema.description) {
			if (
				schema.description.toLowerCase().includes('form') ||
				schema.description.toLowerCase().includes('entity')
			) {
				return schema.description;
			}
		}
		// Fallback: Try to infer from schema type name if available, otherwise generic.
		// Zod's internal _def.typeName is not a public API and might change.
		// A more reliable way might be to pass an explicit title or use a convention.

		// Define a minimal interface for the expected shape of _def
		interface ZodDefWithTypeName {
			typeName?: string;
			// Add other properties from _def if needed elsewhere, but keep it minimal
		}

		const def = schema._def as ZodDefWithTypeName;
		const typeName = def?.typeName;

		if (typeof typeName === 'string' && typeName.startsWith('ZodObject_')) {
			const namePart = typeName.replace('ZodObject_', '').replace(/Schema$/, '');
			return `${this.generateLabel(namePart)} Form`;
		}
		return 'Generated Form';
	}

	private static getSchemaShape(schema: ZodSchema<unknown>): ZodRawShape {
		if (schema instanceof z.ZodObject) {
			return schema.shape;
		}
		if (schema instanceof z.ZodEffects || schema instanceof z.ZodTransformer) {
			return this.getSchemaShape(schema._def.schema);
		}
		if (
			schema instanceof z.ZodOptional ||
			schema instanceof z.ZodNullable ||
			schema instanceof z.ZodDefault
		) {
			return this.getSchemaShape(schema._def.innerType);
		}
		throw new Error(
			`Could not extract shape from Zod schema type: ${
				(schema._def as { typeName?: string })?.typeName
			}. Ensure it is a ZodObject or a wrapped ZodObject.`
		);
	}

	static getBaseSchema(schema: ZodSchema<unknown>): ZodTypeAny {
		let currentSchema = schema;
		while (
			currentSchema instanceof z.ZodOptional ||
			currentSchema instanceof z.ZodNullable ||
			currentSchema instanceof z.ZodDefault ||
			currentSchema instanceof z.ZodEffects ||
			currentSchema instanceof z.ZodTransformer
		) {
			if (currentSchema instanceof z.ZodEffects || currentSchema instanceof z.ZodTransformer) {
				currentSchema = currentSchema._def.schema;
			} else {
				currentSchema = currentSchema._def.innerType;
			}
		}
		return currentSchema as ZodTypeAny;
	}

	private static isOptional(schema: ZodSchema<unknown>): boolean {
		if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
			return true;
		}
		if (schema instanceof z.ZodNullable) {
			return this.isOptional(schema._def.innerType);
		}
		if (schema instanceof z.ZodEffects || schema instanceof z.ZodTransformer) {
			return this.isOptional(schema._def.schema);
		}
		return false;
	}

	private static isNullable(schema: ZodSchema<unknown>): boolean {
		if (schema instanceof z.ZodNullable) {
			return true;
		}
		if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
			return this.isNullable(schema._def.innerType);
		}
		if (schema instanceof z.ZodEffects || schema instanceof z.ZodTransformer) {
			return this.isNullable(schema._def.schema);
		}
		return false;
	}
}
