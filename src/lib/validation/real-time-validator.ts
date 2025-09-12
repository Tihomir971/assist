import { z, type ZodType } from 'zod';

/**
 * Real-time validation engine with debouncing and caching
 * Provides field-level, cross-field, and async validation capabilities
 */

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings?: string[];
	timestamp: Date;
	fieldName: string;
}

export interface CrossFieldValidationRule<T = Record<string, unknown>> {
	name: string;
	dependentFields: string[];
	validator: (data: T) => Promise<ValidationResult> | ValidationResult;
	debounceMs?: number;
}

export interface AsyncValidationRule {
	name: string;
	validator: (
		value: unknown,
		fieldName: string,
		formData: Record<string, unknown>
	) => Promise<ValidationResult>;
	debounceMs?: number;
	cacheKey?: (value: unknown, fieldName: string) => string;
	cacheTtlMs?: number;
}

export interface ValidationCache {
	result: ValidationResult;
	expiresAt: Date;
}

export interface RealTimeValidatorConfig<T = Record<string, unknown>> {
	schema: ZodType<T>;
	debounceMs?: number;
	enableCaching?: boolean;
	cacheTtlMs?: number;
	crossFieldRules?: CrossFieldValidationRule<T>[];
	asyncRules?: Record<string, AsyncValidationRule>;
	onValidationStart?: (fieldName: string) => void;
	onValidationComplete?: (fieldName: string, result: ValidationResult) => void;
	onValidationError?: (fieldName: string, error: Error) => void;
}

export class RealTimeValidator<T extends Record<string, unknown>> {
	private config: RealTimeValidatorConfig<T>;
	private validationTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
	private crossFieldTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
	private validationCache = new Map<string, ValidationCache>();
	private activeValidations = new Set<string>();

	constructor(config: RealTimeValidatorConfig<T>) {
		this.config = {
			debounceMs: 150,
			enableCaching: true,
			cacheTtlMs: 5 * 60 * 1000, // 5 minutes
			...config
		};
	}

	/**
	 * Validate a single field with debouncing
	 */
	async validateField(
		fieldName: string,
		value: unknown,
		formData: T,
		options: {
			immediate?: boolean;
			skipCache?: boolean;
		} = {}
	): Promise<ValidationResult> {
		const { immediate = false, skipCache = false } = options;

		// Generate cache key
		const cacheKey = this.generateCacheKey(fieldName, value, formData);

		// Check cache first (if enabled and not skipped)
		if (this.config.enableCaching && !skipCache) {
			const cached = this.getCachedResult(cacheKey);
			if (cached) {
				return cached;
			}
		}

		// Clear existing timeout for this field
		const existingTimeout = this.validationTimeouts.get(fieldName);
		if (existingTimeout) {
			clearTimeout(existingTimeout);
		}

		// Return promise that resolves when validation completes
		return new Promise((resolve) => {
			const performValidation = async () => {
				try {
					this.config.onValidationStart?.(fieldName);
					this.activeValidations.add(fieldName);

					const result = await this.performFieldValidation(fieldName, value, formData);

					// Cache the result
					if (this.config.enableCaching) {
						this.cacheResult(cacheKey, result);
					}

					this.config.onValidationComplete?.(fieldName, result);
					resolve(result);
				} catch (error) {
					const errorResult: ValidationResult = {
						isValid: false,
						errors: ['Validation error occurred'],
						fieldName,
						timestamp: new Date()
					};

					this.config.onValidationError?.(fieldName, error as Error);
					resolve(errorResult);
				} finally {
					this.activeValidations.delete(fieldName);
				}
			};

			if (immediate) {
				performValidation();
			} else {
				// Set debounced validation
				const timeout = setTimeout(performValidation, this.config.debounceMs);
				this.validationTimeouts.set(fieldName, timeout);
			}
		});
	}

	/**
	 * Validate multiple fields simultaneously
	 */
	async validateFields(
		fields: Array<{ name: string; value: unknown }>,
		formData: T,
		options: { immediate?: boolean } = {}
	): Promise<Record<string, ValidationResult>> {
		const validationPromises = fields.map(async ({ name, value }) => {
			const result = await this.validateField(name, value, formData, options);
			return [name, result] as const;
		});

		const results = await Promise.all(validationPromises);
		return Object.fromEntries(results);
	}

