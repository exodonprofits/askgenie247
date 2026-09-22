# Testing

## Current state

**MISSING:** no automated test framework is included in this snapshot.

## Manual smoke-test matrix

For every feature page:

1. Load directly by URL.
2. Switch EN → VI → EN.
3. Reload and verify language persists.
4. Complete minimum valid inputs.
5. Trigger primary action.
6. Verify waiting animation does not clip/lock UI.
7. Verify AI-success rendering.
8. Simulate AI failure/offline and verify graceful handling.
9. Try follow-up question if available.
10. Test retry/reset.
11. Test share/clipboard fallback if present.
12. Test Home / Explore / Genie / Me links.
13. Check console for errors.
14. Test narrow phone viewport and at least one larger phone viewport.

## Palm-specific

- JPEG
- PNG
- HEIC where supported
- oversized image
- invalid/non-image file
- CDN blocked scenario for `heic2any`

## Recommended automation

Add a lightweight browser test suite (for example Playwright) for page-load, broken-link, language-toggle, and mocked AI-contract tests before major refactors.
