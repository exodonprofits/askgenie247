# User Flows

## A. Discovery flow

1. User opens `index.html`.
2. Language is restored/detected.
3. User chooses a mystery card.
4. Browser navigates to the corresponding standalone page.

## B. Standard reading flow

1. User enters/selects context.
2. Page validates required fields.
3. User starts the reading.
4. UI shows a themed waiting animation/message.
5. Page calls `window.AskGenieAI.<feature>()`.
6. On success, structured AI result is rendered.
7. On failure, page may render local fallback content or an error/fallback state.
8. User can retry, share, navigate, or ask a follow-up where supported.

## C. Follow-up flow

1. User receives a reading.
2. User selects a suggested question or types their own.
3. Page sends relevant original context plus follow-up context to AI.
4. Answer is appended/displayed without requiring a new full reading.

## D. Language flow

1. Read `askgenieLang` from `localStorage`.
2. If absent, detect whether browser language starts with `vi`.
3. Apply `en` or `vi` strings.
4. Toggle writes new preference to `localStorage`.
5. AI calls receive the same language code.

## E. Palm image flow

**VERIFIED at frontend level:** Palm Reading includes image processing/upload behavior and the shared AI client supports `imageDataUrl`. HEIC conversion support is loaded from a CDN. Server-side image handling is not included in this snapshot.
