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
			const storedItems = localStorage.getItem(STORAGE_KEY);
			if (storedItems) {
				this.items = JSON.parse(storedItems);
			}
		}
	}

	private saveToLocalStorage() {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
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
