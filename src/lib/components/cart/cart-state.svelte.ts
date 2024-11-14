import { getContext, setContext } from 'svelte';
import type { CartItem } from './types';

const STORAGE_KEY = 'cartItems';

export class ShoppingCartState {
	items = $state<CartItem[]>([]);
	isVisible = $state(false);

	constructor() {
		this.loadFromLocalStorage();
		$effect(() => {
			// Ensure we're working with plain objects, not reactive state
			const plainItems = this.items.map((item) => ({
				id: item.id,
				name: item.name,
				quantity: item.quantity,
				sku: item.sku
			}));
			this.saveToLocalStorage(plainItems);
		});
	}

	private loadFromLocalStorage() {
		if (typeof window !== 'undefined') {
			try {
				const storedItems = localStorage.getItem(STORAGE_KEY);
				if (storedItems) {
					const parsedItems = JSON.parse(storedItems);
					// Validate that parsedItems is an array and has the expected structure
					if (
						Array.isArray(parsedItems) &&
						parsedItems.every(
							(item) =>
								typeof item === 'object' &&
								'id' in item &&
								'name' in item &&
								'quantity' in item &&
								'sku' in item
						)
					) {
						this.items = parsedItems;
					} else {
						// If the data structure is invalid, reset to empty array
						this.items = [];
						localStorage.removeItem(STORAGE_KEY);
					}
				}
			} catch (error) {
				console.error('Error loading cart from localStorage:', error);
				// Reset to empty array if there's an error
				this.items = [];
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	}

	private saveToLocalStorage(itemsToStore: CartItem[]) {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsToStore));
			} catch (error) {
				console.error('Error saving cart to localStorage:', error);
				// If there's an error saving, clear localStorage to prevent corrupt state
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	}

	add(id: number, name: string, quantity: number, sku: string) {
		const existingItem = this.items.find((item) => item.id === id);
		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			this.items = [...this.items, { id, name, quantity, sku }];
		}
	}

	remove(id: number) {
		this.items = this.items.filter((item) => item.id !== id);
	}

	updateQuantity(id: number, newQuantity: number) {
		const item = this.items.find((item) => item.id === id);
		if (item) {
			item.quantity = newQuantity;
			if (item.quantity <= 0) {
				this.remove(id);
			}
		}
	}

	clearItems() {
		this.items = [];
		if (typeof window !== 'undefined') {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	toggleVisibility() {
		this.isVisible = !this.isVisible;
	}
}

const CART_KEY = Symbol('CARTITEMS');

export function setShoppingCartState() {
	return setContext(CART_KEY, new ShoppingCartState());
}

export function getShoppingCartState() {
	return getContext<ShoppingCartState>(CART_KEY);
}
