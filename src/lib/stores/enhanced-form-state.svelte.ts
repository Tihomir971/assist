import { z, type ZodSchema } from 'zod';
import type { SuperForm } from 'sveltekit-superforms';

/**
 * Enhanced form state management with Svelte 5 runes
 * Provides reactive state, dirty tracking, auto-save, and validation coordination
 */

export interface FieldState {
	value: unknown;
	isDirty: boolean;
	isValid: boolean;
	errors: string[];
	isValidating: boolean;
	lastValidated: Date | null;
	hasBeenTouched: boolean;
}

export interface FormState<T = Record<string, unknown>> {
	data: T;
	fields: Record<string, FieldState>;
	isDirty: boolean;
	isValid: boolean;
	isSubmitting: boolean;
	isAutoSaving: boolean;
	lastSaved: Date | null;
	lastAutoSave: Date | null;
	hasUnsavedChanges: boolean;
	validationErrors: Record<string, string[]>;
	globalErrors: string[];
}

export interface AutoSaveConfig {
	enabled: boolean;
	debounceMs: number;
	onAutoSave?: (data: unknown) => Promise<void>;
	excludeFields?: string[];
}

export interface EnhancedFormStateConfig<T> {
	schema: ZodSchema<T>;
	initialData: T;
	autoSave?: AutoSaveConfig;
	validateOnChange?: boolean;
	validateOnBlur?: boolean;
	debounceValidationMs?: number;
}

export class EnhancedFormStateManager<T extends Record<string, unknown>> {
	// Reactive state using Svelte 5 runes
	private _state = $state<FormState<T>>({
		data: {} as T,
		fields: {},
		isDirty: false,
		isValid: true,
		isSubmitting: false,
		isAutoSaving: false,
		lastSaved: null,
		lastAutoSave: null,
		hasUnsavedChanges: false,
		validationErrors: {},
		globalErrors: []
	});

	private _config: EnhancedFormStateConfig<T>;
	private _autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
	private _validationTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
	private _superForm: SuperForm<T> | null = null;
	private _unsubscribeSuperFormSubmitting: (() => void) | null = null;
	private _unsubscribeSuperFormErrors: (() => void) | null = null;
	private _unsubscribeSuperFormAllErrors: (() => void) | null = null;
	private _unsubscribeSuperFormTainted: (() => void) | null = null;

	constructor(config: EnhancedFormStateConfig<T>) {
		this._config = config;
		this.initializeState(config.initialData);
	}

	// Reactive getters - return state directly for reactivity
	get state() {
		return this._state;
	}

	get isDirty() {
		return this._state.isDirty;
	}

	get isValid() {
		return this._state.isValid;
	}

	get hasUnsavedChanges() {
		return this._state.hasUnsavedChanges;
	}

	get data() {
		return this._state.data;
	}

	get fields() {
		return this._state.fields;
	}

	get validationErrors() {
		return this._state.validationErrors;
	}

	get isSubmitting() {
		return this._state.isSubmitting;
	}

	get isAutoSaving() {
		return this._state.isAutoSaving;
	}

	/**
	 * Initialize form state with data
	 */
	private initializeState(data: T): void {
		this._state.data = { ...data };
		this._state.fields = {};

		// Initialize field states
		Object.keys(data).forEach((fieldName) => {
			this._state.fields[fieldName] = {
				value: data[fieldName],
				isDirty: false,
				isValid: true,
				errors: [],
				isValidating: false,
				lastValidated: null,
				hasBeenTouched: false
			};
		});

		this._state.isDirty = false;
		this._state.isValid = true;
		this._state.hasUnsavedChanges = false;
		this._state.validationErrors = {};
		this._state.globalErrors = [];
	}

	/**
	 * Connect with superforms instance for enhanced integration
	 */
	connectSuperForm(superForm: SuperForm<T>): void {
		this._superForm = superForm;

		if (this._superForm) {
			// Subscribe to submitting state
			this._unsubscribeSuperFormSubmitting = this._superForm.submitting.subscribe((value) => {
				this._state.isSubmitting = value;
			});

			// Subscribe to errors state
			this._unsubscribeSuperFormErrors = this._superForm.errors.subscribe((errors) => {
				const convertedErrors: Record<string, string[]> = {};

				if (errors) {
					Object.entries(errors).forEach(([field, fieldErrors]) => {
						if (Array.isArray(fieldErrors)) {
							convertedErrors[field] = fieldErrors;
						} else if (typeof fieldErrors === 'string') {
							convertedErrors[field] = [fieldErrors];
						}
					});
				}
				this._state.validationErrors = convertedErrors;

				// Update isValid based on whether there are any errors
				const hasErrors =
					Object.keys(convertedErrors).length > 0 || this._state.globalErrors.length > 0;
				this._state.isValid = !hasErrors;
			});

			// Subscribe to allErrors for comprehensive error tracking
			this._unsubscribeSuperFormAllErrors = this._superForm.allErrors.subscribe((allErrors) => {
				// Update isValid based on allErrors as well
				this._state.isValid = allErrors.length === 0;
			});
			// Subscribe to tainted state for dirty tracking
			this._unsubscribeSuperFormTainted = this._superForm.tainted.subscribe((tainted) => {
				// Update isDirty based on whether any fields are tainted
				const hasTaintedFields = tainted && Object.values(tainted).some((value) => value === true);
				const wasDirty = this._state.isDirty;
				this._state.isDirty = hasTaintedFields || false;

				// Only update hasUnsavedChanges if form becomes dirty (new changes)
				// Don't clear it when form becomes clean - that should only happen on save
				if (!wasDirty && this._state.isDirty) {
					this._state.hasUnsavedChanges = true;
				}
			});
		}
	}

