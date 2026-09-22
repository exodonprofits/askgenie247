# Deployment

## Frontend

**VERIFIED:** the project can be deployed as static files because there is no build system in this snapshot. Keep relative paths intact.

Required public files include all HTML pages, `config.json`, `js/askgenie-ai.js`, and the `images/` directory.

## Backend dependency

AI functionality requires the Supabase Edge Function configured in `config.json`. Frontend deployment alone is insufficient for AI readings.

## Deployment checklist

- Confirm `config.json` returns HTTP 200 and JSON.
- Confirm `js/askgenie-ai.js` returns HTTP 200 with JavaScript MIME type.
- Confirm images return HTTP 200.
- Confirm Edge Function accepts browser requests from the production origin.
- Test every AI request type.
- Test EN and VI.
- Test mobile viewport.
- Check console/network for 404/500/CORS errors.
- Check that `my-genie.html` navigation is either implemented, hidden, or intentionally handled.
- Check favicon if one is referenced/deployed.

## Server-error note

A `500` for a static `.js` or favicon usually indicates hosting/server configuration rather than normal “file not found” behavior. Verify actual file path, permissions, rewrites, `.htaccess`/server rules, and MIME/static-file handling.
