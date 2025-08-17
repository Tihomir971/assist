# Project: Assist

## Project Overview

This is a SvelteKit project built with TypeScript. It uses Supabase as a backend for authentication and data storage. The frontend is built with Svelte and styled with Tailwind CSS. The project includes a variety of features, including a rich text editor (Tiptap), tables (@tanstack/svelte-table), charts (ECharts), and forms (sveltekit-superforms).

## Building and Running

To get started with this project, you'll need to have Node.js and pnpm installed.

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables:
    ```
    PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
    ```

3.  **Run the development server:**
    ```bash
    pnpm run dev
    ```

4.  **Build for production:**
    ```bash
    pnpm run build
    ```

5.  **Preview the production build:**
    ```bash
    pnpm run preview
    ```

## Development Conventions

*   **Code Formatting:** This project uses Prettier for code formatting. You can format the code by running:
    ```bash
    pnpm run format
    ```

*   **Linting:** This project uses ESLint for code linting. You can check for linting errors by running:
    ```bash
    pnpm run lint
    ```

*   **Type Checking:** This project uses TypeScript for static type checking. You can check for type errors by running:
    ```bash
    pnpm run check
    ```

*   **Deployment:** The project is configured to be deployed to Cloudflare Pages. You can deploy the project by running:
    ```bash
    pnpm run deploy
    ```
