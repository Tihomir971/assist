import { z, type ZodSchema } from 'zod/v3';
import { SchemaAnalyzer, type FieldConfig } from '$lib/utils/schema-analyzer';

/**
 * Schema-based validation integration with Zod schemas
 * Provides automatic validation rules extraction and custom error messages
 */

export interface ValidationRule {
	type: 'required' | 'min' | 'max' | 'pattern' | 'custom' | 'email' | 'url' | 'date';
	value?: unknown;
	message: string;
	condition?: (formData: Record<string, unknown>) => boolean;
}

export interface FieldValidationConfig {
	fieldName: string;
	rules: ValidationRule[];
	customMessages?: Record<string, string>;
	conditionalRules?: Array<{
		condition: (formData: Record<string, unknown>) => boolean;
		rules: ValidationRule[];
	}>;
}

export interface SchemaValidationConfig<T = Record<string, unknown>> {
	schema: ZodSchema<T>;
	customMessages?: Record<string, Record<string, string>>; // field -> rule -> message
	i18nMessages?: Record<string, Record<string, Record<string, string>>>; // locale -> field -> rule -> message
	currentLocale?: string;
	enableConditionalValidation?: boolean;
	cacheValidationRules?: boolean;
}

export interface ValidationContext<T = Record<string, unknown>> {
	formData: T;
	fieldName: string;
	value: unknown;
	locale?: string;
	additionalContext?: Record<string, unknown>;
}

export class SchemaValidator<T extends Record<string, unknown>> {
	private config: SchemaValidationConfig<T>;
	private validationRulesCache = new Map<string, FieldValidationConfig>();
	private fieldConfigs: FieldConfig[] = [];

	constructor(config: SchemaValidationConfig<T>) {
		this.config = {
			currentLocale: 'en',
			enableConditionalValidation: true,
			cacheValidationRules: true,
			...config
		};

		this.initializeValidationRules();
	}

	/**
	 * Initialize validation rules from schema
	 */
	private initializeValidationRules(): void {
		try {
			const formConfig = SchemaAnalyzer.analyzeSchema(this.config.schema);
			this.fieldConfigs = formConfig.fields;

			// Generate validation rules for each field
			this.fieldConfigs.forEach((fieldConfig) => {
				const validationConfig = this.generateFieldValidationConfig(fieldConfig);
				if (this.config.cacheValidationRules) {
					this.validationRulesCache.set(fieldConfig.name, validationConfig);
				}
			});
		} catch (error) {
			console.error('Failed to initialize validation rules:', error);
		}
	}

	/**
	 * Generate validation configuration for a field
	 */
	private generateFieldValidationConfig(fieldConfig: FieldConfig): FieldValidationConfig {
		const rules: ValidationRule[] = [];

		// Required validation
		if (fieldConfig.required) {
			rules.push({
				type: 'required',
				message: this.getMessage(fieldConfig.name, 'required', 'This field is required')
			});
		}

		// Type-specific validations
		switch (fieldConfig.type) {
			case 'text':
			case 'textarea':
				this.addStringValidationRules(rules, fieldConfig);
				break;
			case 'number':
				this.addNumberValidationRules(rules, fieldConfig);
				break;
			case 'date':
				this.addDateValidationRules(rules, fieldConfig);
				break;
			case 'select':
				this.addSelectValidationRules(rules, fieldConfig);
				break;
		}

		// Custom validation rules from schema
		if (fieldConfig.validation.custom) {
			fieldConfig.validation.custom.forEach((customRule) => {
				rules.push({
					type: 'custom',
					value: customRule,
					message: this.getMessage(fieldConfig.name, 'custom', customRule)
				});
			});
		}

		return {
			fieldName: fieldConfig.name,
			rules,
			customMessages: this.config.customMessages?.[fieldConfig.name]
		};
	}