	/**
	 * Validate cross-field dependencies
	 */
	async validateCrossFields(
		changedField: string,
		formData: T,
		options: { immediate?: boolean } = {}
	): Promise<Record<string, ValidationResult>> {
		const { immediate = false } = options;
		const results: Record<string, ValidationResult> = {};

		// Find rules that depend on the changed field
		const relevantRules =
			this.config.crossFieldRules?.filter((rule) => rule.dependentFields.includes(changedField)) ||
			[];

		for (const rule of relevantRules) {
			const ruleKey = `cross_${rule.name}`;

			// Clear existing timeout for this rule
			const existingTimeout = this.crossFieldTimeouts.get(ruleKey);
			if (existingTimeout) {
				clearTimeout(existingTimeout);
			}

			const performCrossValidation = async () => {
				try {
					const result = await rule.validator(formData);
					results[rule.name] = result;
				} catch {
					results[rule.name] = {
						isValid: false,
						errors: ['Cross-field validation error'],
						fieldName: rule.name,
						timestamp: new Date()
					};
				}
			};

			if (immediate) {
				await performCrossValidation();
			} else {
				// Set debounced cross-field validation
				const timeout = setTimeout(
					performCrossValidation,
					rule.debounceMs || this.config.debounceMs
				);
				this.crossFieldTimeouts.set(ruleKey, timeout);
			}
		}

		return results;
	}

	/**
	 * Validate with async rules (e.g., server-side validation)
	 */
	async validateAsync(
		fieldName: string,
		value: unknown,
		formData: T,
		options: { skipCache?: boolean } = {}
	): Promise<ValidationResult> {
		const { skipCache = false } = options;
		const asyncRule = this.config.asyncRules?.[fieldName];

		if (!asyncRule) {
			return {
				isValid: true,
				errors: [],
				fieldName,
				timestamp: new Date()
			};
		}

		// Check cache for async validation
		if (this.config.enableCaching && !skipCache && asyncRule.cacheKey) {
			const cacheKey = asyncRule.cacheKey(value, fieldName);
			const cached = this.getCachedResult(cacheKey);
			if (cached) {
				return cached;
			}
		}

		try {
			const result = await asyncRule.validator(value, fieldName, formData);

			// Cache async result
			if (this.config.enableCaching && asyncRule.cacheKey) {
				const cacheKey = asyncRule.cacheKey(value, fieldName);
				this.cacheResult(cacheKey, result, asyncRule.cacheTtlMs);
			}

			return result;
		} catch {
			return {
				isValid: false,
				errors: ['Async validation failed'],
				fieldName,
				timestamp: new Date()
			};
		}
	}

	/**
	 * Check if field is currently being validated
	 */
	isValidating(fieldName: string): boolean {
		return this.activeValidations.has(fieldName);
	}

	/**
	 * Get all currently validating fields
	 */
	getValidatingFields(): string[] {
		return Array.from(this.activeValidations);
	}

	/**
	 * Cancel validation for a specific field
	 */
	cancelValidation(fieldName: string): void {
		const timeout = this.validationTimeouts.get(fieldName);
		if (timeout) {
			clearTimeout(timeout);
			this.validationTimeouts.delete(fieldName);
		}
		this.activeValidations.delete(fieldName);
	}

	/**
	 * Cancel all pending validations
	 */
	cancelAllValidations(): void {
		// Cancel field validations
		this.validationTimeouts.forEach((timeout) => clearTimeout(timeout));
		this.validationTimeouts.clear();

		// Cancel cross-field validations
		this.crossFieldTimeouts.forEach((timeout) => clearTimeout(timeout));
		this.crossFieldTimeouts.clear();

		// Clear active validations
		this.activeValidations.clear();
	}

	/**
	 * Clear validation cache
	 */
	clearCache(pattern?: string): void {
		if (pattern) {
			// Clear cache entries matching pattern
			const regex = new RegExp(pattern);
			for (const [key] of this.validationCache) {
				if (regex.test(key)) {
					this.validationCache.delete(key);
				}
			}
		} else {
			// Clear all cache
			this.validationCache.clear();
		}
	}

	/**
	 * Update validation configuration
	 */
	updateConfig(updates: Partial<RealTimeValidatorConfig<T>>): void {
		this.config = { ...this.config, ...updates };
	}

	/**
	 * Perform the actual field validation
	 */
	private async performFieldValidation(
		fieldName: string,
		value: unknown,
		formData: T
	): Promise<ValidationResult> {
		const result: ValidationResult = {
			isValid: true,
			errors: [],
			fieldName,
			timestamp: new Date()
		};

		try {
			// Extract field schema from main schema
			const fieldSchema = this.extractFieldSchema(fieldName);

			if (fieldSchema) {
				await fieldSchema.parseAsync(value);
			}

			// Run async validation if configured
			const asyncRule = this.config.asyncRules?.[fieldName];
			if (asyncRule) {
				const asyncResult = await this.validateAsync(fieldName, value, formData, {
					skipCache: true
				});
				if (!asyncResult.isValid) {
					result.isValid = false;
					result.errors.push(...asyncResult.errors);
				}
			}
		} catch (error) {
			result.isValid = false;

			if (error instanceof z.ZodError) {
				result.errors = error.issues.map((e) => e.message);
			} else {
				result.errors = ['Validation error'];
			}
		}

		return result;
	}

