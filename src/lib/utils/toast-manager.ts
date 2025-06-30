import { toast } from 'svelte-sonner';

export interface ToastOptions {
	dedupeKey?: string;
	duration?: number;
	context?: ErrorContext;
	showRetry?: boolean;
	onRetry?: () => void;
}

export interface StructuredErrorMessage {
	title: string;
	details: string;
	constraint?: string;
	suggestion?: string;
}

export interface ErrorContext {
	type: 'validation' | 'server' | 'network' | 'permission' | 'configuration';
	operation: 'create' | 'update' | 'delete' | 'read';
	entity: string;
	field?: string;
	code?: string;
}

export class ToastManager {
	private static instance: ToastManager;
	private activeToasts = new Set<string>();
	private toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

	static getInstance(): ToastManager {
		if (!ToastManager.instance) {
			ToastManager.instance = new ToastManager();
		}
		return ToastManager.instance;
	}

	showToast(
		type: 'success' | 'error' | 'info' | 'warning',
		message: string,
		options: ToastOptions = {}
	) {
		const key = options.dedupeKey || `${type}-${message.slice(0, 50)}`;

		// Prevent duplicate toasts
		if (this.activeToasts.has(key)) {
			return;
		}

		this.activeToasts.add(key);

		// Clear any existing timeout for this key
		const existingTimeout = this.toastTimeouts.get(key);
		if (existingTimeout) {
			clearTimeout(existingTimeout);
		}

		// Show the toast
		const toastId = toast[type](message, {
			duration: options.duration || 4000,
			action: options.showRetry
				? {
						label: 'Retry',
						onClick: options.onRetry || (() => {})
					}
				: undefined
		});

		// Set cleanup timeout
		const timeout = setTimeout(() => {
			this.activeToasts.delete(key);
			this.toastTimeouts.delete(key);
		}, options.duration || 4000);

		this.toastTimeouts.set(key, timeout);

		return toastId;
	}

	showSuccess(message: string, options: Omit<ToastOptions, 'context'> = {}) {
		return this.showToast('success', message, options);
	}

	showError(message: string, options: Omit<ToastOptions, 'context'> = {}) {
		return this.showToast('error', message, options);
	}

	showInfo(message: string, options: Omit<ToastOptions, 'context'> = {}) {
		return this.showToast('info', message, options);
	}

	showWarning(message: string, options: Omit<ToastOptions, 'context'> = {}) {
		return this.showToast('warning', message, options);
	}

	showErrorWithContext(
		message: string,
		context: ErrorContext,
		options: Omit<ToastOptions, 'context'> = {}
	) {
		const contextualMessage = this.buildContextualMessage(message, context);
		const dedupeKey = options.dedupeKey || this.generateContextualKey(context, message);

		return this.showToast('error', contextualMessage, {
			...options,
			dedupeKey,
			context
		});
	}

	showStructuredError(
		titleOrStructured: string | StructuredErrorMessage,
		details?: string,
		options: Omit<ToastOptions, 'context'> = {}
	) {
		let title: string;
		let description: string;
		let dedupeKey: string;

		if (typeof titleOrStructured === 'string') {
			title = titleOrStructured;
			description = details || '';
			dedupeKey =
				options.dedupeKey || `structured-error-${title.slice(0, 20)}-${description.slice(0, 20)}`;
		} else {
			const structured = titleOrStructured;
			title = structured.title;
			description = this.buildStructuredDescription(structured);
			dedupeKey =
				options.dedupeKey ||
				`structured-error-${title.slice(0, 20)}-${structured.constraint || 'unknown'}`;
		}

		// Prevent duplicate toasts
		if (this.activeToasts.has(dedupeKey)) {
			return;
		}

		this.activeToasts.add(dedupeKey);

		// Clear any existing timeout for this key
		const existingTimeout = this.toastTimeouts.get(dedupeKey);
		if (existingTimeout) {
			clearTimeout(existingTimeout);
		}

		// Show structured error toast with title and description
		const toastId = toast.error(title, {
			description: description,
			duration: options.duration || 6000, // Longer duration for detailed errors
			action: options.showRetry
				? {
						label: 'Retry',
						onClick: options.onRetry || (() => {})
					}
				: undefined
		});

		// Set cleanup timeout
		const timeout = setTimeout(() => {
			this.activeToasts.delete(dedupeKey);
			this.toastTimeouts.delete(dedupeKey);
		}, options.duration || 6000);

		this.toastTimeouts.set(dedupeKey, timeout);

		return toastId;
	}

	private buildStructuredDescription(structured: StructuredErrorMessage): string {
		let description = structured.details;

		if (structured.constraint) {
			description += `\n\nConstraint: ${structured.constraint}`;
		}

		if (structured.suggestion) {
			description += `\n\n💡 ${structured.suggestion}`;
		}

		return description;
	}

	private buildContextualMessage(message: string, context: ErrorContext): string {
		const { operation, entity, type } = context;

		switch (type) {
			case 'validation':
				return `Validation error while ${this.getOperationText(operation)} ${entity}: ${message}`;
			case 'permission':
				return `You don't have permission to ${operation} ${entity}`;
			case 'network':
				return `Network error while ${this.getOperationText(operation)} ${entity}. Please check your connection.`;
			case 'server':
				return `Server error while ${this.getOperationText(operation)} ${entity}: ${message}`;
			default:
				return message;
		}
	}

	private getOperationText(operation: string): string {
		switch (operation) {
			case 'create':
				return 'creating';
			case 'update':
				return 'updating';
			case 'delete':
				return 'deleting';
			case 'read':
				return 'loading';
			default:
				return 'processing';
		}
	}

	private generateContextualKey(context: ErrorContext, message: string): string {
		return `${context.entity}-${context.operation}-${context.type}-${message.slice(0, 20)}`;
	}

	clearAll() {
		this.activeToasts.clear();
		this.toastTimeouts.forEach((timeout) => clearTimeout(timeout));
		this.toastTimeouts.clear();
	}

	destroy() {
		this.clearAll();
	}
}

// Export singleton instance for convenience
export const toastManager = ToastManager.getInstance();
