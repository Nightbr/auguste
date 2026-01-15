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

## apps/web

- [ ] **More modern UI** - The UI is not modern enough, we need to make it more modern and user-friendly. Look at https://ai-sdk.dev/elements for inspiration.
- [ ] **Display family and member object on the right** - Dynamically display family and member object on the right of the screen when they are configured.
- [ ] **Display MemberAvailability and PlannerSettings on the right** - Dynamically display MemberAvailability and PlannerSettings on the right of the screen when they are configured.
- [ ] **Onboarding phase/Meal planner phase** - Dissociate the onboarding phase and the meal planner phase in the UI. Also related to saving session in database [need specifications].
- [ ] **Speech-to-text button for chat input** - Add a speech-to-text button to the chat input that allows users to speak and have their speech transcribed to text in the input field.
- [ ] **Hide empty chat messages** - When a message is empty, don't display it to avoid empty blocks in the chat UI.
- [ ] **Persistent chat history** - Make chat messages persistent (in memory store/localStorage) to keep chat history when navigating the app. Ensure separate stores for family and planner contexts. Add a clear/New chat button to reset the chat history.

## Recipe Manager

> New route `/recipes` with a dedicated Recipes tab

### Core Features

- [ ] **Create recipe with AI** - Describe a recipe in natural language and let AI generate a structured recipe with ingredients, steps, cooking time, servings, etc.
- [ ] **View recipes list** - Display all recipes in a searchable, filterable list with sorting options (by name, date created, cuisine type, etc.)
- [ ] **View recipe details** - Show full recipe details including ingredients, step-by-step instructions, nutritional info, and metadata
- [ ] **Link recipe to meal event** - Allow users to link existing recipes to meal events in their meal planning

### Later

- [ ] **Generate recipe image** - Use AI to generate an image for the recipe
- [ ] **Hand-drawn step illustrations** - Generate hand-drawn style illustrations for each recipe step [Optional]
- [ ] **Import recipes from external sources** - Import recipes from URLs, PDFs, or other recipe platforms

## Tech

- [ ] **Use drizzle-seed for database seeding** - Replace the current manual seeding script with [drizzle-seed](https://orm.drizzle.team/docs/seed-overview) for more robust and maintainable test data generation. This will provide better data variety, relationship handling, and faker integration.
- [ ] **Refactor core/db/index.ts** - Refactor the database connection to use a more modern and maintainable approach. Avoid putting everything in index.ts.
- [ ] **Agent evaluation and scoring** - Implement an evaluation framework to test agent behavior and quality. Use Mastra's built-in evaluation/scoring capabilities. First test case: verify agents always respond to the user with text after executing tool calls (no empty responses).
