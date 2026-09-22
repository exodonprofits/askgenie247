# API and External Integrations

## Supabase Edge Function

Primary runtime integration. See `docs/06-AI-SYSTEM.md` and `docs/09-SUPABASE.md`.

## heic2any

`palm-reading-v2.html` loads `heic2any@0.0.4` from jsDelivr to help handle HEIC images.

### Risk

External CDN scripts may be blocked by tracking/content prevention, CSP, outages, or network policy. A recent browser console report associated with this project showed tracking prevention blocking access to this CDN dependency.

### Recommendation

Consider self-hosting the required library or providing a clear JPEG/PNG fallback path. If self-hosting, verify license requirements and pin the exact version.

## Browser APIs

Pages use browser features such as `localStorage`, `navigator.language`, sharing/clipboard capabilities, and file/image handling. Feature-detect optional APIs and retain fallbacks.
