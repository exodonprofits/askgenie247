# Security and Privacy

## Verified security-positive pattern

The shared AI client explicitly states that the private OpenAI/API key belongs in Supabase Edge Function secrets, not the frontend. Preserve this architecture.

## Key risks to review

### Public Supabase anon key
Expected to be public, but backend function authorization, rate limits, and any database RLS must be configured safely. Backend source is missing from this snapshot, so this cannot be verified here.

### Personal content
Palm images, dreams, relationship details, names, and personal questions can be sensitive to users even when the product is entertainment. Avoid retaining them unless necessary and disclosed.

### Image uploads
Validate accepted types and size on both client and server. Strip unnecessary metadata where appropriate. Do not trust filename/MIME alone.

### AI abuse/cost
Rate-limit the Edge Function and protect against automated high-volume requests. Validate request size and type before sending content to the AI provider.

### HTML rendering
When rendering AI text, prefer `textContent` or sanitization rather than inserting untrusted model/user content as raw HTML.

## Recommended privacy baseline

Document what is sent to the AI service, whether readings/images are stored, retention duration, deletion options, analytics usage, and third-party processors before scaling public traffic.
