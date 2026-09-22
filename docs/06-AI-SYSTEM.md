# AI System

## Frontend AI gateway

All current AI experiences use `js/askgenie-ai.js`. This is the preferred frontend integration point; feature pages should not independently embed private provider credentials.

## Request types

`tarot`, `future`, `compatibility`, `palm`, `lucky`, `dream`, `love`, `chat`.

## Transport

POST to the configured Supabase Edge Function with JSON content type and the public Supabase anon key as `apikey` and bearer authorization.

## Response expectation

The client requires an HTTP-success response whose JSON includes a truthy `ok`; it returns `data.reading` to the page. Error text is taken from `data.error` when available.

## Prompt system

**MISSING:** Prompt templates are presumably implemented server-side, but the Edge Function is not in this ZIP. Do not document any exact system prompt/model as current fact until the backend source is supplied.

## AI UX principles inferred from pages

- Give structured, scannable readings rather than an unbroken essay.
- Use the user’s selected context.
- Match English/Vietnamese.
- Use reflective language and avoid certainty about the future.
- Offer useful follow-up prompts.
- Have a graceful fallback when AI fails.

## Reliability recommendations

- Validate response schemas server-side and client-side.
- Return stable error codes in addition to messages.
- Add timeout handling.
- Add rate limiting/abuse controls server-side.
- Log request type, latency, status, and anonymized error metadata—not unnecessary personal content.
- Version prompt/output schemas so frontend and backend can evolve safely.
