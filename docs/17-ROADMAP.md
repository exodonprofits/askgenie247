# Roadmap

This roadmap is **RECOMMENDED**, not a claim about committed product plans.

## Phase 1 — Stabilize current product

- Fix/decide `my-genie.html` destination.
- Resolve production 500/static-file issues.
- Add favicon and basic metadata consistency.
- Verify every AI request type end-to-end.
- Align `config.json` feature flags with active modules.
- Test all pages EN/VI on mobile.
- Decide whether to self-host HEIC conversion dependency.

## Phase 2 — Bring backend into source control

- Add sanitized Supabase Edge Function source.
- Document each request/response schema.
- Add prompt/schema versioning.
- Add rate limiting and structured errors.
- Add deployment instructions for function secrets.

## Phase 3 — Reduce frontend duplication

- Shared design tokens.
- Shared language helper.
- Shared navigation.
- Shared AI waiting component.
- Shared error/fallback patterns.

Do this incrementally rather than rewriting the site into a framework all at once.

## Phase 4 — Quality and observability

- Automated smoke tests.
- Broken-link test.
- AI contract tests with mocked responses.
- Privacy-conscious analytics for feature usage/error rates.
- Error logging without unnecessary personal content.

## Phase 5 — Product expansion

Only after current flows are stable, consider a real “My Genie” area for saved preferences/readings, optional accounts, richer cross-feature context, and additional mystery modules. Define privacy/retention before storing personal reading history or images.
