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

**Component Relationships:**

*   SvelteKit routes define the application's pages and API endpoints.
*   Shadcn-Svelte components are used to build the UI.
*   sveltekit-superforms handles form data and validation.
*   Supabase provides data storage and authentication.
