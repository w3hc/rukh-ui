# Changelog

## [0.2.0] - 2026-08-26

### Fixed

- Dashboard "Login" button now behaves like the header's: it checks for an existing passkey credential and prompts for it directly, or opens the registration modal when none is found (previously it always called `login()` directly, so a returning user without a detectable credential would just get a silent failure instead of the option to register). Extracted the shared logic into a new `LoginButton` component used by both the header and the dashboard.

### Changed

- Homepage: contexts are now grouped into four categories — Free, ZK API, For kids, Agentic (`category` field added to `RukhContext`); removed the "Available contexts" heading and the "My dashboard" button
- Buttons restyled from solid purple to purple-border outline: "Interact" (homepage and dashboard), "+ New context" (dashboard), "+ Add document" and "+ Add link" (context edit page)
- All badges now have slightly more horizontal padding (theme-level badge recipe override)
- Context edit page: added right padding to the Documents and Links tabs
- Genji template sync: added `templateVersion` field to `package.json` (3.1.0)

### Security

- Genji template sync: pinned pnpm overrides for vulnerable transitive dependencies (`underscore`, `ws`, `brace-expansion`, `js-yaml`, `esbuild`)
