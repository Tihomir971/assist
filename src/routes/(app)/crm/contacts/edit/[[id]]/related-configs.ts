import { createSplitLayoutConfig } from '$lib/utils/split-layout-config.builder';

export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({ width: '100%' })
	.rightPanel({ width: '0%' })
	.build();
