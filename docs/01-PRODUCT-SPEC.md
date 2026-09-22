# Product Specification

## Product name
AskGenie247

## Product category
Entertainment, self-reflection, playful AI-guided readings.

## Primary user goal
Get a quick, visually engaging interpretation about a personal question, relationship, dream, palm, tarot spread, luck, or possible future direction, then optionally ask follow-up questions.

## Functional requirements — verified

### Home
- Present a branded landing experience.
- Present mystery cards for the eight current experiences.
- Navigate directly to static HTML feature pages.
- Support English and Vietnamese UI.
- Persist language preference in `localStorage`.

### Feature experience pattern
Feature pages generally provide:
- back navigation;
- language toggle;
- guided inputs/selections;
- primary action to generate/read/decode;
- animated waiting state;
- structured result cards;
- AI personalization when available;
- local fallback content on at least several pages;
- follow-up question/chat affordances on multiple pages;
- share/retry actions;
- bottom navigation.

### Palm Reading
**VERIFIED:** accepts/handles palm-image input and calls AI type `palm`. It includes HEIC conversion support through `heic2any` and follow-up-style reading behavior.

### Friend or Lover?
**VERIFIED:** collects compatibility context and calls AI type `compatibility`.

### Future Predictor
**VERIFIED:** calls AI type `future`; the page is designed as reflective future exploration rather than guaranteed prediction.

### Tarot
**VERIFIED:** supports one-card and three-card spreads, focus selection, card rendering, AI interpretation, follow-up questions, fallback content, and sharing.

### Lucky Today
**VERIFIED:** generates a local daily pattern and calls AI type `lucky`; supports follow-up questions and sharing.

### Dream Decoder
**VERIFIED:** collects dream description, emotion, recurring status, and standout detail; calls AI type `dream`; returns structured reflective sections and follow-up chat.

### Ask Genie
**VERIFIED:** offers topic-based conversational asking and calls AI type `chat`.

### Love Compatibility
**VERIFIED:** calls AI type `love`.

## Non-functional requirements inferred from current implementation

- Mobile-first responsive UI.
- No private AI secret in client code.
- Graceful behavior when AI is unavailable.
- EN/VI parity for visible UI and generated language requests.
- Short perceived wait through animation/status messaging.
- Clear entertainment/self-reflection framing.

## Out of scope unless explicitly added

The current snapshot does not verify accounts, subscriptions, payment processing, saved reading history, social graph, push notifications, admin CMS, or a persistent user profile.
