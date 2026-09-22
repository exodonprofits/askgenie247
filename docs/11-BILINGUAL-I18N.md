# Bilingual / Internationalization

## Verified languages

- English (`en`)
- Vietnamese (`vi`)

## Current implementation

Translations are primarily embedded in each HTML page as JavaScript objects. Elements use attributes such as `data-i18n` and, on some pages, `data-i18n-placeholder`. The language preference is stored under `askgenieLang`.

## Detection

When no saved preference exists, pages generally select Vietnamese when `navigator.language` begins with `vi`; otherwise English.

## AI synchronization

Feature pages pass the active language to the shared AI client so generated readings can match the UI language.

## Development rules

- Every new visible string needs EN and VI versions.
- Test placeholder text, alerts, loading messages, buttons, result labels, follow-up prompts, and disclaimers—not only headings.
- Vietnamese text often occupies different width; test clipping/wrapping on mobile.
- Keep terminology consistent across pages (Genie, reading, result, retry, share, etc.).

## Recommended future refactor

Move repeated translation strings into shared locale files only when doing so can be tested across all pages. The current duplication is imperfect but functional; a rushed centralization could break standalone pages.
