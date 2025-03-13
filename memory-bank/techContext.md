# Tech Context

**Technologies Used:**

*   SvelteKit: Frontend framework
*   Svelte 5: JavaScript compiler
*   Supabase: Backend-as-a-service
*   Shadcn-Svelte: UI component library
*   sveltekit-superforms: Form handling library
*   Tailwind CSS: CSS framework
*   Zod: Schema validation library
*   ky: Fetch library
*   TypeScript: Programming language

## SvelteKit Project Structure

A typical SvelteKit project has the following structure:

```
my-project/
├ src/
│ ├ lib/
│ │ ├ server/
│ │ │ └ [server-only lib files]
│ │ └ [lib files]
│ ├ params/
│ │ └ [param matchers]
│ ├ routes/
│ │ └ [routes]
│ ├ app.html
│ ├ error.html
│ ├ hooks.client.js
│ ├ hooks.server.js
│ └ service-worker.js
├ static/
│ └ [static assets]
├ tests/
│ └ [tests]
├ package.json
├ svelte.config.js
├ tsconfig.json
└ vite.config.js
```

Key directories and files:
- `src/lib`: Contains library code (utilities and components), importable via the `$lib` alias
- `src/lib/server`: Contains server-only library code, importable via the `$lib/server` alias
- `src/params`: Contains param matchers for routes
- `src/routes`: Contains the routes of the application
- `src/app.html`: The page template with placeholders for SvelteKit content
- `static`: Contains static assets served as-is (like favicon, robots.txt)

**Development Setup:**

*   The project uses pnpm as the package manager.
*   The project uses eslint for linting.
*   The project uses prettier for code formatting.
*   The project uses TypeScript for type checking.
*   SvelteKit uses Vite for development with hot module replacement (HMR).

**Technical Constraints:**

*   The application must be compatible with modern web browsers.
*   The application must adhere to accessibility standards.
*   The application must be performant and responsive.

## Advanced SvelteKit Features

### Advanced Routing

#### Rest Parameters
- Use rest syntax for unknown number of route segments: `[...file]`
- Example: `/[org]/[repo]/tree/[branch]/[...file]`
- Can be used to create custom 404 pages for specific route sections

#### Optional Parameters
- Make parameters optional by wrapping in double brackets: `[[lang]]/home`
- Both `/home` and `/en/home` would match the same route

#### Parameter Matching
- Ensure route parameters are well-formed using matchers in the `params` directory
- Example: `[page=fruit]` would only match if the parameter is 'apple' or 'orange'
- Matchers run both on server and in browser

#### Route Sorting
- SvelteKit sorts routes by specificity when multiple routes match a path
- More specific routes (fewer parameters) have higher priority
- Routes with matchers have higher priority than those without
- Optional and rest parameters have lowest priority

#### Encoding Special Characters
- Use hexadecimal escape sequences for characters that can't be used in filenames
- Format: `[x+nn]` where `nn` is a hexadecimal character code
- Example: `/smileys/:-)` would be `src/routes/smileys/[x+3a]-[x+29]/+page.svelte`

#### Advanced Layouts
- Group routes with `(group)` directories that don't affect URL paths
- Break out of layout hierarchy with `+page@.svelte` and `+layout@.svelte` syntax
- Example: `+page@(app).svelte` inherits from the `(app)` layout, skipping intermediate layouts

### Hooks

#### Server Hooks (`hooks.server.js`)
- `handle`: Runs for every request, allows modifying response or bypassing SvelteKit
- `handleFetch`: Modifies fetch requests in server-side load functions
- `locals`: Add custom data to the request that's passed to handlers and load functions

#### Shared Hooks (both client and server)
- `handleError`: Handles unexpected errors during loading or rendering
- `init`: Runs once when server is created or app starts in browser

#### Universal Hooks (`hooks.js`)
- `reroute`: Changes how URLs are translated into routes
- `transport`: Allows passing custom types across server/client boundary

### Error Handling
- Expected errors: Created with the `error` helper from `@sveltejs/kit`
- Unexpected errors: Any other exception during request handling
- Custom error pages with `+error.svelte` components
- Type-safe errors by declaring an `App.Error` interface

### Link Options
- `data-sveltekit-preload-data`: Preload data on hover or tap
- `data-sveltekit-preload-code`: Control when code is preloaded (eager, viewport, hover, tap)
- `data-sveltekit-reload`: Force full-page navigation
- `data-sveltekit-replacestate`: Replace history entry instead of creating new one
- `data-sveltekit-keepfocus`: Keep focus on current element after navigation
- `data-sveltekit-noscroll`: Prevent scrolling after navigation

