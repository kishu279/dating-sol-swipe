# Copilot Instructions for AI Coding Agents

## Project Architecture

- **Monorepo Structure:** Uses Turborepo to manage multiple apps and packages. Key directories:
  - `apps/`: Application code (e.g., `dating-backend`)
  - `packages/`: Shared libraries (e.g., `database`, `ui`, `eslint-config`, `typescript-config`)
  - `docs/`: Documentation and API/database schema
- **Backend:** Located in `apps/dating-backend/`. Entry point is `index.ts`. Uses Bun as the runtime.
- **Database:** Located in `packages/database/`. Prisma is used for ORM. Entry point is `index.ts`. Prisma schema in `prisma/schema.prisma`.
- **UI:** Shared React components in `packages/ui/src/`.

## Developer Workflows

- **Install dependencies:**
  - For any app or package: `bun install`
- **Run backend or database:**
  - `bun run index.ts` (from the respective directory)
- **Build all apps/packages:**
  - From repo root: `turbo build` (or `npx turbo build`/`pnpm exec turbo build`)
- **Linting/Formatting:**
  - ESLint and Prettier are configured via shared packages (`eslint-config`, `typescript-config`).

## Conventions & Patterns

- **TypeScript everywhere:** All code is written in TypeScript.
- **Modular structure:** Backend modules are under `src/modules/` (e.g., `user/`).
- **Routes:** API routes are defined in `src/routes/` and module-specific `*.routes.ts` files.
- **Prisma usage:** Database models and client are auto-generated in `packages/database/src/generated/prisma/`.
- **Shared config:** TypeScript and ESLint configs are centralized in `packages/typescript-config` and `packages/eslint-config`.

## Integration Points

- **Prisma ORM:** Used for database access. Schema and seed scripts in `packages/database/prisma/`.
- **Bun Runtime:** All apps/packages use Bun for running and installing dependencies.
- **Turbo:** Used for monorepo builds and task orchestration.

## Examples

- To add a new backend module: Create a folder in `apps/dating-backend/src/modules/`, add `*.controller.ts` and `*.routes.ts`.
- To add a new database model: Edit `packages/database/prisma/schema.prisma`, then regenerate Prisma client.

## Key Files & Directories

- [README.md](README.md): Monorepo overview
- [apps/dating-backend/README.md](apps/dating-backend/README.md): Backend setup
- [packages/database/README.md](packages/database/README.md): Database setup
- [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma): Database schema
- [apps/dating-backend/src/modules/](apps/dating-backend/src/modules/): Backend modules
- [packages/database/src/generated/prisma/](packages/database/src/generated/prisma/): Prisma client/models

---

_If any section is unclear or missing, please provide feedback to improve these instructions._
