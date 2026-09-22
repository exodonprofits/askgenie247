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
