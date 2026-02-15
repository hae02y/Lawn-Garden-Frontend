# AGENTS.md

Agent guidance for this repository (Lawn-Garden-Frontend).
Use this file as the primary operating manual for automated coding agents.

## Project Snapshot
- Stack: Vite + React + TypeScript + Zustand + styled-components.
- Router: react-router-dom (data router via createBrowserRouter).
- API: Axios with a shared instance and request interceptor.
- State: Zustand store persisted to localStorage.

## Cursor / Copilot Rules
- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- No Copilot instructions found in `.github/copilot-instructions.md`.
- README includes commit/branch naming guidance; follow it when committing.

## Commands (Build/Lint/Test)
All commands are from `package.json`:

- Dev server: `npm run dev`
- Production build: `npm run build` (runs `tsc -b` then `vite build`)
- Lint: `npm run lint`
- Preview build: `npm run preview`

### Tests
- There is no test runner configured (no `test` script in `package.json`).
- Single test execution is not available yet.
- If tests are added later, document how to run a single test here.

## Code Style Guidelines
These are inferred from the current codebase and configs.

### General Formatting
- TypeScript/React code uses 2-space indentation.
- Prefer semicolons (most files use them).
- Keep JSX props on separate lines when they are long.
- Avoid trailing whitespace; keep files tidy and minimal.

### Imports
- Use absolute imports via `@/` alias (configured in `tsconfig.app.json`).
  Example: `import Wrapper from '@/styles/Wrapper';`
- Group imports logically: external libs first, then local aliases.
- Prefer type-only imports for types: `import type { ... } from '...';`

### TypeScript and Types
- `strict` mode is enabled; avoid `any` unless unavoidable.
- Prefer explicit types for function parameters and return values when
  inference is unclear or public APIs are exposed.
- Use `interface` for object shapes and `type` for unions.
- Keep store and API payload/response types near their usage.

### Naming Conventions
- Components: PascalCase (`Login`, `ArrowButton`).
- Hooks: camelCase starting with `use` (`useAuthStore`).
- Variables and functions: camelCase (`handleLogin`).
- Styled-components: PascalCase for exported components.
- Props in styled-components that should not be passed to DOM
  should be prefixed with `$` (see `Button` usage).

### React and State
- Use React hooks from `react` and `react-router-dom` as shown.
- Router uses `createBrowserRouter` with nested routes and `<Outlet />`.
- Use Zustand store for auth token; access with `useAuthStore`.

### Styling
- styled-components is the primary styling approach.
- Global styles are defined in `src/styles/GlobalStyle.tsx`.
- CSS variables are expected (see usage like `var(--color-...)`).
- Keep styled-components co-located with components when practical.

### API and Error Handling
- Use the shared Axios instance from `src/api/axios.ts`.
- Request interceptor attaches auth token from Zustand store.
- API methods return typed `AxiosResponse` where possible.
- In UI handlers, use `try/catch` with `unknown` error type,
  and narrow via `instanceof Error` before accessing `.message`.

### Files and Structure
- Entry: `src/main.tsx` renders `<GlobalStyle />` and `<RouterProvider />`.
- Top-level layout: `src/App.tsx` wraps content and backgrounds.
- Routes: `src/routes/index.tsx` and guarded route in
  `src/routes/ProtectedRoute.tsx`.
- Auth store: `src/store/authStore.tsx` (persisted to localStorage).
- API layer: `src/api/auth.ts` and `src/api/axios.ts`.

## Behavior Guidelines for Agents
- Read files before modifying; follow existing patterns.
- Do not introduce new dependencies unless required and justified.
- Preserve existing functionality, especially auth flow and routing.
- Avoid adding large style overhauls unless explicitly requested.
- Keep changes focused; avoid unrelated refactors.

## Lint and Type Safety Expectations
- ESLint uses `@eslint/js`, `typescript-eslint`, `react-hooks`,
  and `react-refresh` recommended configs.
- Respect `noUnusedLocals` and `noUnusedParameters` from TS config.
- Avoid side-effect imports that are unchecked.

## Commit / Branch Guidance (from README)
- Commit messages: use `type: description` (Korean guidance).
- Branches should follow these types:
  - feat: new feature
  - fix: bug fix
  - refactor: refactor without behavior change
  - design: UI/style changes
  - docs: documentation updates
  - style: formatting-only changes
  - test: test changes
  - chore: build/deploy/env changes

## Notes for Future Setup
- If tests are introduced (e.g., Vitest), add:
  - `npm run test`
  - `npm run test -- path/to/file.test.ts`
  - `npm run test -- -t "test name"`
- Update this file when new tooling is added.
