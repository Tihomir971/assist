import type { Component } from 'svelte';

/**
 * Configuration for a faceted filter
 */
export interface FacetedFilter {
	column: string;
	title: string;
	options: Array<{ label: string; value: string; icon?: Component }>;
}
