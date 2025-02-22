import { getContext, setContext } from 'svelte';
import type { CartItem } from './types';
import { LocalCartStorage } from './storage/local-cart-storage';
import { LocalStorage } from '$lib/storage.svelte';
import { CartService } from './services/cart.service';

const CART_KEY = Symbol('CART');

export function setCartContext() {
	const localStorage = new LocalStorage<CartItem[]>('cartItems', []);
	const storage = new LocalCartStorage(localStorage);
	const cartService = new CartService(storage);
	return setContext(CART_KEY, cartService);
}

export function getCartContext() {
	return getContext(CART_KEY) as CartService;
}
