# Page Map

```text
index.html
├── palm-reading-v2.html
│   └── future-predictor.html (linked from palm flow)
├── friend_or_lover_compatibility.html
├── future-predictor.html
├── tarot.html
├── lucky-today.html
├── dream-decoder.html
├── ask-the-genie.html
│   ├── palm-reading-v2.html
│   ├── dream-decoder.html
│   ├── love-compatibility.html
│   ├── friend_or_lover_compatibility.html
│   ├── lucky-today.html
│   ├── tarot.html
│   └── future-predictor.html
└── love-compatibility.html

Bottom navigation on feature pages:
Home → index.html
Explore → index.html#explore
Genie → ask-the-genie.html
Me → my-genie.html  [MISSING]
```

## Navigation risk

Because the site uses direct relative links rather than a router, file renames must update every inbound link. Add a link checker before large renaming/refactoring work.
