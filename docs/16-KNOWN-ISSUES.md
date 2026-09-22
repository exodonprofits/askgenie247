# Known Issues and Gaps

## 1. Missing `my-genie.html`

**VERIFIED:** multiple pages link to `my-genie.html`, but the file is not in this project snapshot. This creates a broken navigation destination unless production supplies it separately.

## 2. Missing Edge Function source

**VERIFIED:** frontend calls Supabase function `ask-genie-ai`, but its source is absent. This prevents complete review of prompts, model, response schemas, security, rate limiting, and secret handling.

## 3. Feature config mismatch

**VERIFIED:** `config.json` feature flags list `tarot`, `future`, `compatibility`, `palm`, and `lucky`, but the shared AI client additionally implements `dream`, `love`, and `chat`. Decide whether feature flags should include all active modules or be removed if unused.

## 4. External HEIC dependency

**VERIFIED:** Palm Reading loads `heic2any` from jsDelivr. This can be blocked by browser/privacy/network policy and has already appeared in project debugging as a blocked dependency.

## 5. Static asset/server errors observed during development

**KNOWN FROM PROJECT DEBUGGING:** production previously returned HTTP 500 for `/js/askgenie-ai.js` and `/favicon.ico`. The file exists in this ZIP, so deployment/server configuration should be checked if the error persists.

## 6. No favicon in snapshot

**VERIFIED:** no `favicon.ico` is present in this ZIP.

## 7. Repeated page infrastructure

**VERIFIED:** translations, navigation, wait-state styling, and other patterns are duplicated across standalone pages. This increases drift risk.

## 8. No automated tests

**VERIFIED:** no test/build/package configuration is included.
