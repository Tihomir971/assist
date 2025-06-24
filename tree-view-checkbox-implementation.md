# Tree-View Checkbox Implementation Guide

## Overview
This document provides the exact code changes needed to add checkbox support to the `src/lib/components/zag/tree-view` component when `selectionMode: 'multiple'`.

## Required Changes

### 1. Update Props Destructuring

**File:** `src/lib/components/zag/tree-view/tree-view.svelte`

**Current (lines 26-35):**
```typescript
let {
	value = [],
	items = [],
	onSelectionChange,
	label,
	contextNode = $bindable(),
	selectedValue = $bindable([]),
	onExpandedChange,
	...restProps
}: TreeViewProps<T> = $props();
```

**Updated:**
```typescript
let {
	value = [],
	items = [],
	onSelectionChange,
	label,
	contextNode = $bindable(),
	selectedValue = $bindable([]),
	checkedValue = $bindable([]), // ADD: Checkbox values
	onCheckedChange, // ADD: Checkbox change handler
	selectionMode = 'single', // ADD: Selection mode with default
	onExpandedChange,
	...restProps
}: TreeViewProps<T> = $props();
```

### 2. Update useMachine Configuration

**File:** `src/lib/components/zag/tree-view/tree-view.svelte`

**Current (lines 70-93):**
```typescript
const service = useMachine(tree.machine, {
	id,
	get collection() {
		return filteredCollection;
	},
	get selectedValue() {
		return selectedValue;
	},
	get defaultSelectedValue() {
		return value;
	},
	get defaultExpandedValue() {
		return initialExpandedValue;
	},

	onSelectionChange(details) {
		internalChange = true;
		onSelectionChange?.(details);
	},
	onExpandedChange(details) {
		onExpandedChange?.(details);
	},
	...restProps
});
```

**Updated:**
```typescript
const service = useMachine(tree.machine, {
	id,
	get collection() {
		return filteredCollection;
	},
	get selectedValue() {
		return selectedValue;
	},
	get checkedValue() { // ADD: Checkbox values getter
		return checkedValue || [];
	},
	get selectionMode() { // ADD: Selection mode getter
		return selectionMode;
	},
	get defaultSelectedValue() {
		return value;
	},
	get defaultExpandedValue() {
		return initialExpandedValue;
	},

	onSelectionChange(details) {
		internalChange = true;
		onSelectionChange?.(details);
	},
	onCheckedChange(details) { // ADD: Checkbox change handler
		checkedValue = details.value;
		onCheckedChange?.(details);
	},
	onExpandedChange(details) {
		onExpandedChange?.(details);
	},
	...restProps
});
```

### 3. Update treeNode Snippet Template

**File:** `src/lib/components/zag/tree-view/tree-view.svelte`

**Current Branch Node (lines 144-161):**
```svelte
{#if nodeState.isBranch}
	<div {...api.getBranchProps({ indexPath, node })}>
		<div {...api.getBranchControlProps({ indexPath, node })}>
			<!-- <PhFolder /> -->
			<span {...api.getBranchIndicatorProps({ indexPath, node })}>
				<PhCaretRight />
			</span>
			<span {...api.getBranchTextProps({ indexPath, node })} class="truncate text-sm"
				>{node.label}</span
			>
		</div>
		<div {...api.getBranchContentProps({ indexPath, node })}>
			<!-- <div {...api.getBranchIndentGuideProps({ indexPath, node })}></div> -->
			{#each node.children || [] as childNode, index}
				{@render treeNode({ node: childNode, indexPath: [...indexPath, index], api })}
			{/each}
		</div>
	</div>
```

**Updated Branch Node:**
```svelte
{#if nodeState.isBranch}
	<div {...api.getBranchProps({ indexPath, node })}>
		<div {...api.getBranchControlProps({ indexPath, node })}>
			<!-- ADD: Conditional checkbox for multiple selection -->
			{#if selectionMode === 'multiple'}
				<input type="checkbox" {...api.getNodeCheckboxProps({ indexPath, node })} />
			{/if}
			
			<span {...api.getBranchIndicatorProps({ indexPath, node })}>
				<PhCaretRight />
			</span>
			<span {...api.getBranchTextProps({ indexPath, node })} class="truncate text-sm"
				>{node.label}</span
			>
		</div>
		<div {...api.getBranchContentProps({ indexPath, node })}>
			{#each node.children || [] as childNode, index}
				{@render treeNode({ node: childNode, indexPath: [...indexPath, index], api })}
			{/each}
		</div>
	</div>
```

