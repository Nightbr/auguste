# Auguste - TODO

## Onboarding Agent

### Session & Authentication

- [ ] **Save session in database** - Persist user sessions to the database. We will build a secure mechanism later (Magic link with email or any auth session)

### Data Accuracy

- [ ] **Database call on recap** - On the recap/summary, make a call to the database to fetch accurate data and avoid hallucination from the AI model. This will be solved with the working memory.

### Flow Improvements

- [ ] **Resume from existing family data** - If there is already a family configured, read the data from the database and continue the conversation from there. If everything is configured, ask if there are any updates to do or go to the next step (Meal planning - TODO later)

### Bugs

- [ ] **PlannerSettings notification CRON is not working** - "Il semble que l'outil ait encore du mal à interpréter "tous les mercredis à 9h du matin" correctement et par défaut à dimanche 18h."

## Tech

- [ ] **Implement Drizzle ORM** - Replace the current SQLite implementation with Drizzle ORM. Generate Zod schemas from the database using drizzle-zod. Update all tools to use the new database layer.
- [ ] **Create a monorepo with pnpm** - Replace the current pnpm workspace with a monorepo. This will allow us to share code between the different packages. Package will be `@auguste/core` that will include the domain layer and the ai layer. Later we will introduce `@auguste/server` and `@auguste/web` for the web app.
