[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green.svg)](https://www.w3.org/WAI/WCAG21/quickref/?versions=2.1&levels=aa)

# rukh-ui

Web UI for [Rukh](https://github.com/w3hc/rukh) — build your own AI with personalized contexts.

## Pages

- `/` — lists available contexts grouped into four categories (Free, ZK API, For kids, Agentic); selecting one opens its interaction page
- `/[context]` — chat with the selected context
- `/[context]/edit` — add, edit, or delete the documents and links of a context
- `/dashboard` — overview of your contexts (create, open, edit, delete)

> The Rukh API is not wired up yet: pages currently run on mock data defined in `src/utils/contexts.ts`, whose types mirror the Rukh context DTOs.

## Fork

## Install

```bash
pnpm i
```

## Run

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## License

GPL-3.0
