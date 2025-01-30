# URL Parameter Preservation in Navigation

## Context
When navigating from the catalog page with URL parameters (e.g., http://localhost:5173/catalog?wh=5&report=onstock) to the catalog page using the sidebar button, the URL parameters are lost because the Button component uses a static href="/catalog".

## Problem
The inputValueReport state in data-table-toolbar.svelte is initialized from URL parameters, but when navigating through the sidebar, these parameters are lost due to the static href, causing the state not to update properly.

## Solution
Modify the catalog Button in Aside.svelte to preserve all URL parameters except "cat" and "sub". Instead of using a static href, we should:

1. Use the $page store to access current URL parameters
2. Create a dynamic href that preserves all parameters except "cat" and "sub"
3. Use URLSearchParams to handle parameter manipulation

Example implementation:
```svelte
<!-- In Aside.svelte -->
<Button
  href={$derived(() => {
    const params = new URLSearchParams(page.url.search);
    params.delete('cat');
    params.delete('sub');
    const searchParams = params.toString();
    return `/catalog${searchParams ? `?${searchParams}` : ''}`;
  })}
  ...
>
```

This ensures that:
- All URL parameters are preserved (wh, report, vat, etc.)
- Only "cat" and "sub" parameters are removed during navigation
- All state variables in data-table-toolbar will properly initialize from the preserved URL parameters

## Benefits
- Maintains all relevant parameters during navigation
- Provides better user experience by preserving user selections
- Allows category-specific parameters to reset when appropriate
- Ensures consistent state management across navigation

## Implementation Notes
The solution requires:
1. Using $derived for dynamic href generation
2. Using URLSearchParams for proper parameter handling
3. Explicitly removing only the "cat" and "sub" parameters
4. Preserving all other parameters in the URL