import type {
	SplitLayoutConfig,
	SplitLayoutConfigBuilder,
	PanelConfig,
	ResponsiveConfig,
	TabConfig
} from '$lib/types/split-layout-config.types';
import type { Component } from 'svelte';

export function createSplitLayoutConfig(): SplitLayoutConfigBuilder {
	const config: Partial<SplitLayoutConfig> = {
		leftPanel: {
			width: '45%',
			minWidth: '400px',
			scrollable: true
		},
		rightPanel: {
			width: '55%',
			minWidth: '500px',
			scrollable: true
		},
		responsive: {
			breakpoint: '768px',
			stackOrder: 'form-first'
		},
		gap: '1rem'
	};

	return {
		leftPanel(panelConfig: Partial<PanelConfig>) {
			config.leftPanel = { ...config.leftPanel!, ...panelConfig };
			return this;
		},

		rightPanel(panelConfig: Partial<PanelConfig>) {
			config.rightPanel = { ...config.rightPanel!, ...panelConfig };
			return this;
		},

		responsive(responsiveConfig: Partial<ResponsiveConfig>) {
			config.responsive = { ...config.responsive!, ...responsiveConfig };
			return this;
		},

		gap(gap: string) {
			config.gap = gap;
			return this;
		},

		className(className: string) {
			config.className = className;
			return this;
		},

		build(): SplitLayoutConfig {
			return config as SplitLayoutConfig;
		}
	};
}

// Helper function to create tab configurations
export function createTabConfig(
	id: string,
	label: string,
	component: Component,
	props: Record<string, unknown>,
	options?: {
		icon?: string;
		badge?: number | string;
		disabled?: boolean;
		order?: number;
		description?: string;
	}
): TabConfig {
	return {
		id,
		label,
		component,
		props,
		...options
	};
}