	/**
	 * Add string validation rules
	 */
	private addStringValidationRules(rules: ValidationRule[], fieldConfig: FieldConfig): void {
		if (fieldConfig.validation.min !== undefined) {
			rules.push({
				type: 'min',
				value: fieldConfig.validation.min,
				message: this.getMessage(
					fieldConfig.name,
					'min',
					`Must be at least ${fieldConfig.validation.min} characters`
				)
			});
		}

		if (fieldConfig.validation.max !== undefined) {
			rules.push({
				type: 'max',
				value: fieldConfig.validation.max,
				message: this.getMessage(
					fieldConfig.name,
					'max',
					`Must be no more than ${fieldConfig.validation.max} characters`
				)
			});
		}

		if (fieldConfig.validation.pattern) {
			rules.push({
				type: 'pattern',
				value: fieldConfig.validation.pattern,
				message: this.getMessage(fieldConfig.name, 'pattern', 'Invalid format')
			});
		}

		// Email validation for email fields
		if (fieldConfig.name.toLowerCase().includes('email')) {
			rules.push({
				type: 'email',
				message: this.getMessage(fieldConfig.name, 'email', 'Invalid email address')
			});
		}

		// URL validation for URL fields
		if (
			fieldConfig.name.toLowerCase().includes('url') ||
			fieldConfig.name.toLowerCase().includes('website')
		) {
			rules.push({
				type: 'url',
				message: this.getMessage(fieldConfig.name, 'url', 'Invalid URL')
			});
		}
	}

	/**
	 * Add number validation rules
	 */
	private addNumberValidationRules(rules: ValidationRule[], fieldConfig: FieldConfig): void {
		if (fieldConfig.validation.min !== undefined) {
			rules.push({
				type: 'min',
				value: fieldConfig.validation.min,
				message: this.getMessage(
					fieldConfig.name,
					'min',
					`Must be at least ${fieldConfig.validation.min}`
				)
			});
		}

		if (fieldConfig.validation.max !== undefined) {
			rules.push({
				type: 'max',
				value: fieldConfig.validation.max,
				message: this.getMessage(
					fieldConfig.name,
					'max',
					`Must be no more than ${fieldConfig.validation.max}`
				)
			});
		}
	}

	/**
	 * Add date validation rules
	 */
	private addDateValidationRules(rules: ValidationRule[], fieldConfig: FieldConfig): void {
		rules.push({
			type: 'date',
			message: this.getMessage(fieldConfig.name, 'date', 'Invalid date')
		});
	}

	/**
	 * Add select validation rules
	 */
	private addSelectValidationRules(rules: ValidationRule[], fieldConfig: FieldConfig): void {
		if (fieldConfig.options && fieldConfig.options.length > 0) {
			const validValues = fieldConfig.options.map((opt) => opt.value);
			rules.push({
				type: 'custom',
				value: validValues,
				message: this.getMessage(fieldConfig.name, 'select', 'Please select a valid option')
			});
		}
	}

