# Changelog

## 2026-09-25 — Usage limits and tips

- Added the deployed `ask-genie-ai` Edge Function source to `supabase/functions/` and its migration to `supabase/migrations/`.
- Edge Function v8: per-visitor daily free limits (8 readings, 15 follow-ups/chat), a 500/day global circuit breaker, request size caps, optional `ALLOWED_ORIGINS`, per-request token logging, and a prompt rule declining unrelated tasks.
- `js/askgenie-ai.js`: bilingual "daily limit reached" notice on HTTP 429, and an optional bilingual tip row under Share driven by `config.json` → `support.tipUrl`.

## 2026-09-22 — Documentation baseline

- Added repository-level README and AI-agent instructions.
- Added reverse-engineered product/technical documentation under `/docs`.
- Documented current page inventory, AI client contract, bilingual behavior, known gaps, deployment assumptions, and recommended roadmap.
- Existing application HTML/JS/assets were copied without intentional functional modification.
