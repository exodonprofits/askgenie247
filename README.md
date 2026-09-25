# AskGenie247

AskGenie247 is a bilingual (English/Vietnamese), mobile-first entertainment and self-reflection web experience built around themed AI-assisted readings and conversational follow-ups.

## Current product

The repository currently contains these user-facing experiences:

| Experience | File | AI request type |
|---|---|---|
| Home / mystery picker | `index.html` | — |
| Palm Reading | `palm-reading-v2.html` | `palm` |
| Friend or Lover? | `friend_or_lover_compatibility.html` | `compatibility` |
| Future Predictor | `future-predictor.html` | `future` |
| Tarot | `tarot.html` | `tarot` |
| Lucky Today | `lucky-today.html` | `lucky` |
| Dream Decoder | `dream-decoder.html` | `dream` |
| Ask the Genie | `ask-the-genie.html` | `chat` |
| Love Compatibility | `love-compatibility.html` | `love` |

All AI-enabled pages share `js/askgenie-ai.js`, which loads public configuration from `config.json` and POSTs to the configured Supabase Edge Function.

## Product positioning

AskGenie247 should be treated as an **entertainment and self-reflection product**, not as a scientific, medical, legal, financial, or guaranteed future-prediction service. Existing pages already use language such as “for fun,” “self-reflection,” and warnings against treating readings as scientific predictions. Preserve that boundary.

## Quick start

This is currently a static-site project. Serve the project root through an HTTP server rather than opening files directly from disk, because the shared AI client fetches `config.json`.

Example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`.

For AI features to work, the Supabase project and the Edge Function configured in `config.json` must be deployed and reachable.

## AI architecture

```text
Browser page
   │
   ├── local UI / fallback content
   │
   └── js/askgenie-ai.js
          │
          ├── GET config.json
          │
          └── POST Supabase Edge Function /functions/v1/ask-genie-ai
                    │
                    └── server-side AI provider / prompt logic
```

The OpenAI/API secret must remain server-side. Do not put a private AI API key in HTML, JavaScript, or `config.json`.

## Languages

English (`en`) and Vietnamese (`vi`) are implemented in-page. Language preference is stored in `localStorage` under `askgenieLang`, with browser-language detection used when no preference exists.

## Important repository notes

- `my-genie.html` is referenced by bottom navigation but is **not present in this snapshot**.
- The Supabase Edge Function source is in `supabase/functions/ask-genie-ai/`, with its database migration in `supabase/migrations/`. See `docs/09-SUPABASE.md` for daily limits, secrets and cost logging.
- `config.json` enables `tarot`, `future`, `compatibility`, `palm`, and `lucky`, while the shared client also implements `dream`, `love`, and `chat`. The feature-flag schema therefore does not fully describe the current frontend.
- `palm-reading-v2.html` loads `heic2any` from jsDelivr; browser tracking/content policies can affect that dependency.

## Documentation

Start with:

1. `AGENTS.md` — rules for AI coding agents and developers.
2. `docs/00-PROJECT-OVERVIEW.md` — concise product overview and source-of-truth status.
3. `docs/01-PRODUCT-SPEC.md` — product behavior and requirements.
4. `docs/02-ARCHITECTURE.md` — technical architecture.
5. `docs/03-FEATURE-INVENTORY.md` — current feature/page inventory.
6. `docs/16-KNOWN-ISSUES.md` — gaps found during repository review.
7. `docs/17-ROADMAP.md` — recommended next stages.

## Documentation confidence labels

The documentation uses four labels:

- **VERIFIED** — directly observable in this repository snapshot.
- **INFERRED** — strongly suggested by code/UI, but not fully verifiable.
- **MISSING** — referenced or required but absent from this snapshot.
- **RECOMMENDED** — proposed future improvement, not current functionality.

## Repository principle

Future work should improve AskGenie247 without silently changing its existing product identity, bilingual behavior, mobile-first layout, or working feature flows. Read `AGENTS.md` before modifying code.
