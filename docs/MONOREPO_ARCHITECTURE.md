# Monorepo Architecture - Learning Document

## Overview

This project uses a **Turborepo monorepo** with **Bun** as the package manager. The architecture allows shared packages (like database) to be used by multiple apps/services.

---

## Project Structure

```
dating-sol-swipe/
├── apps/                    # Applications (services)
│   └── dating-backend/      # Express API server
│
├── packages/                # Shared packages
│   ├── database/            # Prisma + PostgreSQL (shared)
│   ├── eslint-config/       # Shared ESLint config
│   ├── typescript-config/   # Shared TS config
│   ├── ui/                  # Shared UI components
│   └── testing-env/         # Shared test utilities
│
├── package.json             # Root workspace config
├── turbo.json               # Turborepo config
└── pnpm-workspace.yaml      # Workspace definition
```

---

## How the Database Package Works

### 1. Package Definition

**`packages/database/package.json`:**
```json
{
  "name": "@repo/database",        // Package name used for importing
  "module": "dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 2. What It Exports

**`packages/database/src/client.ts`:**
```typescript
import { PrismaClient } from "./generated/prisma/client.js";

// Singleton pattern - reuses same instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({...});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 3. How Apps Use It

**`apps/dating-backend/package.json`:**
```json
{
  "dependencies": {
    "@repo/database": "workspace:*"   // Uses local workspace package
  }
}
```

**`apps/dating-backend/src/modules/user/user.controller.ts`:**
```typescript
import { prisma } from "@repo/database";   // Import from shared package

const users = await prisma.user.findMany();
```

---

## Key Concepts

### 1. Workspaces

**Root `package.json`:**
```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```
This tells Bun to treat `apps/` and `packages/` directories as workspace packages that can reference each other.

### 2. Internal Dependencies

Using `"workspace:*"` in dependencies:
```json
"@repo/database": "workspace:*"
```
- `workspace:*` means "use the local package from this monorepo"
- No version pinning needed - always uses latest local version
- Changes in the package are immediately reflected in apps

### 3. Turborepo Task Pipeline

**`turbo.json`:**
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]    // Build dependencies first
    },
    "dev": {
      "persistent": true         // Long-running dev servers
    }
  }
}
```
- `^build` means "run this task's dependencies' build first"
- Ensures `packages/database` builds before `apps/dating-backend`

---

## Workflow

### Adding a New Service That Needs Database

1. **Create the new app:**
   ```bash
   mkdir apps/my-new-service
   ```

2. **Add database dependency in its `package.json`:**
   ```json
   {
     "dependencies": {
       "@repo/database": "workspace:*"
     }
   }
   ```

3. **Import and use:**
   ```typescript
   import { prisma } from "@repo/database";
   ```

4. **Run from root:**
   ```bash
   bun install
   bun run dev
   ```

### Modifying the Database Schema

1. **Edit schema:**
   ```bash
   # Edit packages/database/prisma/schema.prisma
   ```

2. **Generate client:**
   ```bash
   cd packages/database
   bunx prisma generate
   ```

3. **Run migration:**
   ```bash
   bunx prisma migrate dev --name your_migration_name
   ```

4. **All apps automatically get updated types** (after TS server reload)

---

## Benefits of This Setup

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | One schema, one Prisma client for all services |
| **Type Safety** | Shared types across all apps |
| **No Duplication** | Don't repeat database setup in each service |
| **Easy Updates** | Change schema once, all apps benefit |
| **Caching** | Turborepo caches builds for speed |

---

## Common Commands

```bash
# From root - runs dev for ALL packages/apps
bun run dev

# From root - runs build for ALL packages/apps  
bun run build

# Database specific (from packages/database)
bunx prisma generate       # Generate client after schema change
bunx prisma migrate dev    # Create & run migration
bunx prisma db seed        # Seed database
bunx prisma studio         # Open database GUI
```

---

## File Locations

| Purpose | Location |
|---------|----------|
| Prisma Schema | `packages/database/prisma/schema.prisma` |
| Prisma Client Export | `packages/database/src/client.ts` |
| Seed Data | `packages/database/prisma/seed-data.json` |
| Seed Script | `packages/database/prisma/seed.ts` |
| Migrations | `packages/database/prisma/migrations/` |
