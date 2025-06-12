export interface PayloadBuilderConfig<T extends Record<string, unknown>> {
	requiredFields: Extract<keyof T, string>[];
	optionalFields: Extract<keyof T, string>[];
	defaultValues: Partial<T>;
	transformers?: Partial<Record<Extract<keyof T, string>, (value: unknown) => unknown>>;
}

export class PayloadBuilder<CreateT extends Record<string, unknown>, UpdateT = Partial<CreateT>> {
	constructor(private config: PayloadBuilderConfig<CreateT>) {}

	buildCreatePayload(formData: Record<string, unknown>): CreateT {
		const payload = {} as CreateT;

		for (const field of this.config.requiredFields) {
			if (formData[field] === undefined || formData[field] === null) {
				throw new Error(`${String(field)} is required`);
			}
			payload[field] = this.transformValue(field, formData[field]) as CreateT[typeof field];
		}

		for (const field of this.config.optionalFields) {
			if (formData[field] !== undefined) {
				payload[field] = this.transformValue(field, formData[field]) as CreateT[typeof field];
			} else if (this.config.defaultValues[field] !== undefined) {
				payload[field] = this.config.defaultValues[field] as CreateT[typeof field];
			}
		}
		return payload;
	}

	buildUpdatePayload(formData: Record<string, unknown>): UpdateT {
		const payload = {} as UpdateT;
		const allFields = [...this.config.requiredFields, ...this.config.optionalFields];

		for (const field of allFields) {
			if (formData[field] !== undefined) {
				// field is Extract<keyof CreateT, string>.
				// payload is UpdateT (which is Partial<CreateT>).
				// keyof UpdateT is keyof CreateT. So field is a valid key for UpdateT.
				(payload as Record<string, unknown>)[field] = this.transformValue(field, formData[field]);
			}
		}
		return payload;
	}

	private transformValue(field: Extract<keyof CreateT, string>, value: unknown): unknown {
		const transformer = this.config.transformers?.[field];
		return transformer ? transformer(value) : value;
	}
}
