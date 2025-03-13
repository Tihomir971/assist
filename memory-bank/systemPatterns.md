# System Patterns

**System Architecture:**

*   SvelteKit frontend with a Supabase backend.
*   Uses a component-based architecture with Shadcn-Svelte UI components.
*   Form handling is implemented using sveltekit-superforms.

**Key Technical Decisions:**

*   Using SvelteKit for its performance and developer experience.
*   Choosing Supabase for its ease of use and comprehensive feature set.
*   Adopting Shadcn-Svelte for a consistent and customizable UI.
*   Using sveltekit-superforms for type-safe form handling.
*   Using Zod for schema validation.
*   Using "ky" fetch library for API requests.

## SvelteKit Best Practices

### Authentication and Authorization

*   **Sessions vs Tokens**: 
    - Session IDs are stored in a database, can be immediately revoked, but require a database query on each request.
    - JWTs don't require database checks but cannot be immediately revoked.
*   **Integration Points**: Auth cookies can be checked in server hooks, with user information stored in `locals`.
*   **Recommended Solution**: Lucia is recommended for session-based web app authentication.

### Performance Optimization

*   **SvelteKit's Built-in Optimizations**:
    - Code-splitting for loading only necessary code
    - Asset preloading to prevent waterfalls
    - File hashing for effective caching
    - Request coalescing for grouping server load function data
    - Parallel loading for universal load functions
    - Data inlining for replaying server requests in the browser
    - Conservative invalidation for efficient load function re-runs
    - Prerendering for instant serving of static pages
    - Link preloading for anticipating navigation requirements

*   **Asset Optimization**:
    - **Images**: Use `@sveltejs/enhanced-img` for automatic optimization
    - **Videos**: Compress videos, lazy-load when below the fold, strip audio from muted videos
    - **Fonts**: Consider preloading critical fonts, use subsetting to reduce file size

*   **Code Size Reduction**:
    - Use the latest Svelte version
    - Analyze package size with tools like `rollup-plugin-visualizer`
    - Minimize third-party scripts
    - Use dynamic imports for conditional code

*   **Navigation Optimization**:
    - Use link preloading for faster client-side navigation
    - Stream non-essential data with promises in load functions
    - Prevent waterfalls by optimizing sequential requests

*   **Hosting Considerations**:
    - Co-locate frontend and backend in the same data center
    - Consider edge deployment for global performance
    - Ensure HTTP/2 or newer is used

### Image Handling

*   **Vite's Built-in Asset Handling**: Automatically processes imported assets for improved performance.

*   **@sveltejs/enhanced-img**: 
    - Provides automatic image optimization
    - Serves smaller file formats (avif, webp)
    - Sets intrinsic width and height to prevent layout shift
    - Creates multiple sizes for different devices
    - Strips EXIF data for privacy

*   **CDN Integration**: 
    - Use for images not available at build time
    - Consider libraries like `@unpic/svelte` for CDN-agnostic support

*   **Icon Handling**: 
    - Define icons in CSS when possible
    - Avoid libraries with thousands of .svelte files

*   **Best Practices**:
    - Use high-quality original images (2x display size for HiDPI)
    - Specify `sizes` for large images
    - Set `fetchpriority="high"` for important images
    - Always provide good `alt` text

### Accessibility

*   **Route Announcements**: 
    - SvelteKit injects a live region to announce page changes
    - Every page should have a unique, descriptive title

*   **Focus Management**: 
    - SvelteKit focuses the `<body>` after navigation
    - Elements with `autofocus` will be focused instead
    - Custom focus management possible with `afterNavigate` hook

*   **Language Attributes**: 
    - Set the correct `lang` attribute on the `<html>` element
    - For multi-language sites, update dynamically using the handle hook

### SEO Optimization

*   **Server-Side Rendering**: 
    - SvelteKit uses SSR by default for better indexing
    - Performance impacts search ranking

*   **Metadata**: 
    - Every page should have well-written `<title>` and `<meta name="description">` elements
    - Use `<svelte:head>` to set these elements

*   **Sitemaps**: 
    - Create dynamically using endpoints
    - Help search engines prioritize pages

*   **URL Normalization**: 
    - SvelteKit redirects URLs with/without trailing slashes to prevent duplicates

**Design Patterns in Use:**

*   Component-based architecture.
*   Form object pattern (sveltekit-superforms).
*   Utility-first CSS (Tailwind CSS).
*   Storage-agnostic pattern for cart implementation:
    ```typescript
    // Abstract storage interface allowing swapping between localStorage and Supabase
    interface ICartStorage<T> {
      get(): Promise<T[]>;
      set(items: T[]): Promise<void>;
      update(id: number, updates: Partial<T>): Promise<void>;
      delete(id: number): Promise<void>;
      subscribe(callback: (items: T[]) => void): () => void;
    }
    ```
    - Implementations:
      - LocalCartStorage: Uses LocalStorage class with Svelte's $state
      - SupabaseCartStorage: Uses Supabase client for persistence
    - Benefits:
      - Easy switching between storage implementations
      - Maintains reactivity
      - Type-safe operations
      - Async-first design

**Component Relationships:**

*   SvelteKit routes define the application's pages and API endpoints.
*   Shadcn-Svelte components are used to build the UI.
*   sveltekit-superforms handles form data and validation.
*   Supabase provides data storage and authentication.
