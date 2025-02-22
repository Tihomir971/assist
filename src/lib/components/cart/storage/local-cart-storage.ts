import { LocalStorage } from '$lib/storage.svelte';
import type { ICartStorage } from './cart-storage.interface';
import type { CartItem } from '../types';

export class LocalCartStorage implements ICartStorage<CartItem> {
	constructor(private store: LocalStorage<CartItem[]>) {}

	async get(): Promise<CartItem[]> {
		return this.store.current;
	}

	async set(items: CartItem[]): Promise<void> {
		this.store.current = items;
	}

	async update(id: number, updates: Partial<CartItem>): Promise<void> {
		const items = this.store.current;
		const index = items.findIndex((item) => item.id === id);
		if (index !== -1) {
			items[index] = { ...items[index], ...updates };
			this.store.current = items;
		}
	}

	async delete(id: number): Promise<void> {
		let items = this.store.current;
		items = items.filter((item) => item.id !== id);
		this.store.current = items;
	}

	subscribe(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		callback: (items: CartItem[]) => void
	): () => void {
		// This is a simplified implementation. A more robust solution would
		// listen to changes in the LocalStorage and trigger the callback.
		// For now, we just return an empty unsubscribe function.
		return () => {};
	}
}
