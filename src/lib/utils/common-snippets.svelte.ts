import { createRawSnippet } from 'svelte';

type RawSnippetParams = {
	value: string | number | null | undefined;
	isDanger?: boolean;
	action?: boolean;
};

export const rightAlignSnippet = createRawSnippet<[RawSnippetParams]>((getValue) => {
	function refreshDisplay(): string {
		const { value = 0, isDanger = false, action } = getValue();
		const className = isDanger ? 'text-right text-warning' : 'text-right';
		const dotClassName = action
			? 'inline-block w-1.5 h-1.5 bg-warning rounded-full mr-1  align-middle'
			: '';
		return `
            <div class="${className}">
                ${action ? `<span class="${dotClassName}"></span>` : ''}${value ?? ''}
            </div>
        `;
	}

	return {
		render: () => refreshDisplay(),
		setup: (node) => {
			$effect(() => {
				node.innerHTML = refreshDisplay();
			});
		}
	};
});
