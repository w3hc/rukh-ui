# Changelog

## [Unreleased]

### Added

- New context dialog: a **Preferred model** select and an optional **Creator name** field. The Rukh API's `CreateContextDto` has always accepted `model` and `creatorName`, but the dialog never sent either — `model` pins every `/ask` against the context to one model (`mistral`, `anthropic`, `openai`, `anthropic-web-search`), overriding the asker's own choice, and `creatorName` is stored alongside `creatorAddress` and returned by `GET /context`. Both are omitted from the request body when left empty, so the default behaviour is unchanged. Adds a `ContextModel` type to `src/utils/api.ts` (a superset of `RukhModel`, which has no web-search variant) and a `Select` component (`src/components/ui/select.tsx`) wrapping Chakra's `NativeSelect` in the `Input` styling — native rather than portalled so it behaves inside a Dialog.
- `docs/ROADMAP.md` — shared roadmap for `rukh-ui` and the Rukh API, covering the context schema (`instructions`, `capabilities`, `audience`, `retention`, `routing`, `billing`), the three profiles it is meant to express (generalist — teachers & pupils, the priority — ZK API, deprioritised), a Next.js route layer that resolves routing between Rukh and zk-api and applies `@redactpii/node` PII redaction, Stripe billing for creators, and the milestones from privacy foundations through to the tool loop.

### Changed

- Settings page, `PasswordModal` and `Spinner` realigned with the genji template: all of their user-facing text now comes from `src/translations/index.ts` instead of being hardcoded in English, so `/settings` is fully localized in the 10 supported locales. This also drops the AI security-inspection panel (`inspect()` from `w3pk`), which genji disabled upstream; `window.w3pk.inspect()` / `inspectNow()` are still exposed from `src/context/W3PK.tsx` for console use.
- Translations completed from genji: the `settings` section (~280 keys) and the `passwordModal` section added across all 10 locales, plus `common.srLoadingText`, `common.loading`, `common.notAvailable` and `common.close`, and `home.messageSignedTitle` / `home.messageSignedDescription`. Rukh's own `navigation` (`dashboard`, `docs`, `settings`) is kept over genji's (`about`, `settings`), and genji's `about` section is omitted — there is no `/about` route here.
- Dependencies realigned with the genji template (`3.1.0`): `next` and `eslint-config-next` `^16.2.10` → `^16.3.1`, `react`/`react-dom` `^19.2.7` → `^19.2.8`, `@chakra-ui/react` `^3.36.0` → `^3.36.1`, and `@types/node`, `@types/react`, `@types/react-dom` and `prettier` bumped to match.

### Fixed

- Build verification on `/settings` failed with `TypeError: Failed to fetch`. `getCurrentBuildHash()` fetches the published bundle from `https://unpkg.com/w3pk@<version>/dist` to hash it, but `unpkg.com` was missing from the CSP `connect-src` in `next.config.ts`, so the browser blocked the request before it left the page. Added it. The same gap exists upstream in genji.
- Restored the security headers `next.config.ts` lost in the initial refactor. The file had been reduced to the `optimizePackageImports` experiment alone, so the app shipped with no Content-Security-Policy, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` or HSTS — a gap that only shows up in production. Genji's block is back, with `connect-src` unioned with the Rukh API origin derived from `NEXT_PUBLIC_RUKH_API_URL` (defaulting to `http://localhost:3000` in development) so cross-origin API calls are not blocked by the policy.
- Restored `common.register` across all 10 locales; the translation transposition dropped it. It is currently unused (`LoginButton` renders `t.header.createAccount`), so it can be removed deliberately if it is genuinely dead.
- Official app URL is now `https://rukh.it`: `metadataBase` in `src/app/metadata.ts` pointed at `https://w3pk.w3hc.org` (a leftover from the w3pk template), so every relative Open Graph / Twitter image resolved against the wrong host; `openGraph.url` added alongside it, and the `/docs` share-link example falls back to `https://rukh.it` before hydration. The Rukh API's own URL (`NEXT_PUBLIC_RUKH_API_URL`, `https://rukh.w3hc.org`) is unchanged.

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
