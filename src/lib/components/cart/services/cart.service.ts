import type { ICartStorage } from '../storage/cart-storage.interface';
import type { CartItem } from '../types';

export class CartService {
	constructor(private storage: ICartStorage<CartItem>) {}

	async addItem(item: CartItem): Promise<void> {
		const items = await this.storage.get();
		const existing = items.find((i) => i.id === item.id);
		if (existing) {
			await this.storage.update(existing.id, { quantity: existing.quantity + item.quantity });
		} else {
			await this.storage.set([...items, item]);
		}
	}

	async removeItem(id: number): Promise<void> {
		await this.storage.delete(id);
	}

	async updateItemQuantity(id: number, quantity: number): Promise<void> {
		await this.storage.update(id, { quantity });
	}

	async clearCart(): Promise<void> {
		await this.storage.set([]);
	}

	subscribe(callback: (items: CartItem[]) => void): () => void {
		return this.storage.subscribe(callback);
	}

	async getCartItems(): Promise<CartItem[]> {
		return await this.storage.get();
	}
}
