# Architecture

## Current architecture — verified

AskGenie247 is a no-build static frontend composed primarily of standalone HTML pages with embedded CSS/JavaScript plus a small shared AI client.

```text
askgenie247/
├── index.html
├── palm-reading-v2.html
├── friend_or_lover_compatibility.html
├── future-predictor.html
├── tarot.html
├── lucky-today.html
├── dream-decoder.html
├── ask-the-genie.html
├── love-compatibility.html
├── config.json
├── js/
│   └── askgenie-ai.js
└── images/
    ├── genie-logo.png
    └── genie-mark.png
```

## Frontend

Each feature page owns most of its CSS, translations, state, rendering, fallback logic, and interaction code. This makes each page easy to deploy independently but creates duplication across navigation, language handling, wait animations, and visual components.

## Shared AI client

`js/askgenie-ai.js`:

1. fetches `config.json` with `cache: no-store`;
2. reads Supabase URL, anon key, and Edge Function name;
3. POSTs to `/functions/v1/<functionName>`;
4. passes `type`, `language`, `payload`, and optional `imageDataUrl`;
5. expects `{ ok: true, reading: ... }`.

## Backend

**MISSING:** Edge Function source. The frontend points to a Supabase Edge Function named `ask-genie-ai`. Its internal provider calls, prompts, schemas, authentication policy, abuse controls, and logging cannot be verified from this ZIP.

## Data persistence

**MISSING/UNVERIFIED:** no frontend Supabase database client usage or SQL/migrations are present in this snapshot. Current page state is primarily in-memory plus language preference in `localStorage`.

## Recommended evolution

Keep the static deployment model if it remains convenient, but extract repeated frontend infrastructure into shared files in stages:

- `js/i18n.js`
- `js/navigation.js`
- `js/ai-wait.js`
- `css/tokens.css`
- `css/components.css`

Do this incrementally; avoid a framework migration solely for architectural neatness unless product complexity requires it.
