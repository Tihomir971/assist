import type { Component, Snippet } from 'svelte';

// Main split layout configuration
export interface SplitLayoutConfig {
	leftPanel: PanelConfig;
	rightPanel: PanelConfig;
	responsive: ResponsiveConfig;
	gap: string;
	className?: string;
}

// Panel configuration
export interface PanelConfig {
	title?: string;
	width: string;
	minWidth: string;
	maxWidth?: string;
	className?: string;
	scrollable?: boolean;
}

// Responsive behavior configuration
export interface ResponsiveConfig {
	breakpoint: string;
	stackOrder: 'form-first' | 'tabs-first';
	mobileGap?: string;
}

// Tab configuration for related tables
export interface TabConfig {
	id: string;
	label: string;
	icon?: string;
	badge?: number | string;
	disabled?: boolean;
	order?: number;
	description?: string;
	component: Component;
	props: Record<string, unknown>;
}

// Enhanced related table config with tab metadata
export interface RelatedTableTabConfig {
	tabId: string;
	tabLabel: string;
	tabIcon?: string;
	tabOrder?: number;
	tabBadgeKey?: string;
	tabDescription?: string;
	tabDisabled?: boolean;
}

// Builder interface for split layout configuration
export interface SplitLayoutConfigBuilder {
	leftPanel(config: Partial<PanelConfig>): SplitLayoutConfigBuilder;
	rightPanel(config: Partial<PanelConfig>): SplitLayoutConfigBuilder;
	responsive(config: Partial<ResponsiveConfig>): SplitLayoutConfigBuilder;
	gap(gap: string): SplitLayoutConfigBuilder;
	className(className: string): SplitLayoutConfigBuilder;
	build(): SplitLayoutConfig;
}

// Props for SmartSplitLayout component
export interface SmartSplitLayoutProps {
	config?: Partial<SplitLayoutConfig>;
	children?: Snippet;
	leftPanel?: Snippet;
	rightPanel?: Snippet;
}

// Props for SmartRelatedTabs component
export interface SmartRelatedTabsProps {
	tabs: TabConfig[];
	defaultTab?: string;
	orientation?: 'horizontal' | 'vertical';
	variant?: 'default' | 'pills' | 'underline';
	className?: string;
	onTabChange?: (tabId: string) => void;
}

// Props for SmartTabPanel component
export interface SmartTabPanelProps {
	tabId: string;
	isActive: boolean;
	className?: string;
	children?: Snippet;
}
