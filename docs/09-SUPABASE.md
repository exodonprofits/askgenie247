# Supabase

## Verified configuration

`config.json` contains a Supabase project URL, public anon key, and AI Edge Function name (`ask-genie-ai`). The public anon key is used by the browser to invoke the function.

A Supabase anon key is designed to be public **only when backend authorization/RLS/function controls are correctly configured**. Never place a service-role key or AI-provider secret in this repository.

## Missing backend source

This ZIP does not contain:

- `supabase/functions/ask-genie-ai/...`
- migrations/schema;
- RLS policies;
- function secret definitions;
- deployment config for the function.

Therefore those pieces must be reviewed separately before making security claims.

## Recommended repository structure

```text
supabase/
├── functions/
│   └── ask-genie-ai/
│       └── index.ts
└── migrations/
```

If backend source exists elsewhere, bring a sanitized/version-controlled copy into the project so AI agents can understand the complete request contract without seeing production secrets.

## Usage limits and cost logging (added 2026-09-25)

**VERIFIED:** `supabase/functions/ask-genie-ai/index.ts` is the deployed source (v8). The Supabase project is shared with other GenieSphere products, so every AskGenie247 database object uses the `askgenie_` prefix.

- **Daily free limits** per visitor, keyed by a salted SHA-256 of the caller IP (raw IPs are never stored):
  - `reading`: new readings, default 8/day
  - `chat`: follow-ups + Ask Genie messages, default 15/day
  - global circuit breaker: 500/day per kind across all visitors
  - Days reset at 00:00 UTC. Over the limit, the function returns HTTP 429 with `code: "DAILY_LIMIT"` (visitor) or `"BUSY"` (global) and does **not** call OpenAI.
- **Request caps:** 4,000-char message, 30,000-char payload, ~4.5 MB image; chat history trimmed to the last 10 messages.
- **Cost log:** `askgenie_request_log` stores type, kind, status, model, tokens and latency per request. No user content, no IP.
- **Tables/function:** `askgenie_daily_usage`, `askgenie_request_log`, `askgenie_claim_usage()`. RLS is on with no policies, and the function is executable by `service_role` only.
- If the database is unreachable, limits fail open; the OpenAI account budget is the backstop.

### Optional Edge Function secrets

| Secret | Default | Purpose |
|---|---|---|
| `ALLOWED_ORIGINS` | unset (any origin) | Comma-separated site origins allowed to call the function |
| `DAILY_READING_LIMIT` | 8 | New readings per visitor per day |
| `DAILY_CHAT_LIMIT` | 15 | Follow-ups/chat per visitor per day |
| `DAILY_GLOBAL_LIMIT` | 500 | All visitors combined, per kind, per day |
| `RATE_LIMIT_SALT` | built-in | Salt for visitor hashing |

### Useful queries

```sql
-- Requests, tokens and limit hits per day
select created_at::date as day, status, count(*),
       sum(input_tokens) as input_tokens, sum(output_tokens) as output_tokens
from askgenie_request_log group by 1, 2 order by 1 desc, 2;

-- Distinct visitors per day (and how many hit the reading limit)
select day, count(*) filter (where visitor_hash <> '__global__') as visitors,
       count(*) filter (where kind = 'reading' and used >= 8) as hit_reading_limit
from askgenie_daily_usage group by 1 order by 1 desc;
```

## Tip link

`config.json` → `support.tipUrl`. When set (Ko-fi, Buy Me a Coffee, a Stripe Payment Link…), `js/askgenie-ai.js` adds a bilingual tip row under the Share button on every reading page and a tip button on the daily-limit notice. Leave it empty to hide both.
