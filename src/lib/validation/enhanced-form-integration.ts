import type { ZodSchema } from 'zod/v3';
import type { SuperForm } from 'sveltekit-superforms';
import {
	EnhancedFormStateManager,
	createEnhancedFormState,
	type AutoSaveConfig
} from '$lib/stores/enhanced-form-state.svelte';
import {
	RealTimeValidator,
	createRealTimeValidator,
	type CrossFieldValidationRule,
	type AsyncValidationRule
} from '$lib/validation/real-time-validator';
import { SchemaValidator, createSchemaValidator } from '$lib/validation/schema-validator';

/**
 * Enhanced form integration layer
 * Coordinates state management, real-time validation, and schema validation
 */

export interface EnhancedFormConfig<T extends Record<string, unknown>> {
	schema: ZodSchema<T>;
	initialData: T;

	// State management options
	autoSave?: AutoSaveConfig;
	validateOnChange?: boolean;
	validateOnBlur?: boolean;
	debounceValidationMs?: number;

	// Real-time validation options
	enableRealTimeValidation?: boolean;
	crossFieldRules?: CrossFieldValidationRule<T>[];
	asyncRules?: Record<string, AsyncValidationRule>;
	validationCaching?: boolean;
	validationCacheTtlMs?: number;

	// Schema validation options
	customMessages?: Record<string, Record<string, string>>;
	i18nMessages?: Record<string, Record<string, Record<string, string>>>;
	currentLocale?: string;
	enableConditionalValidation?: boolean;

	// Event handlers
	onValidationStart?: (fieldName: string) => void;
	onValidationComplete?: (fieldName: string, isValid: boolean, errors: string[]) => void;
	onFormStateChange?: (isDirty: boolean, isValid: boolean) => void;
	onAutoSave?: (data: T) => Promise<void>;
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings?: string[];
	fieldName: string;
	timestamp: Date;
}

export interface FormValidationState {
	isValid: boolean;
	fieldErrors: Record<string, string[]>;
	globalErrors: string[];
	isValidating: boolean;
	validatingFields: string[];
}

export class EnhancedFormIntegration<T extends Record<string, unknown>> {
	private stateManager: EnhancedFormStateManager<T>;
	private realTimeValidator: RealTimeValidator<T>;
	private schemaValidator: SchemaValidator<T>;
	private config: EnhancedFormConfig<T>;
	private superForm: SuperForm<T> | null = null;

	constructor(config: EnhancedFormConfig<T>) {
		this.config = {
			validateOnChange: true,
			validateOnBlur: true,
			debounceValidationMs: 300,
			enableRealTimeValidation: true,
			validationCaching: true,
			validationCacheTtlMs: 5 * 60 * 1000,
			currentLocale: 'en',
			enableConditionalValidation: true,
			...config
		};

		// Initialize state manager
		this.stateManager = createEnhancedFormState({
			schema: this.config.schema,
			initialData: this.config.initialData,
			autoSave: this.config.autoSave,
			validateOnChange: this.config.validateOnChange,
			validateOnBlur: this.config.validateOnBlur,
			debounceValidationMs: this.config.debounceValidationMs
		});

		// Initialize real-time validator
		this.realTimeValidator = createRealTimeValidator({
			schema: this.config.schema,
			debounceMs: this.config.debounceValidationMs,
			enableCaching: this.config.validationCaching,
			cacheTtlMs: this.config.validationCacheTtlMs,
			crossFieldRules: this.config.crossFieldRules,
			asyncRules: this.config.asyncRules,
			onValidationStart: this.config.onValidationStart,
			onValidationComplete: (fieldName, result) => {
				this.config.onValidationComplete?.(fieldName, result.isValid, result.errors);
			}
		});

		// Initialize schema validator
		this.schemaValidator = createSchemaValidator({
			schema: this.config.schema,
			customMessages: this.config.customMessages,
			i18nMessages: this.config.i18nMessages,
			currentLocale: this.config.currentLocale,
			enableConditionalValidation: this.config.enableConditionalValidation
		});
	}

	/**
	 * Connect with superforms instance
	 */
	connectSuperForm(superForm: SuperForm<T>): void {
		this.superForm = superForm;
		this.stateManager.connectSuperForm(superForm);
	}

