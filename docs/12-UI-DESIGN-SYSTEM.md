# UI Design System

## Current visual language — inferred from code

AskGenie247 uses a mystical but friendly dark interface: deep dark backgrounds, purple/blue surfaces, gold highlights, rounded cards/pills, soft glow effects, emoji and Genie imagery, prominent primary buttons, and compact mobile typography.

## Repeated components

- top header with back button / page title / language toggle;
- hero/introduction block;
- step or input cards;
- choice chips/buttons;
- primary CTA;
- AI waiting animation;
- structured result cards;
- quick follow-up question chips;
- Genie chat panel;
- share/retry actions;
- fixed/sticky bottom navigation.

## Mobile-first rule

Some pages explicitly communicate that the experience is designed for mobile when the viewport is wide. Treat mobile layouts as primary.

## Recommended design-token extraction

Before large visual expansion, extract common values for background, surface, text, muted text, gold/accent, radius, spacing, and shadows into a shared CSS token file. Preserve page-specific art direction on top of those tokens.

## Accessibility recommendations

- Add/verify visible focus states.
- Ensure buttons have accessible names.
- Verify contrast of muted/gold text.
- Avoid relying on color alone for selection.
- Respect reduced-motion preferences for elaborate wait animations.
- Ensure uploaded-image controls are keyboard accessible.
