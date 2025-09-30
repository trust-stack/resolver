# Trust Stack Resolver

A TypeScript ISO Link Resolver powered by [Hono](https://hono.dev/), [Drizzle ORM](https://orm.drizzle.team/), and SQLite. It exposes REST and OpenAPI endpoints for managing link sets and resolving incoming requests to either a redirect or a linkset document.

## Project Structure

```
.
├── drizzle/                 # Generated SQL migrations and metadata
├── e2e/                     # End-to-end tests (Vitest)
├── scripts/                 # Build-time helpers (OpenAPI generator, TS loader stubs)
├── src/
│   ├── db/                  # Database types, schema definitions, and instance helpers
│   ├── link/                # Link CRUD DTOs, routes, services, utils, and handlers
│   ├── openapi/             # OpenAPI metadata shared by app + generator
│   └── resolver/            # Resolver DTOs, routes, services, and handler
├── openapi.json             # Generated OpenAPI 3.0 definition (version controlled)
├── drizzle.config.ts        # Drizzle Kit configuration
├── vitest.config.ts         # Unit-test configuration
└── vitest.e2e.config.ts     # E2E-test configuration
```

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+
- (macOS/Linux) Build tooling for native module [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) (used in E2E tests)

## Getting Started

Install dependencies:

```bash
pnpm install
```

> **Note:** Installing `better-sqlite3` compiles a native extension. Ensure you have a working compiler tool-chain (e.g., Xcode CLT on macOS).

## Environment

The application expects a SQLite-compatible `DATABASE_URL`. For local development you can use a file database, e.g.:

```bash
export DATABASE_URL="file:./local.db"
```

`RESOLVER_BASE_URL` is optional and defaults to `https://truststack.link`; it is used when generating linkset anchors and the OpenAPI server URL.

## Development Scripts

| Command                 | Description                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `pnpm test`             | Run unit tests (Vitest, using in-memory mocks).                                        |
| `pnpm test:e2e`         | Run end-to-end tests against an in-memory SQLite database (requires `better-sqlite3`). |
| `pnpm build`            | Type-check the codebase and regenerate `openapi.json` via the build script.            |
| `pnpm generate:openapi` | Regenerate the OpenAPI document without running `tsc`.                                 |

## OpenAPI Spec

- The running server exposes the OpenAPI definition at `GET /openapi.json`.
- `pnpm build` (and `pnpm generate:openapi`) produce a version-controlled `openapi.json` in the repo root using the Hono app definition.

## Database & Migrations

The schema lives in `src/db/schema.ts`. Generate migrations whenever you change the schema:

```bash
pnpm exec drizzle-kit generate
```

This writes SQL files to `drizzle/`. Apply them to your database with the usual Drizzle flows.

### Using Drizzle in Tests

E2E tests (`e2e/resolver.e2e.spec.ts`) spin up an in-memory `better-sqlite3` instance and run the generated migrations through `migrate(drizzleDb, { migrationsFolder: "drizzle" })`. This ensures the tests and production environment share identical schema definitions.

## Routes Overview

- `POST /links` – Create a link record.
- `PATCH /links/{id}` – Update a link.
- `GET /links/{id}` – Retrieve a link by ID.
- `DELETE /links/{id}` – Delete a link.
- `GET /links` – Paginated list of links.
- `GET /*` – Resolve a path; returns either a redirect (307) or linkset payload (200). Query parameter `linkType=linkset` forces linkset output.

## Continuous Integration

`.github/workflows/tests.yml` runs:

1. Install dependencies
2. `pnpm build` (type-check + OpenAPI generation)
3. `pnpm test`
4. `pnpm test:e2e`
5. Uploads unit test reports (JUnit XML)

Keep `openapi.json`, migrations, and tests in sync to avoid CI failures.

## Contributing Workflow

1. Update schema in `src/db/schema.ts`.
2. Generate migrations: `pnpm exec drizzle-kit generate`.
3. Implement service/route changes.
4. Update or add unit/E2E tests.
5. Regenerate OpenAPI if endpoints change (`pnpm generate:openapi`).
6. Run `pnpm test` and `pnpm test:e2e` before committing.

## License

MIT (see `package.json`).