	/**
	 * Update field value with integrated validation
	 */
	async updateField(
		fieldName: string,
		value: unknown,
		options: {
			validate?: boolean;
			markDirty?: boolean;
			touch?: boolean;
		} = {}
	): Promise<ValidationResult | null> {
		const { validate = this.config.validateOnChange, markDirty = true, touch = true } = options;

		// Update state
		this.stateManager.updateField(fieldName, value, {
			markDirty,
			validate: false, // We'll handle validation separately
			touch
		});

		// Perform validation if enabled
		if (validate && this.config.enableRealTimeValidation) {
			const formData = this.stateManager.data;
			const validationResult = await this.realTimeValidator.validateField(
				fieldName,
				value,
				formData
			);

			// Update field validation state in state manager
			this.updateFieldValidationState(fieldName, validationResult);

			// Trigger cross-field validation if needed
			if (this.config.crossFieldRules && this.config.crossFieldRules.length > 0) {
				await this.validateCrossFields(fieldName);
			}

			return validationResult;
		}

		return null;
	}

	/**
	 * Handle field blur events
	 */
	async onFieldBlur(fieldName: string): Promise<ValidationResult | null> {
		this.stateManager.onFieldBlur(fieldName);

		if (this.config.validateOnBlur && this.config.enableRealTimeValidation) {
			const field = this.stateManager.fields[fieldName];
			if (field) {
				return await this.updateField(fieldName, field.value, {
					validate: true,
					markDirty: false,
					touch: false
				});
			}
		}

		return null;
	}

	/**
	 * Validate entire form
	 */
	async validateForm(): Promise<FormValidationState> {
		const formData = this.stateManager.data;

		// Use schema validator for comprehensive validation
		const schemaResult = await this.schemaValidator.validateForm(formData);

		// Also run real-time validation for all fields
		const fieldNames = Object.keys(formData);
		const realTimeResults = await this.realTimeValidator.validateFields(
			fieldNames.map((name) => ({ name, value: formData[name] })),
			formData,
			{ immediate: true }
		);

		// Merge results
		const mergedFieldErrors: Record<string, string[]> = { ...schemaResult.fieldErrors };

		Object.entries(realTimeResults).forEach(([fieldName, result]) => {
			if (!result.isValid) {
				if (!mergedFieldErrors[fieldName]) {
					mergedFieldErrors[fieldName] = [];
				}
				mergedFieldErrors[fieldName].push(...result.errors);
			}
		});

		// Update state manager validation state
		this.stateManager.state.validationErrors = mergedFieldErrors;
		this.stateManager.state.globalErrors = schemaResult.globalErrors;
		this.stateManager.state.isValid =
			schemaResult.isValid && Object.values(realTimeResults).every((r) => r.isValid);

		return {
			isValid: this.stateManager.state.isValid,
			fieldErrors: mergedFieldErrors,
			globalErrors: schemaResult.globalErrors,
			isValidating: false,
			validatingFields: []
		};
	}

	/**
	 * Validate cross-field dependencies
	 */
	private async validateCrossFields(changedField: string): Promise<void> {
		if (!this.config.crossFieldRules) return;

		const formData = this.stateManager.data;
		const crossFieldResults = await this.realTimeValidator.validateCrossFields(
			changedField,
			formData
		);

		// Update validation state for affected fields
		Object.entries(crossFieldResults).forEach(([, result]) => {
			// Cross-field validation results might affect multiple fields
			// For now, we'll add them to global errors
			if (!result.isValid) {
				this.stateManager.state.globalErrors.push(...result.errors);
			}
		});
	}

	/**
	 * Update field validation state in state manager
	 */
	private updateFieldValidationState(fieldName: string, result: ValidationResult): void {
		const field = this.stateManager.state.fields[fieldName];
		if (field) {
			field.isValid = result.isValid;
			field.errors = result.errors;
			field.lastValidated = result.timestamp;
			field.isValidating = false;
		}

		// Update form-level validation errors
		if (result.isValid) {
			delete this.stateManager.state.validationErrors[fieldName];
		} else {
			this.stateManager.state.validationErrors[fieldName] = result.errors;
		}

		// Update overall form validity
		const hasInvalidFields = Object.values(this.stateManager.state.fields).some((f) => !f.isValid);
		this.stateManager.state.isValid =
			!hasInvalidFields && this.stateManager.state.globalErrors.length === 0;
	}