**Current Leaf Node (lines 162-169):**
```svelte
{:else}
	<div {...api.getItemProps({ indexPath, node })}>
		<!-- <PhFile /> -->
		<span class="ml-6 truncate text-sm">
			{node.label}
		</span>
	</div>
{/if}
```

**Updated Leaf Node:**
```svelte
{:else}
	<div {...api.getItemProps({ indexPath, node })}>
		<!-- ADD: Conditional checkbox for multiple selection -->
		{#if selectionMode === 'multiple'}
			<input type="checkbox" {...api.getNodeCheckboxProps({ indexPath, node })} />
		{:else}
			<!-- Maintain spacing when no checkbox -->
			<span class="ml-6"></span>
		{/if}
		
		<span class="truncate text-sm">
			{node.label}
		</span>
	</div>
{/if}
```

### 4. Add Checkbox CSS Styles

**File:** `src/lib/components/zag/tree-view/tree-view.css`

**Add at the end of the file:**
```css
/* Checkbox styling */
[data-scope='tree-view'][data-part='node-checkbox'] {
	margin-right: 8px;
	cursor: pointer;
}

[data-scope='tree-view'][data-part='node-checkbox']:disabled {
	cursor: not-allowed;
	opacity: 0.5;
}

/* Indeterminate state styling */
[data-scope='tree-view'][data-part='node-checkbox'][data-state='indeterminate'] {
	/* Custom styling for indeterminate state if needed */
}
```

## Usage Examples

### Single Selection (Current Behavior - No Changes)
```svelte
<TreeView
	items={treeData}
	bind:selectedValue={selected}
	onSelectionChange={(details) => console.log('Selected:', details.value)}
/>
```

### Multiple Selection with Checkboxes (New Feature)
```svelte
<script>
	let checkedItems = [];
	let selectedItems = [];
</script>

<TreeView
	items={treeData}
	selectionMode="multiple"
	bind:checkedValue={checkedItems}
	bind:selectedValue={selectedItems}
	onCheckedChange={(details) => console.log('Checked:', details.value)}
	onSelectionChange={(details) => console.log('Selected:', details.value)}
/>
```

## Key Features

1. **Backward Compatible**: Default behavior remains unchanged (single selection)
2. **Conditional Rendering**: Checkboxes only appear when `selectionMode="multiple"`
3. **Proper Spacing**: Maintains visual alignment in both modes
4. **Zag.js Integration**: Uses `api.getNodeCheckboxProps()` for proper functionality
5. **Accessibility**: Inherits Zag.js accessibility features for checkboxes

## Checkbox States

The checkboxes support three states:
- **Checked**: `data-state="checked"` - Node is selected
- **Unchecked**: `data-state="unchecked"` - Node is not selected  
- **Indeterminate**: `data-state="indeterminate"` - Some children are selected

## Testing Checklist

- [ ] Single selection mode works as before (regression test)
- [ ] Multiple selection mode shows checkboxes
- [ ] Checkboxes can be clicked and change state
- [ ] Parent nodes show indeterminate state when some children are selected
- [ ] Keyboard navigation works with checkboxes
- [ ] Search functionality works with checkboxes
- [ ] Expand/collapse works with checkboxes
- [ ] Context menu still works
- [ ] CSS styling looks correct in both modes

## Implementation Notes

1. **No Breaking Changes**: Existing `TreeViewItem.value: number` is preserved
2. **String Conversion**: The existing `nodeToValue: (node) => node.value.toString()` handles conversion
3. **Props Already Exist**: `selectionMode`, `checkedValue`, and `onCheckedChange` are already in `tree.Props`
4. **Minimal Changes**: Only adds conditional checkbox rendering and related handlers