	/**
	 * Update field value with dirty tracking and validation
	 */
	updateField(
		fieldName: string,
		value: unknown,
		options: {
			markDirty?: boolean;
			validate?: boolean;
			touch?: boolean;
		} = {}
	): void {
		const { markDirty = true, validate = this._config.validateOnChange, touch = true } = options;

		// Update field state
		if (!this._state.fields[fieldName]) {
			this._state.fields[fieldName] = {
				value,
				isDirty: false,
				isValid: true,
				errors: [],
				isValidating: false,
				lastValidated: null,
				hasBeenTouched: false
			};
		}

		const field = this._state.fields[fieldName];
		const previousValue = field.value;

		field.value = value;
		if (touch) field.hasBeenTouched = true;

		// Update form data
		this._state.data = { ...this._state.data, [fieldName]: value };

		// Mark as dirty if value changed
		if (markDirty && previousValue !== value) {
			field.isDirty = true;
			this.updateFormDirtyState();
		}

		// Trigger validation if enabled
		if (validate) {
			this.validateField(fieldName);
		}

		// Trigger auto-save if enabled and field is dirty
		if (field.isDirty && this._config.autoSave?.enabled) {
			this.scheduleAutoSave();
		}
	}

	/**
	 * Validate a specific field with debouncing
	 */
	validateField(fieldName: string): void {
		// Clear existing timeout for this field
		const existingTimeout = this._validationTimeouts.get(fieldName);
		if (existingTimeout) {
			clearTimeout(existingTimeout);
		}

		// Set validation timeout
		const timeout = setTimeout(() => {
			this.performFieldValidation(fieldName);
		}, this._config.debounceValidationMs || 300);

		this._validationTimeouts.set(fieldName, timeout);
	}

	/**
	 * Perform immediate field validation
	 */
	private async performFieldValidation(fieldName: string): Promise<void> {
		const field = this._state.fields[fieldName];
		if (!field) return;

		field.isValidating = true;
		field.errors = [];

		try {
			// Extract field schema from main schema
			const fieldSchema = this.extractFieldSchema(fieldName);
			if (fieldSchema) {
				await fieldSchema.parseAsync(field.value);
				field.isValid = true;
				field.errors = [];
			}
		} catch (error) {
			field.isValid = false;
			if (error instanceof z.ZodError) {
				field.errors = error.errors.map((e) => e.message);
			} else {
				field.errors = ['Validation error'];
			}
		} finally {
			field.isValidating = false;
			field.lastValidated = new Date();
			this.updateFormValidState();
		}
	}

