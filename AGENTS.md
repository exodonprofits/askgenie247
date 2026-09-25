# AGENTS.md — AskGenie247 AI Developer Guide

This file is the first instruction set for any AI coding agent or developer working in this repository.

## 1. Understand before editing

Before changing code, read `README.md`, this file, and the relevant documents in `/docs`. Inspect the actual implementation of the page being changed and its dependencies. Do not infer a backend table, endpoint, prompt, environment variable, or feature merely because it would be convenient.

## 2. Source-of-truth hierarchy

1. Current repository code and assets.
2. Deployed backend source/configuration, when separately supplied.
3. Product documentation marked **VERIFIED**.
4. Explicit owner instructions for the current task.
5. Documentation marked **INFERRED** or **RECOMMENDED**.

If documentation conflicts with current code, identify the conflict instead of silently rewriting behavior.

## 3. Preserve working behavior

Unless the task explicitly requests a redesign/refactor:

- preserve existing page purpose and navigation;
- preserve English/Vietnamese support;
- preserve `askgenieLang` preference behavior;
- preserve mobile-first layouts;
- preserve local fallback behavior where it exists;
- preserve existing AI request contracts unless frontend and backend are updated together;
- avoid deleting unrelated code while fixing one feature;
- do not rename files casually because pages use direct relative links.

## 4. AI integration contract

Frontend AI calls go through `window.AskGenieAI` in `js/askgenie-ai.js`. It loads `config.json`, then POSTs JSON to the configured Supabase Edge Function.

Current request envelope:

```json
{
  "type": "tarot | future | compatibility | palm | lucky | dream | love | chat",
  "language": "en | vi",
  "payload": {},
  "imageDataUrl": "optional data URL"
}
```

The frontend expects a successful backend response shaped approximately as:

```json
{
  "ok": true,
  "reading": {}
}
```

Do not put private provider API keys in frontend code. Keep private keys in backend/Edge Function secrets.

## 5. Product safety and trust

AskGenie247 is entertainment/self-reflection. Do not convert speculative readings into claims of certainty. Maintain or improve clear language that readings are not scientific guarantees of future events. For sensitive domains, avoid presenting fortune-style output as professional medical, legal, financial, or safety advice.

## 6. Bilingual requirements

Every new user-facing feature should be reviewed in both English and Vietnamese. Avoid adding visible strings only in JavaScript without a Vietnamese equivalent. Preserve the current language across page navigation through the shared `askgenieLang` local-storage key.

## 7. UI conventions observed in the current product

The product uses a dark mystical/mobile visual language with purple/blue surfaces, gold accents, rounded cards, emoji/iconography, a Genie brand mark, prominent primary actions, bottom navigation, and animated AI waiting states. New work should feel native to the existing system unless redesign is explicitly requested.

## 8. Mobile behavior

Several pages are intentionally mobile-first and some explicitly display a mobile-only message on wide screens. Test narrow viewport behavior before considering a task complete. Do not assume desktop is the primary surface.

## 9. Dependency rules

Prefer existing local assets and shared code. If adding a CDN dependency, document why it is needed, what happens if it is blocked, and whether it should later be self-hosted. `palm-reading-v2.html` currently depends on jsDelivr for `heic2any`.

## 10. Missing components

Do not fabricate missing code. In this snapshot:

- `my-genie.html` is referenced but absent.
- The `ask-genie-ai` Edge Function source now lives in `supabase/functions/ask-genie-ai/index.ts` (deployed v8). Keep it in sync with what is deployed.
- Database schema/migrations are absent.
- Automated tests/build tooling are absent.

When a requested change depends on one of these, ask for or retrieve the missing source if necessary, or clearly scope the change to what can be verified.

## 11. Change procedure

For non-trivial changes:

1. Identify affected files and flow.
2. Identify shared dependencies.
3. Preserve unrelated behavior.
4. Implement the smallest coherent change.
5. Test English and Vietnamese.
6. Test primary mobile viewport.
7. Test AI-success and AI-failure/fallback paths when applicable.
8. Check browser console/network for new errors.
9. Update relevant `/docs` and `CHANGELOG.md` if behavior or architecture changed.

## 12. Definition of done

A change is not done merely because the page renders. It should have no new obvious console errors, broken links introduced by the change, clipped primary controls on mobile, untranslated new UI, exposed secrets, or mismatched frontend/backend request contracts.
