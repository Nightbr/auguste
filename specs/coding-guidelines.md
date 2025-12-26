# Auguste - Coding Guidelines

## Type System

### Schemas as Source of Truth

**Rule:** Always use Zod schemas from `src/domain/schemas/` as the single source of truth for types.

- Import types from domain schemas, never define inline interfaces for domain entities
- Use `z.infer<typeof Schema>` to derive TypeScript types from Zod schemas
- For database row types that differ from domain types (e.g., JSON fields stored as strings), use TypeScript `Omit` and intersection types

**Good:**
```typescript
import { Family, Member, PlannerSettings } from '../../domain';

// For SQLite rows where JSON is stored as string
type MemberRow = Omit<Member, 'dietaryRestrictions' | 'allergies' | 'foodPreferences'> & {
  dietaryRestrictions: string;
  allergies: string;
  foodPreferences: string;
};
```

**Bad:**
```typescript
// DON'T do this - duplicates the schema
interface MemberRow {
  id: string;
  familyId: string;
  name: string;
  type: 'adult' | 'child';
  // ... etc
}
```

### Enums

- Use `const` objects instead of TypeScript `enum`
- Enum keys and values should be identical
- Export both the const object and its derived type

**Example:**
```typescript
export const MealType = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
} as const;

export type MealType = (typeof MealType)[keyof typeof MealType];
```

## Tools

### Schema Usage in Tools

- **Input schemas:** Use exported schemas from domain (e.g., `CreateFamilyInputSchema`)
- **Output schemas:** Use exported schemas from domain (e.g., `FamilySchema`)
- **Row-to-entity conversion:** Create helper functions to transform DB rows to domain types

### Tool Naming

- Tool IDs should be kebab-case: `create-family`, `get-member-by-name`
- Tool files should match the domain: `family-tools.ts`, `member-tools.ts`

## File Organization

### Domain Layer (`src/domain/`)
- Pure business logic, no AI dependencies
- Schemas define the contract for all data

### Mastra Layer (`src/mastra/`)
- Tools consume domain schemas
- Agents compose tools
- No direct schema definitions in this layer