	/**
	 * Validate entire form
	 */
	async validateForm(): Promise<boolean> {
		this._state.globalErrors = [];

		try {
			await this._config.schema.parseAsync(this._state.data);

			// Mark all fields as valid
			Object.values(this._state.fields).forEach((field) => {
				field.isValid = true;
				field.errors = [];
			});

			this._state.isValid = true;
			this._state.validationErrors = {};
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				// Update field-level errors
				error.errors.forEach((err) => {
					const fieldName = err.path[0] as string;
					if (fieldName && this._state.fields[fieldName]) {
						this._state.fields[fieldName].isValid = false;
						this._state.fields[fieldName].errors = [err.message];
					} else {
						this._state.globalErrors.push(err.message);
					}
				});

				// Update validation errors for superforms compatibility
				this._state.validationErrors = error.errors.reduce(
					(acc, err) => {
						const fieldName = err.path[0] as string;
						if (fieldName) {
							acc[fieldName] = acc[fieldName] || [];
							acc[fieldName].push(err.message);
						}
						return acc;
					},
					{} as Record<string, string[]>
				);
			}

			this._state.isValid = false;
			return false;
		}
	}

	/**
	 * Handle field blur events
	 */
	onFieldBlur(fieldName: string): void {
		const field = this._state.fields[fieldName];
		if (!field) return;

		field.hasBeenTouched = true;

		if (this._config.validateOnBlur) {
			this.validateField(fieldName);
		}
	}

	/**
	 * Schedule auto-save with debouncing
	 */
	private scheduleAutoSave(): void {
		if (!this._config.autoSave?.enabled || !this._config.autoSave.onAutoSave) return;

		// Clear existing timeout
		if (this._autoSaveTimeout) {
			clearTimeout(this._autoSaveTimeout);
		}

		// Schedule new auto-save
		this._autoSaveTimeout = setTimeout(() => {
			this.performAutoSave();
		}, this._config.autoSave.debounceMs || 2000);
	}

	/**
	 * Perform auto-save operation
	 */
	private async performAutoSave(): Promise<void> {
		if (!this._config.autoSave?.onAutoSave || this._state.isAutoSaving) return;

		this._state.isAutoSaving = true;

		try {
			// Filter out excluded fields
			const dataToSave = { ...this._state.data };
			this._config.autoSave.excludeFields?.forEach((field) => {
				delete dataToSave[field];
			});

			await this._config.autoSave.onAutoSave(dataToSave);
			this._state.lastAutoSave = new Date();
			this._state.hasUnsavedChanges = false;
		} catch (error) {
			console.error('Auto-save failed:', error);
			// Could emit an event or show a toast here
		} finally {
			this._state.isAutoSaving = false;
		}
	}

	/**
	 * Mark form as saved (typically called after successful submission)
	 */
	markAsSaved(): void {
		this._state.lastSaved = new Date();
		this._state.hasUnsavedChanges = false;
		this._state.isDirty = false;

		// Reset field dirty states
		Object.values(this._state.fields).forEach((field) => {
			field.isDirty = false;
		});
	}

	/**
	 * Reset form to initial state
	 */
	reset(newData?: T): void {
		const dataToUse = newData || this._config.initialData;
		this.initializeState(dataToUse);

		// Clear timeouts
		if (this._autoSaveTimeout) {
			clearTimeout(this._autoSaveTimeout);
			this._autoSaveTimeout = null;
		}

		this._validationTimeouts.forEach((timeout) => clearTimeout(timeout));
		this._validationTimeouts.clear();
	}

	/**
	 * Get dirty fields
	 */
	getDirtyFields(): Record<string, unknown> {
		const dirtyFields: Record<string, unknown> = {};

		Object.entries(this._state.fields).forEach(([fieldName, field]) => {
			if (field.isDirty) {
				dirtyFields[fieldName] = field.value;
			}
		});

		return dirtyFields;
	}

	/**
	 * Update form dirty state based on field states
	 */
	private updateFormDirtyState(): void {
		const hasDirtyFields = Object.values(this._state.fields).some((field) => field.isDirty);
		this._state.isDirty = hasDirtyFields;
		this._state.hasUnsavedChanges = hasDirtyFields;
	}

	/**
	 * Update form validation state based on field states
	 */
	private updateFormValidState(): void {
		const hasInvalidFields = Object.values(this._state.fields).some((field) => !field.isValid);
		this._state.isValid = !hasInvalidFields && this._state.globalErrors.length === 0;
	}

	/**
	 * Extract field schema from main schema (simplified implementation)
	 */
	private extractFieldSchema(fieldName: string): ZodSchema | null {
		try {
			// This is a simplified approach - in a real implementation,
			// you might want to use a more sophisticated schema introspection
			if ('shape' in this._config.schema) {
				const shape = (this._config.schema as unknown as z.ZodObject<z.ZodRawShape>).shape;
				return shape?.[fieldName] || null;
			}
			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Cleanup resources
	 */
	destroy(): void {
		if (this._autoSaveTimeout) {
			clearTimeout(this._autoSaveTimeout);
		}

		this._validationTimeouts.forEach((timeout) => clearTimeout(timeout));
		this._validationTimeouts.clear();

		if (this._unsubscribeSuperFormSubmitting) {
			this._unsubscribeSuperFormSubmitting();
			this._unsubscribeSuperFormSubmitting = null;
		}
		if (this._unsubscribeSuperFormErrors) {
			this._unsubscribeSuperFormErrors();
			this._unsubscribeSuperFormErrors = null;
		}
		if (this._unsubscribeSuperFormAllErrors) {
			this._unsubscribeSuperFormAllErrors();
			this._unsubscribeSuperFormAllErrors = null;
		}
		if (this._unsubscribeSuperFormTainted) {
			this._unsubscribeSuperFormTainted();
			this._unsubscribeSuperFormTainted = null;
		}
	}
}

/**
 * Factory function to create enhanced form state manager
 */
export function createEnhancedFormState<T extends Record<string, unknown>>(
	config: EnhancedFormStateConfig<T>
): EnhancedFormStateManager<T> {
	return new EnhancedFormStateManager(config);
}