	/**
	 * Extract field schema from main schema
	 */
	private extractFieldSchema(fieldName: string): ZodType | null {
		try {
			if ('shape' in this.config.schema) {
				const shape = (this.config.schema as unknown as z.ZodObject<z.ZodRawShape>).shape;
				const fieldSchema = shape?.[fieldName];
				return fieldSchema ? (fieldSchema as unknown as ZodType) : null;
			}
			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Generate cache key for validation result
	 */
	private generateCacheKey(fieldName: string, value: unknown, formData: T): string {
		const valueStr = JSON.stringify(value);
		const contextStr = JSON.stringify(formData);
		return `${fieldName}:${valueStr}:${contextStr}`;
	}

	/**
	 * Get cached validation result
	 */
	private getCachedResult(cacheKey: string): ValidationResult | null {
		const cached = this.validationCache.get(cacheKey);

		if (cached && cached.expiresAt > new Date()) {
			return cached.result;
		}

		// Remove expired cache entry
		if (cached) {
			this.validationCache.delete(cacheKey);
		}

		return null;
	}

	/**
	 * Cache validation result
	 */
	private cacheResult(cacheKey: string, result: ValidationResult, ttlMs?: number): void {
		const ttl = ttlMs || this.config.cacheTtlMs || 5 * 60 * 1000;
		const expiresAt = new Date(Date.now() + ttl);

		this.validationCache.set(cacheKey, {
			result,
			expiresAt
		});
	}

	/**
	 * Cleanup resources
	 */
	destroy(): void {
		this.cancelAllValidations();
		this.clearCache();
	}
}

/**
 * Factory function to create real-time validator
 */
export function createRealTimeValidator<T extends Record<string, unknown>>(
	config: RealTimeValidatorConfig<T>
): RealTimeValidator<T> {
	return new RealTimeValidator(config);
}

/**
 * Utility function to create common cross-field validation rules
 */
export const createCrossFieldRules = {
	/**
	 * Ensure two fields match (e.g., password confirmation)
	 */
	fieldMatch: <T extends Record<string, unknown>>(
		field1: keyof T,
		field2: keyof T,
		message = 'Fields must match'
	): CrossFieldValidationRule<T> => ({
		name: `${String(field1)}_${String(field2)}_match`,
		dependentFields: [String(field1), String(field2)],
		validator: (data: T): ValidationResult => ({
			isValid: data[field1] === data[field2],
			errors: data[field1] === data[field2] ? [] : [message],
			fieldName: String(field2),
			timestamp: new Date()
		})
	}),

	/**
	 * Ensure one field is greater than another
	 */
	fieldGreaterThan: <T extends Record<string, unknown>>(
		greaterField: keyof T,
		lesserField: keyof T,
		message = 'Value must be greater than the other field'
	): CrossFieldValidationRule<T> => ({
		name: `${String(greaterField)}_greater_than_${String(lesserField)}`,
		dependentFields: [String(greaterField), String(lesserField)],
		validator: (data: T): ValidationResult => {
			const greater = Number(data[greaterField]);
			const lesser = Number(data[lesserField]);
			const isValid = !isNaN(greater) && !isNaN(lesser) && greater > lesser;

			return {
				isValid,
				errors: isValid ? [] : [message],
				fieldName: String(greaterField),
				timestamp: new Date()
			};
		}
	}),

	/**
	 * Conditional required field based on another field's value
	 */
	conditionalRequired: <T extends Record<string, unknown>>(
		requiredField: keyof T,
		conditionField: keyof T,
		conditionValue: unknown,
		message = 'This field is required'
	): CrossFieldValidationRule<T> => ({
		name: `${String(requiredField)}_conditional_required`,
		dependentFields: [String(conditionField), String(requiredField)],
		validator: (data: T): ValidationResult => {
			const shouldBeRequired = data[conditionField] === conditionValue;
			const hasValue =
				data[requiredField] !== null &&
				data[requiredField] !== undefined &&
				data[requiredField] !== '';

			const isValid = !shouldBeRequired || hasValue;

			return {
				isValid,
				errors: isValid ? [] : [message],
				fieldName: String(requiredField),
				timestamp: new Date()
			};
		}
	})
};
