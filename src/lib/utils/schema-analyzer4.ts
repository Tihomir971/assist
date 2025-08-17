import { type ZodRawShape, type ZodType } from 'zod/v4';

// Type definitions for Zod internal structures
interface ZodDef {
	typeName?: string;
	values?: (string | number)[];
	shape?: ZodRawShape;
	innerType?: ZodType;
}

interface ZodSchema {
	_def: ZodDef;
	description?: string;
	shape?: ZodRawShape;
	unwrap?: () => ZodType;
	innerType?: () => ZodType;
}

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
	options?: Array<{ value: string | number; label: string }>;
	validation: {
		min?: number;
		max?: number;
		pattern?: string;
		custom?: string[];
	};
	componentProps?: Record<string, unknown>;
}

export interface FormConfig {
	fields: FieldConfig[];
	title: string;
	description?: string;
}

export class SchemaAnalyzer {
	static analyzeSchema<T>(schema: ZodType<T>): FormConfig {
		const shape = this.getSchemaShape(schema);
		const fields: FieldConfig[] = [];

		for (const [fieldName, fieldSchemaUntyped] of Object.entries(shape)) {
			const fieldSchema = fieldSchemaUntyped as ZodType;
			const fieldConfig = this.analyzeField(fieldName, fieldSchema);
			if (fieldConfig) {
				fields.push(fieldConfig);
			}
		}

		return {
			fields,
			title: this.generateTitle(schema),
			description: this.extractDescription(schema)
		};
	}

	private static analyzeField(name: string, schema: ZodType): FieldConfig | null {
		const baseSchema = this.getBaseSchema(schema);
		const isOptional = this.isOptional(schema);
		const isNullable = this.isNullable(schema);

		// Mark system fields as readonly by default
		const isSystemField = ['created_at', 'updated_at'].includes(name);

		let type: FieldConfig['type'] = 'text';
		const validation: FieldConfig['validation'] = {};
		let options: FieldConfig['options'] = undefined;

		// Simplified type detection based on _def.typeName
		const typeName = (baseSchema as ZodSchema)._def.typeName;

		if (typeName === 'ZodString') {
			if (name.includes('description') || name.includes('note')) {
				type = 'textarea';
			} else {
				type = 'text';
			}
		} else if (typeName === 'ZodNumber') {
			type = 'number';
		} else if (typeName === 'ZodBoolean') {
			type = 'boolean';
		} else if (typeName === 'ZodDate') {
			type = 'date';
		} else if (typeName === 'ZodEnum') {
			type = 'select';
			const enumOptions = (baseSchema as ZodSchema)._def.values || [];
			options = enumOptions.map((opt: string | number) => ({
				value: opt,
				label: this.generateLabel(String(opt))
			}));
		} else if (typeName === 'ZodNativeEnum') {
			type = 'select';
			const enumValues = (baseSchema as ZodSchema)._def.values || [];
			options = enumValues.map((opt: string | number) => ({
				value: opt,
				label: this.generateLabel(String(opt))
			}));
		}

		return {
			name,
			type,
			label: this.generateLabel(name),
			required: !isOptional && !isNullable,
			placeholder: this.generatePlaceholder(name, type),
			description: (schema as ZodSchema).description,
			readonly: isSystemField,
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

	private static extractDescription(schema: ZodType): string | undefined {
		return (schema as ZodSchema).description;
	}

	private static generateTitle(schema: ZodType): string {
		const description = (schema as ZodSchema).description;
		if (description) {
			if (
				description.toLowerCase().includes('form') ||
				description.toLowerCase().includes('entity')
			) {
				return description;
			}
		}

		const typeName = (schema as ZodSchema)._def.typeName;
		if (typeof typeName === 'string' && typeName.startsWith('ZodObject_')) {
			const namePart = typeName.replace('ZodObject_', '').replace(/Schema$/, '');
			return `${this.generateLabel(namePart)} Form`;
		}
		return 'Generated Form';
	}

	private static getSchemaShape(schema: ZodType<unknown>): ZodRawShape {
		const typeName = (schema as ZodSchema)._def?.typeName;

		// Check if it's a ZodObject directly
		if (typeName === 'ZodObject') {
			return (schema as ZodSchema).shape || {};
		}

		// Check if schema has a shape property directly (Zod v4 compatibility)
		if ('shape' in schema && schema.shape) {
			return schema.shape as ZodRawShape;
		}

		// Handle wrapped schemas by checking for innerType or unwrap methods
		if ('unwrap' in schema && typeof schema.unwrap === 'function') {
			return this.getSchemaShape(schema.unwrap() as ZodType);
		}

		if ('innerType' in schema && typeof schema.innerType === 'function') {
			return this.getSchemaShape(schema.innerType() as ZodType);
		}

		// Handle ZodDefault, ZodOptional, ZodNullable, etc.
		if ('_def' in schema && schema._def && 'innerType' in schema._def) {
			const def = schema._def as ZodDef;
			if (def.innerType) {
				return this.getSchemaShape(def.innerType);
			}
		}

		// Last resort: try to access shape through _def
		if ('_def' in schema && schema._def && 'shape' in schema._def) {
			const def = schema._def as ZodDef;
			return def.shape || {};
		}

		throw new Error(
			`Could not extract shape from Zod schema type: ${typeName || 'unknown'}. Ensure it is a ZodObject or a wrapped ZodObject.`
		);
	}

	static getBaseSchema(schema: ZodType<unknown>): ZodType {
		let currentSchema = schema;
		let iterations = 0;
		const maxIterations = 10; // Prevent infinite loops

		while (iterations < maxIterations) {
			const typeName = (currentSchema as ZodSchema)._def.typeName;

			if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
				if ('unwrap' in currentSchema && typeof currentSchema.unwrap === 'function') {
					currentSchema = currentSchema.unwrap() as ZodType;
				} else {
					break;
				}
			} else if (typeName === 'ZodEffects') {
				if ('innerType' in currentSchema && typeof currentSchema.innerType === 'function') {
					currentSchema = currentSchema.innerType() as ZodType;
				} else {
					break;
				}
			} else {
				break;
			}

			iterations++;
		}

		return currentSchema;
	}

	private static isOptional(schema: ZodType<unknown>): boolean {
		const typeName = (schema as ZodSchema)._def.typeName;

		if (typeName === 'ZodOptional' || typeName === 'ZodDefault') {
			return true;
		}

		if (typeName === 'ZodNullable' && 'unwrap' in schema && typeof schema.unwrap === 'function') {
			return this.isOptional(schema.unwrap() as ZodType);
		}

		if (
			typeName === 'ZodEffects' &&
			'innerType' in schema &&
			typeof schema.innerType === 'function'
		) {
			return this.isOptional(schema.innerType() as ZodType);
		}

		return false;
	}

	private static isNullable(schema: ZodType<unknown>): boolean {
		const typeName = (schema as ZodSchema)._def.typeName;

		if (typeName === 'ZodNullable') {
			return true;
		}

		if (
			(typeName === 'ZodOptional' || typeName === 'ZodDefault') &&
			'unwrap' in schema &&
			typeof schema.unwrap === 'function'
		) {
			return this.isNullable(schema.unwrap() as ZodType);
		}

		if (
			typeName === 'ZodEffects' &&
			'innerType' in schema &&
			typeof schema.innerType === 'function'
		) {
			return this.isNullable(schema.innerType() as ZodType);
		}

		return false;
	}
}
