# Maple Books demo: the views/screens folder structure, running

A small, fully working app that shows the folder structure the frontend team agreed on, with one real case: the **commerce** view and its two screens.

- Everything is mocked with [miragejs](https://miragejs.com). No backend is needed.
- **All data is fictional** (a made-up bookstore). Endpoints, headers, roles, feature flags and field names are invented for this demo.
- The patterns (base `Client` class, typed errors, a store per view with API calls inside, take-latest cancellation, flash notifications, polling) come from how the real project works, applied to the new structure.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest. Mirage is not used in tests: client tests stub `fetch`,
                   # store and screen tests mock the view's client with `vi.mock`
npm run typecheck
npm run check      # Biome 1.9.4
npm run build
```

Use the toolbar at the top of the page to **switch user** (viewer, editor, manager), turn on **Slow network**, or **Simulate errors**.

> The first load in dev is slower than the rest: Vite serves every module separately and this app
> pulls in a lot of MUI. `vite.config.ts` pre-bundles the heavy dependencies to limit that.
> `npm run build && npm run preview` serves the bundled app if you want to compare.

## The structure

```
src/
├── main.tsx                 ENTRY POINT: bind demo user -> start mock server -> render
├── App.tsx                  loads the session, then renders the router
├── AppRouter.tsx            one route per view, loaded lazily with the route's `lazy`
├── vitest-setup.ts
├── views/
│   ├── home/Home.tsx        a second, tiny view (shows views are independent)
│   └── commerce/
│       ├── Commerce.tsx                 the view's own routes
│       ├── api/CommerceClient.ts        endpoints used ONLY by this view
│       ├── store/useCommerceStore.ts    ONE store; API calls start here
│       ├── components/CommerceHeader/   used by 2 screens -> view root
│       ├── utils/selectors.ts  types/
│       ├── __fixtures__/                builders + seed data for tests and mocks
│       ├── interceptor/                 this view's Mirage routes
│       └── screens/
│           ├── Collections/             /commerce/collections
│           │   ├── Collections.tsx  Collections.test.tsx
│           │   ├── components/CollectionCard/  CreateCollectionDialog/
│           │   └── hooks/useCollectionsPolling.ts (+test)
│           └── Books/                   /commerce/collections/:collectionId
│               ├── Books.tsx  Books.test.tsx
│               ├── components/BooksTable/
│               ├── hooks/useBooksQuery.ts (+test)
│               └── utils/formatPrice.ts  booksToCsv.ts (+test)
├── clients/        Client.ts (base class + typed errors), SessionClient.ts   used by 2+ views / the shell
├── zustand/        global state ONLY: session, flash notifications, feature flags
├── components/     shared UI: Layout, Sidebar, PageLayout, EmptyState, WithPermission,
│                   FlashContainer, ErrorBoundary, DevToolbar
├── hooks/          shared hooks: usePermission
├── utils/          apiClient, takeLatestSignal, reportToMonitoring, getErrorMessage, devSettings
├── mocks/          dev-only: startMockServer, helpers, session/ (interceptor + fixtures)
├── styles/  types/
```

In the real project the root is `scripts/react-app/` (alias `app/`), and the global folders (`components/`, `hooks/`, `utils/`, `zustand/`, `clients/`) are the same ones that exist today.

### Where do the API calls live?

```
screen / component  ->  store action  ->  CommerceClient  ->  Client (base)  ->  apiClient (fetch)
```

- Components and screens **never** call the API. They read the store and call its actions.
- The store handles loading flags, errors (`reportError` + a flash notification) and cancellation.
- `CommerceClient` lives in `views/commerce/api/` because only commerce uses it. A client used by 2+ views stays in the global `clients/`. The base `Client` class is always global.
- Endpoints used by a single screen could live in `screens/<Screen>/api/`. This demo does not need it.

### Where does each thing go?

| Used by | Goes in |
|---|---|
| One component | next to that component |
| One screen | `views/<view>/screens/<Screen>/components`, `hooks` or `utils` |
| 2+ screens of one view | `views/<view>/components`, `hooks`, `utils` or `types` |
| 2+ views, generic | the global `components/`, `hooks/` or `utils/` |
| The view's state | `views/<view>/store/` (one store per view by default) |
| Global app state | `zustand/` |

Example in this demo: `CommerceHeader` is shown by both screens, so it lives at the view root. `CollectionCard` is only used by `Collections`, so it lives inside that screen.

### Rules

1. A view never imports from another view, and a screen never imports from another screen.
2. Shared code (`components/`, `hooks/`, `utils/`, `clients/`, `zustand/`) never imports from views, so it stays reusable by any view. The exception is a **composition root**, whose whole job is to wire views together: `AppRouter.tsx` and `mocks/startMockServer.ts` do import from `views/`, and say so in a comment.
3. One store per view by default. A screen can have its own only if its state is truly local to it (rare).
4. API calls go through the store, never directly from components.
5. Code lives as close as possible to where it is used, and moves up only when a second place needs it.
6. No barrel files. Views are loaded lazily by `AppRouter` with the route's `lazy` property.
7. Tests live next to the code. Fixtures live in a co-located `__fixtures__/` folder as builders with overrides.
8. Query elements by role or label in tests. `data-testid` is only for disambiguating repeated items (`book-row-<id>`).

## The mock layer (interceptors and fixtures)

- Each view owns its interceptor and its fixtures: `views/commerce/interceptor/CommerceMockInterceptor.ts` and `views/commerce/__fixtures__/`.
- `mocks/startMockServer.ts` only **composes** them (plus the session). Anything that is not `/api/v1/*` passes through to the network.
- `mocks/helpers.ts` wraps every handler with the toolbar behaviour (latency, simulated errors) and the permission checks.
- Mock state is in memory, so creating, deleting and archiving work until you reload the page.
- A collection created in the demo starts as **syncing** and becomes **ready** after a few list requests, so you can see the polling hook working.

**A note on Mirage:** `miragejs` 0.1.48 is the latest release (November 2024) and is not actively maintained. It is a fine fit for a demo; a team adopting mocks for the real project should also look at alternatives such as MSW.

## The user rules

The server (here, the mock) decides what each user can do. The client only reads the result:

```ts
{ id, name, email, role: 'viewer' | 'editor' | 'manager', permissions: string[], featureFlags: Record<string, boolean> }
```

| Role | Permissions |
|---|---|
| viewer | `collection:read`, `book:read` |
| editor | viewer + `book:edit` (archive and restore books) |
| manager | editor + `collection:create`, `collection:delete` |

- `usePermission('collection:create')` and `<WithPermission permission="…">` hide what a user cannot do.
- The server **also** checks every endpoint, reads included, and answers `403`. Hiding a button is not a permission check: switch to a viewer and call `POST /api/v1/collections` from the console to see it. The store turns that error into a flash notification.
- Feature flags are a flat map. `exportCsv` is only on for managers and shows an export button in the Books screen.

## How to add a new screen to a view

1. Create `views/<view>/screens/<Screen>/<Screen>.tsx` (PascalCase, flat, no `screens/` inside a screen).
2. Add its route in the view's router (`Commerce.tsx` here).
3. Put what only this screen uses inside its folder (`components/`, `hooks/`, `utils/`). Move something up to the view root only when a second screen needs it.
4. If it needs data, add an action to the view's store and an endpoint to the view's client. Do not call the client from the screen.
5. Add a fixture builder and a Mirage route in the view's `__fixtures__/` and `interceptor/`.
6. Write the test next to the screen.

## Differences from the real project

- The router uses `createBrowserRouter` with the route's `lazy`, and a view has no `index.tsx` lazy entry file.
- There is no analytics, monitoring or design-system package. The theme is a small MUI theme.
- Permissions are strings returned by the server; the real project uses a different model.
- Loaders and actions of React Router are not used (they are a possible later step).

## Linting

Biome runs with the recommended rules plus `noUnusedImports` as an error. One rule is turned off:
`noStaticOnlyClass`, because `clients/Client.ts` is a static-only class on purpose, mirroring the
base client of the real project that every domain client extends.

Two Biome behaviours are worth knowing when reading this code:
- `organizeImports` sorts imports and drags an attached comment with them. Leave a **blank line**
  between a file's header comment and the first import, or the comment ends up in the middle.
- Biome 1.9 cannot express "this folder must not import from that one", so the import rules above
  are not enforced by tooling here. Biome 2.2 adds `noRestrictedImports` with glob patterns.

## Stack

React 19, React Router 7, Zustand 5, MUI 6, Vite 6, Vitest 3 with happy-dom and Testing Library, Biome 1.9.4, TypeScript 5.9, miragejs 0.1.48.
