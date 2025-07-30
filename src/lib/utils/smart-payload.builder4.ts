import { z, type ZodType, type ZodRawShape } from 'zod/v4';

// Type definitions for Zod v4 internal structures
interface ZodInternalDef {
	typeName?: string;
	innerType?: ZodType<unknown>;
	schema?: ZodType<unknown>;
}

interface ZodInternalSchema {
	_zod: {
		def: ZodInternalDef;
	};
}

export interface SmartPayloadConfig<T> {
	schema: ZodType<T>;
	transformers?: Partial<Record<keyof T, (value: unknown) => unknown>>;
	defaults?: Partial<T>;
	excludeFields?: (keyof T)[];
}

export class SmartPayloadBuilder<CreateT, UpdateT = Partial<CreateT>> {
	private createConfig: SmartPayloadConfig<CreateT>;
	private updateConfig?: SmartPayloadConfig<UpdateT>;

	constructor(
		createConfig: SmartPayloadConfig<CreateT>,
		updateConfig?: SmartPayloadConfig<UpdateT>
	) {
		this.createConfig = createConfig;
		this.updateConfig = updateConfig;
	}

	buildCreatePayload(formData: Record<string, unknown>): CreateT {
		// Cast to CreateT is safe as _buildPayloadInternal with createConfig is expected to align with CreateT
		return this._buildPayloadInternal(formData, this.createConfig, 'create') as CreateT;
	}

	buildUpdatePayload(formData: Record<string, unknown>): UpdateT {
		if (this.updateConfig) {
			return this._buildPayloadInternal(formData, this.updateConfig, 'update') as UpdateT;
		}
		// If using createConfig for an update operation, the result is Partial<CreateT>.
		// Since UpdateT is Partial<CreateT>, this cast is generally safe.
		const builtFromCreateConfig = this._buildPayloadInternal(formData, this.createConfig, 'update');
		return builtFromCreateConfig as UpdateT;
	}

	private _buildPayloadInternal<TConfigType>(
		formData: Record<string, unknown>,
		config: SmartPayloadConfig<TConfigType>,
		mode: 'create' | 'update'
	): Partial<TConfigType> {
		// Returns Partial as not all fields might be set
		const payload: Partial<TConfigType> = {};
		// Cast the schema to ZodType<TConfigType> for more precise shape access if possible,
		// though ZodRawShape is a generic shape definition.
		const schemaShape = this.getSchemaShape(config.schema as ZodType<TConfigType>);

		for (const [fieldName, fieldSchemaUntyped] of Object.entries(schemaShape)) {
			const key = fieldName as keyof TConfigType;
			const fieldSchema = fieldSchemaUntyped as ZodType<unknown>; // Keep as ZodType<unknown> for individual field

			if (config.excludeFields?.includes(key)) continue;

			if (mode === 'create' && ['id', 'created_at', 'updated_at'].includes(fieldName)) continue;
			if (mode === 'update' && ['created_at', 'updated_at'].includes(fieldName)) continue;
			if (mode === 'update' && fieldName === 'id') continue;

			const rawValue = formData[fieldName];
			const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== '';

			if (hasValue) {
				const transformer = config.transformers?.[key];
				payload[key] = (
					transformer ? transformer(rawValue) : this.autoTransform(rawValue, fieldSchema)
				) as TConfigType[keyof TConfigType];
			} else if (mode === 'create' && !this.isFieldOptional(fieldSchema)) {
				const defaultValue = config.defaults?.[key];
				if (defaultValue !== undefined) {
					payload[key] = defaultValue as TConfigType[keyof TConfigType];
				}
			} else if (mode === 'update' && Object.prototype.hasOwnProperty.call(formData, fieldName)) {
				const transformer = config.transformers?.[key];
				payload[key] = (
					transformer ? transformer(rawValue) : this.autoTransform(rawValue, fieldSchema)
				) as TConfigType[keyof TConfigType];
			}
		}
		return payload;
	}

	private getSchemaShape(schema: ZodType<unknown>): ZodRawShape {
		if (schema instanceof z.ZodObject) {
			return schema.shape;
		}
		if (schema instanceof z.ZodTransform) {
			return this.getSchemaShape((schema as ZodInternalSchema)._zod.def.schema!);
		}
		if (
			schema instanceof z.ZodOptional ||
			schema instanceof z.ZodNullable ||
			schema instanceof z.ZodDefault
		) {
			return this.getSchemaShape((schema as unknown as ZodInternalSchema)._zod.def.innerType!);
		}
		throw new Error(
			`Could not extract shape from Zod schema type: ${
				(schema as ZodInternalSchema)._zod?.def?.typeName
			}. Ensure it is a ZodObject or a wrapped ZodObject.`
		);
	}

	private isFieldOptional(fieldSchema: ZodType<unknown>): boolean {
		if (fieldSchema instanceof z.ZodOptional || fieldSchema instanceof z.ZodDefault) {
			return true;
		}
		if (fieldSchema instanceof z.ZodNullable) {
			return this.isFieldOptional(
				(fieldSchema as unknown as ZodInternalSchema)._zod.def.innerType!
			);
		}
		if (fieldSchema instanceof z.ZodTransform) {
			return this.isFieldOptional((fieldSchema as ZodInternalSchema)._zod.def.schema!);
		}
		return false;
	}

	private autoTransform(value: unknown, fieldSchema: ZodType<unknown>): unknown {
		const baseSchema = this.getBaseSchema(fieldSchema);

		if (baseSchema instanceof z.ZodNumber) {
			if (value === '' || value === null || value === undefined) {
				return this.isFieldOptional(fieldSchema) || fieldSchema instanceof z.ZodNullable
					? null
					: value;
			}
			const num = Number(value);
			return isNaN(num) ? value : num;
		}

		if (baseSchema instanceof z.ZodBoolean) {
			if (typeof value === 'string') {
				if (value.toLowerCase() === 'true') return true;
				if (value.toLowerCase() === 'false') return false;
			}
			if (typeof value === 'number') {
				if (value === 1) return true;
				if (value === 0) return false;
			}
			return value === undefined &&
				!(fieldSchema instanceof z.ZodOptional || fieldSchema instanceof z.ZodDefault)
				? false
				: Boolean(value);
		}

		if (baseSchema instanceof z.ZodString) {
			if (value === null || value === undefined) {
				return fieldSchema instanceof z.ZodNullable ? null : '';
			}
			return String(value);
		}

		if (baseSchema instanceof z.ZodDate) {
			if (value === '' || value === null || value === undefined) {
				return this.isFieldOptional(fieldSchema) || fieldSchema instanceof z.ZodNullable
					? null
					: value;
			}
			const date = new Date(value as string | number | Date);
			return isNaN(date.getTime()) ? value : date;
		}
		return value;
	}

	private getBaseSchema(fieldSchema: ZodType<unknown>): ZodType {
		let currentSchema = fieldSchema;
		while (
			currentSchema instanceof z.ZodOptional ||
			currentSchema instanceof z.ZodNullable ||
			currentSchema instanceof z.ZodDefault ||
			currentSchema instanceof z.ZodTransform
		) {
			if (currentSchema instanceof z.ZodTransform) {
				currentSchema = (currentSchema as ZodInternalSchema)._zod.def.schema!;
			} else {
				currentSchema = (currentSchema as unknown as ZodInternalSchema)._zod.def.innerType!;
			}
		}
		return currentSchema as ZodType;
	}
}
