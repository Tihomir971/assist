export const sourcePath = {
	2: 'scraper/cenoteka',
	4: 'scraper/idea',
	6: 'scraper/tehnomedia'
} as const;

export type SourceId = keyof typeof sourcePath;
