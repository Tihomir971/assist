import { getContext, setContext } from 'svelte';
import type { CartItem } from './types';

const STORAGE_KEY = 'cartItems';

export class ShoppingCartState {
	items = $state<CartItem[]>([]);
	isVisible = $state(false);

	constructor() {
		this.loadFromLocalStorage();
		$effect(() => this.saveToLocalStorage());
	}

	private loadFromLocalStorage() {
		if (typeof window !== 'undefined') {
			try {
				const storedItems = localStorage.getItem(STORAGE_KEY);
				if (storedItems) {
					const parsedItems = JSON.parse(storedItems);
					// Validate that parsedItems is an array
					if (Array.isArray(parsedItems)) {
						this.items = parsedItems;
					}
				}
			} catch (error) {
				console.error('Error loading cart from localStorage:', error);
				// Reset to empty array if there's an error
				this.items = [];
			}
		}
	}

	private saveToLocalStorage() {
		if (typeof window !== 'undefined') {
			try {
				// Only store the raw array data, not the reactive state
				const itemsToStore = this.items.map((item) => ({
					id: item.id,
					name: item.name,
					quantity: item.quantity,
					sku: item.sku
				}));
				localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsToStore));
			} catch (error) {
				console.error('Error saving cart to localStorage:', error);
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
