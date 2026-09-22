# Decision Log

Use this file for durable architectural/product decisions so future developers and AI agents understand *why* the code works a certain way.

## Existing decisions inferred from code

### D-001 — Mobile-first standalone pages
**Status:** Existing / inferred  
**Decision:** Feature experiences are independent static HTML pages optimized primarily for mobile.  
**Consequence:** Easy static deployment, but shared UI logic is duplicated.

### D-002 — Shared Edge Function gateway
**Status:** Existing / verified  
**Decision:** Browser AI calls go through a shared Supabase Edge Function rather than directly to the AI provider.  
**Consequence:** Provider secrets can remain server-side and multiple experiences can share one gateway.

### D-003 — English/Vietnamese preference
**Status:** Existing / verified  
**Decision:** Use `askgenieLang` in `localStorage` and browser-language detection.  
**Consequence:** Language persists across standalone pages without an account.

### D-004 — Entertainment/self-reflection framing
**Status:** Existing / verified in multiple pages  
**Decision:** Readings are framed for fun and reflection, not scientific prediction.  
**Consequence:** Future content should preserve uncertainty and disclaimers.

## New decision template

### D-XXX — Title
**Date:** YYYY-MM-DD  
**Status:** Proposed / Accepted / Superseded  
**Context:**  
**Decision:**  
**Consequences:**  
**Files affected:**
