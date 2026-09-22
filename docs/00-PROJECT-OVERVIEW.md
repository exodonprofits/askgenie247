# Project Overview

## Status

**VERIFIED:** AskGenie247 is a static, mobile-first bilingual web app with multiple entertainment/self-reflection experiences. Eight feature pages are linked from the homepage. Seven pages use a shared AI client; the homepage itself does not directly call AI.

## Core idea

AskGenie247 packages playful “mystery” experiences into a consistent Genie-branded interface. The strongest product pattern is:

```text
Choose an experience → provide context/input → show an animated wait state →
receive a structured reading → ask follow-up questions → share/retry/explore
```

## Current experiences

Palm Reading, Friend or Lover?, Future Predictor, Tarot, Lucky Today, Dream Decoder, Ask Genie, and Love Compatibility.

## Product principles inferred from the implementation

- Fun first, but not deceptive certainty.
- Reflection is more important than literal prediction.
- Fast, guided inputs are preferable to long forms.
- AI output should feel personalized and structured.
- Follow-up questions extend a one-shot reading into a conversation.
- English and Vietnamese are first-class user experiences.
- Mobile is the primary interaction surface.

## Snapshot limitations

This repository does not include the server-side `ask-genie-ai` Edge Function or database schema, so backend prompt engineering, AI provider/model, rate limiting, persistence, and logging are not verifiable here.
