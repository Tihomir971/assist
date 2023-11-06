<script lang="ts" context="module">
	type CreateTabs = ReturnType<typeof createTabs>;
	type Elements = CreateTabs['elements'];

	type TabsContext = Pick<Elements, 'content' | 'list' | 'trigger'> & {
		tabs: Writable<string[]>;
	};

	const setTabsContext = (context: TabsContext) => {
		setContext('tabs', context);
	};

	export const getTabsContext = () => getContext<TabsContext>('tabs');
</script>

<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import { createTabs, melt } from '@melt-ui/svelte';
	import type { TabHeader, TabValue } from './types';
	import { writable, type Writable } from 'svelte/store';

	/** A writable store that can be used to read and update the tabs value. You can use this to set the default active tab. */
	export let defaultTab: string | undefined = undefined;
	/** Set the tabs that should be disabled. You can pass individual tabs in a list of strings or disable all tabs by setting this prop to 'true'. */
	export let disabledTabs: boolean | string[] = [];
	/** Set the tab headers. For each header provide a key, a title, and optionally an iconify icon. */
	export let tabHeaders: TabHeader[];
	const value = writable(defaultTab ?? tabHeaders[0].key);
	/** Aria label for the tabs. */
	export let ariaLabel: string;

	/** Set the border style. */
	export let borderStyle = 'border-b-1 border-surface-100-200';
	/** Set the active header styles. */
	export let activeStyle = 'primary-500';
	/** Set the in-active header styles. */
	export let inactiveStyle = 'text-surface-900-50 hover:primary-500/60';
	/** Set the header width. */
	export let headerWidth = 'min-w-40';
	/** Set the header styles. */
	export let headerStyle = 'rounded-btn-t px-2 py-1';
	/** Set how the headers should be aligned with the justify property. */
	export let justifyHeaders = 'justify-center';

	const {
		elements: { root, list, content, trigger }
	} = createTabs({
		value
	});

	$: isDisabled = (key: string) =>
		(typeof disabledTabs === 'boolean' && disabledTabs) ||
		(typeof disabledTabs !== 'boolean' && disabledTabs.includes(key));

	setContext('content', content);

	const tabsStore = writable(tabHeaders.map((tabHeader) => tabHeader.key));
	setTabsContext({ content, list, trigger, tabs: tabsStore });
</script>

<div use:melt={$root} class="w-full">
	<div
		use:melt={$list}
		class="w-full flex {justifyHeaders} items-center mb-4 {borderStyle}"
		aria-label={ariaLabel}
	>
		{#each tabHeaders as item}
			{@const activated = $value === item.key}
			{@const deactivated = isDisabled(item.key)}
			<button
				{...$trigger({ value: item.key, disabled: deactivated })}
				use:trigger
				class="{headerStyle} {headerWidth} inline-flex gap-1 justify-center items-center shadow-md shadow-surface-900/20 transition-all duration-150 font-semibold focus:ring-2 focus:ring-surface-300 focus:ring-offset-2 {deactivated
					? 'opacity-70 cursor-not-allowed'
					: ''} {activated ? activeStyle : inactiveStyle}"
			>
				<span class={item.icon} />
				<span>{item.title}</span>
			</button>
		{/each}
	</div>
	<slot />
</div>
