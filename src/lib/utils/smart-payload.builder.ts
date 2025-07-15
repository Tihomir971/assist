import { z, type ZodSchema, type ZodRawShape, type ZodTypeAny } from 'zod/v3';

export interface SmartPayloadConfig<T> {
	schema: ZodSchema<T>;
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
		// Cast the schema to ZodSchema<TConfigType> for more precise shape access if possible,
		// though ZodRawShape is a generic shape definition.
		const schemaShape = this.getSchemaShape(config.schema as ZodSchema<TConfigType>);

		for (const [fieldName, fieldSchemaUntyped] of Object.entries(schemaShape)) {
			const key = fieldName as keyof TConfigType;
			const fieldSchema = fieldSchemaUntyped as ZodSchema<unknown>; // Keep as ZodSchema<unknown> for individual field

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

	private getSchemaShape(schema: ZodSchema<unknown>): ZodRawShape {
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

	private isFieldOptional(fieldSchema: ZodSchema<unknown>): boolean {
		if (fieldSchema instanceof z.ZodOptional || fieldSchema instanceof z.ZodDefault) {
			return true;
		}
		if (fieldSchema instanceof z.ZodNullable) {
			return this.isFieldOptional(fieldSchema._def.innerType);
		}
		if (fieldSchema instanceof z.ZodEffects || fieldSchema instanceof z.ZodTransformer) {
			return this.isFieldOptional(fieldSchema._def.schema);
		}
		return false;
	}

	private autoTransform(value: unknown, fieldSchema: ZodSchema<unknown>): unknown {
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

	private getBaseSchema(fieldSchema: ZodSchema<unknown>): ZodTypeAny {
		let currentSchema = fieldSchema;
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
}
