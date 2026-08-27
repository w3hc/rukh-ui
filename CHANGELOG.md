# Changelog

## [Unreleased]

### Added

- `docs/ROADMAP.md` — shared roadmap for `rukh-ui` and the Rukh API, covering the context schema (`instructions`, `capabilities`, `audience`, `retention`, `routing`, `billing`), the three profiles it is meant to express (generalist — teachers & pupils, the priority — ZK API, deprioritised), a Next.js route layer that resolves routing between Rukh and zk-api and applies `@redactpii/node` PII redaction, Stripe billing for creators, and the milestones from privacy foundations through to the tool loop.

## [0.2.0] - 2026-08-26

### Security

- Context management (create/delete a context, upload/delete documents, add/delete/list links, list/read files) now requires a fresh SIWE (EIP-4361) signature from the context creator's w3pk wallet on every request, replacing the shared per-context password. `useW3PK().signSiwe(method, path)` signs a message scoped to that exact request; the Rukh API verifies the signature, its freshness, and that the signer matches the context's `creatorAddress` (see `../rukh`'s `SiweAuthGuard`).

### Fixed

- Dashboard "Login" button now behaves like the header's: it checks for an existing passkey credential and prompts for it directly, or opens the registration modal when none is found (previously it always called `login()` directly, so a returning user without a detectable credential would just get a silent failure instead of the option to register). Extracted the shared logic into a new `LoginButton` component used by both the header and the dashboard.
- `LoginButton`'s credential check now uses the same `hasLocalCredentials()` / `isNoPasskeyError` flow as genji's, instead of a bespoke IndexedDB/localStorage reimplementation; the registration modal also regained the "I already registered on another device" link to `/settings#restore-backup` that the extraction had dropped.
- Context edit page: editing a document always failed with "Could not load file content". `getFileContent` was parsing the response as JSON, but the Rukh API returns the file's raw markdown as plain text; it now reads the response body as text instead.

### Changed

- Homepage: contexts are now grouped into four categories — Free, ZK API, For kids, Agentic (`category` field added to `RukhContext`); removed the "Available contexts" heading and the "My dashboard" button
- Buttons restyled from solid purple to purple-border outline: "Interact" (homepage and dashboard), "+ New context" (dashboard), "+ Add document" and "+ Add link" (context edit page)
- All badges now have slightly more horizontal padding (theme-level badge recipe override)
- Context edit page: added right padding to the Documents and Links tabs
- Genji template sync: added `templateVersion` field to `package.json` (3.1.0)
- Added missing translation keys (`common.cancel`, the full `header.*` set) across all 10 locales, and localized the registration modal and header aria-labels that were previously hardcoded in English

### Security

- Genji template sync: pinned pnpm overrides for vulnerable transitive dependencies (`underscore`, `ws`, `brace-expansion`, `js-yaml`, `esbuild`)
