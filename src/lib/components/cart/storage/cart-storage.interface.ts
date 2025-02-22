export interface ICartStorage<T> {
	get(): Promise<T[]>;
	set(items: T[]): Promise<void>;
	update(id: number, updates: Partial<T>): Promise<void>;
	delete(id: number): Promise<void>;
	subscribe(callback: (items: T[]) => void): () => void;
}
