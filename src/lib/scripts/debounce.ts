// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
	let timeout: number | undefined;

	const debouncedFunction = function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
		clearTimeout(timeout);
		// Reduce wait time for better UX and less setTimeout violations
		const optimizedWait = Math.min(wait, 300); // Cap at 300ms
		timeout = window.setTimeout(() => func.apply(this, args), optimizedWait);
	};

	// Add cancel method to clear pending timeout
	debouncedFunction.cancel = () => {
		clearTimeout(timeout);
		timeout = undefined;
	};

	return debouncedFunction;
}
