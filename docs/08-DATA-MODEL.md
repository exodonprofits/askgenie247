# Data Model

## Current verified persistent data

The only clearly verified client-side persistent state in this repository is:

```text
localStorage.askgenieLang = "en" | "vi"
```

Feature reading state is generally held in page JavaScript variables during the session.

## Database

**MISSING:** no SQL migrations, generated database types, or direct frontend table queries are present in this snapshot. Although Supabase is used for the Edge Function, that does not prove a database schema is used for AskGenie247 readings.

## Recommended future model if saved readings/accounts are added

Do not implement this merely because it appears here; it is a design recommendation.

Potential entities:

- `profiles`
- `readings`
- `reading_messages`
- `user_preferences`
- `usage_events`

Keep sensitive/free-text content retention minimal and explicit. Define deletion/retention rules before storing palm images, dreams, or personal relationship questions.