	/**
	 * Get current form state
	 */
	get formState() {
		return this.stateManager.state;
	}

	/**
	 * Get current validation state
	 */
	get validationState(): FormValidationState {
		return {
			isValid: this.stateManager.isValid,
			fieldErrors: this.stateManager.validationErrors,
			globalErrors: this.stateManager.state.globalErrors,
			isValidating: this.realTimeValidator.getValidatingFields().length > 0,
			validatingFields: this.realTimeValidator.getValidatingFields()
		};
	}

	/**
	 * Check if field is currently being validated
	 */
	isFieldValidating(fieldName: string): boolean {
		return this.realTimeValidator.isValidating(fieldName);
	}

	/**
	 * Get field validation errors
	 */
	getFieldErrors(fieldName: string): string[] {
		return this.stateManager.validationErrors[fieldName] || [];
	}

	/**
	 * Check if field is dirty
	 */
	isFieldDirty(fieldName: string): boolean {
		return this.stateManager.fields[fieldName]?.isDirty || false;
	}

	/**
	 * Check if field has been touched
	 */
	isFieldTouched(fieldName: string): boolean {
		return this.stateManager.fields[fieldName]?.hasBeenTouched || false;
	}

	/**
	 * Reset form to initial state
	 */
	reset(newData?: T): void {
		this.stateManager.reset(newData);
		this.realTimeValidator.cancelAllValidations();
		this.realTimeValidator.clearCache();
	}

	/**
	 * Mark form as saved
	 */
	markAsSaved(): void {
		this.stateManager.markAsSaved();
	}

	/**
	 * Get dirty fields
	 */
	getDirtyFields(): Record<string, unknown> {
		return this.stateManager.getDirtyFields();
	}

	/**
	 * Update configuration
	 */
	updateConfig(updates: Partial<EnhancedFormConfig<T>>): void {
		this.config = { ...this.config, ...updates };

		// Update validators if needed
		if (updates.schema) {
			this.schemaValidator.updateSchema(updates.schema);
			this.realTimeValidator.updateConfig({ schema: updates.schema });
		}

		if (updates.currentLocale) {
			this.schemaValidator.setLocale(updates.currentLocale);
		}
	}

	/**
	 * Add custom validation rule
	 */
	addCustomValidationRule(fieldName: string, rule: AsyncValidationRule): void {
		if (!this.config.asyncRules) {
			this.config.asyncRules = {};
		}
		this.config.asyncRules[fieldName] = rule;
		this.realTimeValidator.updateConfig({ asyncRules: this.config.asyncRules });
	}

	/**
	 * Add cross-field validation rule
	 */
	addCrossFieldRule(rule: CrossFieldValidationRule<T>): void {
		if (!this.config.crossFieldRules) {
			this.config.crossFieldRules = [];
		}
		this.config.crossFieldRules.push(rule);
		this.realTimeValidator.updateConfig({ crossFieldRules: this.config.crossFieldRules });
	}

	/**
	 * Cleanup resources
	 */
	destroy(): void {
		this.stateManager.destroy();
		this.realTimeValidator.destroy();
		this.schemaValidator.clearCache();
	}
}

/**
 * Factory function to create enhanced form integration
 */
export function createEnhancedFormIntegration<T extends Record<string, unknown>>(
	config: EnhancedFormConfig<T>
): EnhancedFormIntegration<T> {
	return new EnhancedFormIntegration(config);
}

/**
 * Utility function to create auto-save configuration
 */
export function createAutoSaveConfig(
	onAutoSave: (data: unknown) => Promise<void>,
	options: {
		debounceMs?: number;
		excludeFields?: string[];
	} = {}
): AutoSaveConfig {
	return {
		enabled: true,
		debounceMs: options.debounceMs || 2000,
		onAutoSave,
		excludeFields: options.excludeFields
	};
}
