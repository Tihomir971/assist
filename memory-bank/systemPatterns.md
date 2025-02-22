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
