import { LocalStorage } from '$lib/storage.svelte';
import { getContext, setContext } from 'svelte';
import type { CartItem } from './types';

const CART_KEY = Symbol('CART');

export function setCartContext() {
	return setContext(CART_KEY, new LocalStorage<CartItem[]>('cartItems', []));
}

export function getCartContext() {
	return getContext(CART_KEY) as LocalStorage<CartItem[]>;
}
