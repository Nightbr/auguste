# Database Management

Auguste uses **SQLite** with **Drizzle ORM** for local-first, type-safe data storage. This document outlines the workflows for managing the schema, migrations, and data seeding.

## 📁 Core Files

- **Schema**: `packages/core/src/domain/db/schema.drizzle.ts` - The single source of truth for the database structure.
- **Client**: `packages/core/src/domain/db/index.ts` - Initializes the Drizzle client with `better-sqlite3`.
- **Migrations Folder**: `packages/core/src/domain/db/migrations/` - Contains versioned SQL files and the `_journal.json`.
- **Migration Runner**: `packages/core/src/domain/db/migrate.ts` - Utility script to apply pending migrations.
- **Database File**: `.data/auguste.db` - The local SQLite database file.

## 🛠️ Workflows

### 1. Modifying the Schema

1.  Update the TypeScript definitions in `packages/core/src/domain/db/schema.drizzle.ts`.
2.  Generate a new migration file:
    pnpm run db:generate -- --name <descriptive_name>
    > [!IMPORTANT]
    > **Always provide a descriptive name.** Avoid the default random names (e.g., `married_slayback`) to keep the history readable.

### 2. Applying Migrations

Migrations are applied automatically in some environments, but you can run them manually:

```bash
pnpm run db:migrate
```

This uses the migration runner script to apply any SQL files in the `migrations/` folder that haven't been executed yet.

### 3. Seeding the Database

To populate your local database with demo data (Family, Members, Planner Settings):

```bash
pnpm run seed
```

The seed script uses Drizzle's `insert` and `onConflictDoUpdate` capabilities to ensure a clean and consistent state.

### 4. Verification

To verify that the database is working correctly after a change, you can run the verification script:

```bash
pnpm exec tsx scripts/verify-drizzle.ts
```

## 🏗️ Design Patterns

- **JSON Columns**: We use `mode: 'json'` for complex objects (dietary restrictions, preferences) to avoid manual stringification.
- **Enums**: All Drizzle enums are imported from `packages/core/src/domain/schemas/enums.ts` to ensure consistency between the database and the domain layer.
- **IDs**: Use the `generateId()` utility in `packages/core/src/domain/db/index.ts` to create unique IDs for new records.
- **Timestamps**: `createdAt` and `updatedAt` are managed using Drizzle defaults: `sql`(datetime('now'))`.

## ⚙️ Configuration

The database path is resolved relative to the project root. You can override it using the `AUGUSTE_DB_PATH` environment variable:

```bash
AUGUSTE_DB_PATH="./custom/path/to/db.sqlite" npm run dev
```
