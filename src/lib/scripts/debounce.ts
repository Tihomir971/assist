// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
	let timeout: ReturnType<typeof setTimeout> | undefined;

	const debouncedFunction = function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};

	// Add cancel method to clear pending timeout
	debouncedFunction.cancel = () => {
		clearTimeout(timeout);
		timeout = undefined;
	};

	return debouncedFunction;
}
