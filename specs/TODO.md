# Auguste - TODO

> [!NOTE]
> **Workflow:** When a task is completed, it should be removed from this document instead of being checked off.

## Onboarding Agent

### Session & Authentication

- [ ] **Save session in database** - Persist user sessions to the database. We will build a secure mechanism later (Magic link with email or any auth session) [need specifications]

### Data Accuracy

- [ ] **Database call on recap** - On the recap/summary, make a call to the database to fetch accurate data and avoid hallucination from the AI model. This will be solved with the working memory.

### Flow Improvements

- [ ] **Resume from existing family data** - If there is already a family configured, read the data from the database and continue the conversation from there. If everything is configured, ask if there are any updates to do or go to the next step (Meal planning - TODO later)

### Bugs

- [ ] **PlannerSettings notification CRON is not working** - "Il semble que l'outil ait encore du mal à interpréter "tous les mercredis à 9h du matin" correctement et par défaut à dimanche 18h."

## apps/web

- [ ] **More modern UI** - The UI is not modern enough, we need to make it more modern and user-friendly. Look at https://ai-sdk.dev/elements for inspiration.
- [ ] **Display family and member object on the right** - Dynamically display family and member object on the right of the screen when they are configured.
- [ ] **Display MemberAvailability and PlannerSettings on the right** - Dynamically display MemberAvailability and PlannerSettings on the right of the screen when they are configured.
- [ ] **Onboarding phase/Meal planner phase** - Dissociate the onboarding phase and the meal planner phase in the UI. Also related to saving session in database [need specifications].

## Tech

- [ ] **Use drizzle-seed for database seeding** - Replace the current manual seeding script with [drizzle-seed](https://orm.drizzle.team/docs/seed-overview) for more robust and maintainable test data generation. This will provide better data variety, relationship handling, and faker integration.
- [ ] **Refactor core/db/index.ts** - Refactor the database connection to use a more modern and maintainable approach. Avoid putting everything in index.ts.
