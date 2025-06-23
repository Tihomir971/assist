// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: number | undefined;

	return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
		clearTimeout(timeout);
		timeout = window.setTimeout(() => func.apply(this, args), wait);
	};
}