	/**
	 * Validate a single field
	 */
	async validateField(context: ValidationContext<T>): Promise<{
		isValid: boolean;
		errors: string[];
		warnings?: string[];
	}> {
		const { fieldName, value, formData } = context;
		const validationConfig = this.getFieldValidationConfig(fieldName);

		if (!validationConfig) {
			return { isValid: true, errors: [] };
		}

		const errors: string[] = [];
		const warnings: string[] = [];

		// Apply validation rules
		for (const rule of validationConfig.rules) {
			// Check if rule should be applied based on condition
			if (rule.condition && !rule.condition(formData)) {
				continue;
			}

			const ruleResult = await this.applyValidationRule(rule, value);
			if (!ruleResult.isValid) {
				errors.push(ruleResult.message);
			}
			if (ruleResult.warning) {
				warnings.push(ruleResult.warning);
			}
		}

		// Apply conditional rules if enabled
		if (this.config.enableConditionalValidation && validationConfig.conditionalRules) {
			for (const conditionalRule of validationConfig.conditionalRules) {
				if (conditionalRule.condition(formData)) {
					for (const rule of conditionalRule.rules) {
						const ruleResult = await this.applyValidationRule(rule, value);
						if (!ruleResult.isValid) {
							errors.push(ruleResult.message);
						}
						if (ruleResult.warning) {
							warnings.push(ruleResult.warning);
						}
					}
				}
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings: warnings.length > 0 ? warnings : undefined
		};
	}

	/**
	 * Validate entire form using schema
	 */
	async validateForm(formData: T): Promise<{
		isValid: boolean;
		fieldErrors: Record<string, string[]>;
		globalErrors: string[];
	}> {
		const fieldErrors: Record<string, string[]> = {};
		const globalErrors: string[] = [];

		try {
			// First, validate using Zod schema
			await this.config.schema.parseAsync(formData);
		} catch (error) {
			if (error instanceof z.ZodError) {
				error.errors.forEach((zodError) => {
					const fieldPath = zodError.path.join('.');
					if (fieldPath) {
						if (!fieldErrors[fieldPath]) {
							fieldErrors[fieldPath] = [];
						}
						fieldErrors[fieldPath].push(zodError.message);
					} else {
						globalErrors.push(zodError.message);
					}
				});
			}
		}

		// Then, validate each field with custom rules
		for (const fieldConfig of this.fieldConfigs) {
			const context: ValidationContext<T> = {
				formData,
				fieldName: fieldConfig.name,
				value: formData[fieldConfig.name],
				locale: this.config.currentLocale
			};

			const fieldResult = await this.validateField(context);
			if (!fieldResult.isValid) {
				if (!fieldErrors[fieldConfig.name]) {
					fieldErrors[fieldConfig.name] = [];
				}
				fieldErrors[fieldConfig.name].push(...fieldResult.errors);
			}
		}

		return {
			isValid: Object.keys(fieldErrors).length === 0 && globalErrors.length === 0,
			fieldErrors,
			globalErrors
		};
	}

	/**
	 * Apply a single validation rule
	 */
	private async applyValidationRule(
		rule: ValidationRule,
		value: unknown
	): Promise<{ isValid: boolean; message: string; warning?: string }> {
		switch (rule.type) {
			case 'required':
				return {
					isValid: value !== null && value !== undefined && value !== '',
					message: rule.message
				};

			case 'min':
				if (typeof value === 'string') {
					return {
						isValid: value.length >= (rule.value as number),
						message: rule.message
					};
				} else if (typeof value === 'number') {
					return {
						isValid: value >= (rule.value as number),
						message: rule.message
					};
				}
				return { isValid: true, message: '' };

			case 'max':
				if (typeof value === 'string') {
					return {
						isValid: value.length <= (rule.value as number),
						message: rule.message
					};
				} else if (typeof value === 'number') {
					return {
						isValid: value <= (rule.value as number),
						message: rule.message
					};
				}
				return { isValid: true, message: '' };

			case 'pattern':
				if (typeof value === 'string') {
					const regex = new RegExp(rule.value as string);
					return {
						isValid: regex.test(value),
						message: rule.message
					};
				}
				return { isValid: true, message: '' };

			case 'email':
				if (typeof value === 'string') {
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					return {
						isValid: emailRegex.test(value),
						message: rule.message
					};
				}
				return { isValid: true, message: '' };

			case 'url':
				if (typeof value === 'string') {
					try {
						new URL(value);
						return { isValid: true, message: '' };
					} catch {
						return { isValid: false, message: rule.message };
					}
				}
				return { isValid: true, message: '' };

			case 'date':
				if (value instanceof Date) {
					return {
						isValid: !isNaN(value.getTime()),
						message: rule.message
					};
				} else if (typeof value === 'string') {
					const date = new Date(value);
					return {
						isValid: !isNaN(date.getTime()),
						message: rule.message
					};
				}
				return { isValid: true, message: '' };

			case 'custom':
				// Custom validation logic would go here
				// For now, just return valid
				return { isValid: true, message: '' };

			default:
				return { isValid: true, message: '' };
		}
	}

	/**
	 * Get field validation configuration
	 */
	private getFieldValidationConfig(fieldName: string): FieldValidationConfig | null {
		if (this.config.cacheValidationRules) {
			return this.validationRulesCache.get(fieldName) || null;
		}

		const fieldConfig = this.fieldConfigs.find((f) => f.name === fieldName);
		return fieldConfig ? this.generateFieldValidationConfig(fieldConfig) : null;
	}

	/**
	 * Get localized message
	 */
	private getMessage(fieldName: string, ruleType: string, defaultMessage: string): string {
		const locale = this.config.currentLocale || 'en';

		// Check i18n messages first
		const i18nMessage = this.config.i18nMessages?.[locale]?.[fieldName]?.[ruleType];
		if (i18nMessage) {
			return i18nMessage;
		}

		// Check custom messages
		const customMessage = this.config.customMessages?.[fieldName]?.[ruleType];
		if (customMessage) {
			return customMessage;
		}

		return defaultMessage;
	}

	/**
	 * Add custom validation rule for a field
	 */
	addCustomRule(fieldName: string, rule: ValidationRule): void {
		const config = this.getFieldValidationConfig(fieldName);
		if (config) {
			config.rules.push(rule);
			if (this.config.cacheValidationRules) {
				this.validationRulesCache.set(fieldName, config);
			}
		}
	}

	/**
	 * Add conditional validation rule
	 */
	addConditionalRule(
		fieldName: string,
		condition: (formData: Record<string, unknown>) => boolean,
		rules: ValidationRule[]
	): void {
		const config = this.getFieldValidationConfig(fieldName);
		if (config) {
			if (!config.conditionalRules) {
				config.conditionalRules = [];
			}
			config.conditionalRules.push({ condition, rules });
			if (this.config.cacheValidationRules) {
				this.validationRulesCache.set(fieldName, config);
			}
		}
	}

	/**
	 * Update locale and refresh messages
	 */
	setLocale(locale: string): void {
		this.config.currentLocale = locale;
		// Clear cache to force regeneration with new locale
		if (this.config.cacheValidationRules) {
			this.validationRulesCache.clear();
			this.initializeValidationRules();
		}
	}

	/**
	 * Get all validation rules for a field
	 */
	getFieldRules(fieldName: string): ValidationRule[] {
		const config = this.getFieldValidationConfig(fieldName);
		return config?.rules || [];
	}

	/**
	 * Clear validation cache
	 */
	clearCache(): void {
		this.validationRulesCache.clear();
	}

	/**
	 * Update schema and reinitialize rules
	 */
	updateSchema(newSchema: ZodSchema<T>): void {
		this.config.schema = newSchema;
		this.clearCache();
		this.initializeValidationRules();
	}
}

/**
 * Factory function to create schema validator
 */
export function createSchemaValidator<T extends Record<string, unknown>>(
	config: SchemaValidationConfig<T>
): SchemaValidator<T> {
	return new SchemaValidator(config);
}

/**
 * Utility functions for common validation scenarios
 */
export const validationUtils = {
	/**
	 * Create a conditional required rule
	 */
	createConditionalRequired: (
		dependentField: string,
		dependentValue: unknown,
		message = 'This field is required'
	): ValidationRule => ({
		type: 'required',
		message,
		condition: (formData) => formData[dependentField] === dependentValue
	}),

	/**
	 * Create a custom validation rule
	 */
	createCustomRule: (
		validator: (value: unknown, formData: Record<string, unknown>) => boolean,
		message: string
	): ValidationRule => ({
		type: 'custom',
		message,
		value: validator
	}),

	/**
	 * Create password strength validation
	 */
	createPasswordStrengthRule: (
		minLength = 8,
		requireSpecialChar = true,
		requireNumber = true,
		requireUppercase = true
	): ValidationRule => ({
		type: 'custom',
		message: 'Password does not meet strength requirements',
		value: (value: unknown) => {
			if (typeof value !== 'string') return false;

			if (value.length < minLength) return false;
			if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;
			if (requireNumber && !/\d/.test(value)) return false;
			if (requireUppercase && !/[A-Z]/.test(value)) return false;

			return true;
		}
	})
};
