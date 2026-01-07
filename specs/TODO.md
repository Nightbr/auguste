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