### Service Workers
- Automatically registered if `src/service-worker.js` exists
- Access to `$service-worker` module with paths to static assets and build files
- Useful for offline support and precaching built JS and CSS
- Type-safe service workers with reference directives

### Server-only Modules
- Private environment variables: `$env/static/private` and `$env/dynamic/private`
- Server-only utilities: `$app/server`
- Make custom modules server-only with `.server` in filename or placing in `$lib/server`
- SvelteKit prevents importing server-only code in public-facing code

### Snapshots
- Preserve ephemeral DOM state between navigations
- Export a `snapshot` object with `capture` and `restore` methods
- Useful for preserving form input when navigating away and back

### Shallow Routing
- Create history entries without navigating using `pushState` and `replaceState`
- Associate state with history entries via `page.state`
- Useful for modal dialogs that can be dismissed with back button
- Load data for routes with `preloadData`

### Packaging
- Build component libraries with `@sveltejs/package`
- Configure package.json with proper exports, files, and types
- TypeScript integration with type definitions
- Best practices for publishing Svelte components

## Web Standards in SvelteKit

SvelteKit builds on standard Web APIs rather than reinventing them. This means:
- Existing web development skills apply to SvelteKit
- Learning SvelteKit improves general web development skills
- The framework uses platform features available in modern browsers and environments like Cloudflare Workers, Deno, and Vercel Functions

Key Web APIs used in SvelteKit:

### Fetch APIs
- `fetch` is available in hooks, server routes, and the browser
- A special version of `fetch` is available in `load` functions, server hooks, and API routes for direct endpoint invocation
- `Request` objects are accessible in hooks and server routes as `event.request`
- `Response` objects are returned from `fetch` and handlers in `+server.js` files
- `Headers` interface allows reading incoming and setting outgoing headers

### FormData
- Used for handling HTML native form submissions
- Available through `await event.request.formData()` in server routes

### Stream APIs
- Used for responses too large to fit in memory
- Includes ReadableStream, WritableStream, and TransformStream

### URL APIs
- URLs represented by the `URL` interface with properties like `origin` and `pathname`
- Query parameters accessible via `url.searchParams` (URLSearchParams interface)

### Web Crypto
- Available via the `crypto` global
- Used internally for Content Security Policy headers
- Can be used for operations like generating UUIDs with `crypto.randomUUID()`

**Dependencies:**

*   See `package.json` for a complete list of dependencies.

## Svelte 5 Features and Usage

### Runes and Reactivity

Svelte 5 introduces "runes" - special functions prefixed with `$` that control reactivity:

* `$state()` - Creates reactive state (replaces `let` declarations from Svelte 4)
  ```svelte
  let count = $state(0);
  ```

* `$derived()` - Creates derived state that updates when dependencies change (replaces `$:` reactive declarations)
  ```svelte
  let doubled = $derived(count * 2);
  ```

* `$effect()` - Runs side effects when dependencies change (replaces `$:` statements for side effects)
  ```svelte
  $effect(() => {
    console.log(`Count is now ${count}`);
  });
  ```

* `$props()` - Declares component props (replaces `export let` from Svelte 4)
  ```svelte
  let { foo, bar = 'default' } = $props();
  ```

* `$bindable()` - Marks props that can be bound to with `bind:`
  ```svelte
  let { value = $bindable() } = $props();
  ```

### Event Handling

Svelte 5 uses event attributes instead of the `on:` directive:

```svelte
<!-- Svelte 4 -->
<button on:click={handleClick}>Click me</button>

<!-- Svelte 5 -->
<button onclick={handleClick}>Click me</button>
```

### Snippets and Content Passing

Svelte 5 replaces slots with snippets:

```svelte
<!-- Parent component -->
<Child>
  {#snippet item(text)}
    <span>{text}</span>
  {/snippet}
</Child>

<!-- Child component -->
<script>
  let { item } = $props();
</script>

{@render item('Hello')}
```

### Component Instantiation

Components are no longer classes in Svelte 5. Use `mount` or `hydrate` instead of `new Component()`:

```js
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, { 
  target: document.getElementById("app"),
  props: { foo: 'bar' }
});
```

### State Management

* Deep reactivity with `$state` - Arrays and objects are deeply reactive
* Raw state with `$state.raw` - For non-deep reactivity
* Snapshots with `$state.snapshot` - For taking static snapshots of reactive state

### Svelte 5 Specific Notes

* Event modifiers (like `|preventDefault`) are replaced with wrapper functions
* Components are dynamic by default - no need for `<svelte:component>`
* `<svelte:self>` is deprecated in favor of self-imports
* Whitespace handling is simplified and more predictable
* Modern browser features are required (Proxies, ResizeObserver)
