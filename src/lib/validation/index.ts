/**
 * Enhanced Form Handling - Phase 2B
 *
 * This module provides advanced form state management and validation systems
 * with real-time validation, auto-save capabilities, and schema integration.
 */

// Enhanced Form State Management
export {
	EnhancedFormStateManager,
	createEnhancedFormState,
	type FieldState,
	type FormState,
	type AutoSaveConfig,
	type EnhancedFormStateConfig
} from '$lib/stores/enhanced-form-state.svelte';

// Real-time Validation Engine
export {
	RealTimeValidator,
	createRealTimeValidator,
	createCrossFieldRules,
	type ValidationResult,
	type CrossFieldValidationRule,
	type AsyncValidationRule,
	type ValidationCache,
	type RealTimeValidatorConfig
} from '$lib/validation/real-time-validator';

// Schema-based Validation Integration
export {
	SchemaValidator,
	createSchemaValidator,
	validationUtils,
	type ValidationRule,
	type FieldValidationConfig,
	type SchemaValidationConfig,
	type ValidationContext
} from '$lib/validation/schema-validator';

// Enhanced Form Integration
export {
	EnhancedFormIntegration,
	createEnhancedFormIntegration,
	createAutoSaveConfig,
	type EnhancedFormConfig,
	type FormValidationState
} from '$lib/validation/enhanced-form-integration';

// Re-export validation result type for consistency
export type { ValidationResult as IntegrationValidationResult } from '$lib/validation/enhanced-form-integration';
