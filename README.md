# Product Hunt QA Automation (Spare Take-Home)

Bun + TypeScript framework for **API (GraphQL)** and **E2E (Playwright)** testing against [Product Hunt](https://www.producthunt.com), built for the Spare QA Engineering assignment.

## What's included

| Area | Details |
| --- | --- |
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript (strict) |
| E2E | Playwright — 8 scenarios, headless, CI-ready |
| API | Typed GraphQL client (`fetch`) + `bun:test` — 12 assertions across auth, posts, topics |
| Docs | [Test strategy](docs/test-strategy.md) · [Exploratory findings](docs/exploratory-findings.md) |

## Repository layout

```
├── docs/                  # Strategy + exploratory notes
├── src/
│   ├── api/               # GraphQL client, queries, types
│   ├── config/            # Env configuration
│   └── e2e/
│       ├── components/    # Locator-only component classes
│       └── pages/         # Page actions (compose components)
├── tests/
│   ├── api/               # Bun test suite
│   └── e2e/               # Playwright suite
├── playwright.config.ts
└── .github/workflows/ci.yml
```

## Prerequisites

1. **Bun** ≥ 1.1 — https://bun.sh  
2. **Product Hunt developer token** (API suite only) — create an application at  
   https://www.producthunt.com/v2/oauth/applications  
3. Chromium (installed via Playwright on first setup)

## Setup

```bash
# clone your repo, then:
cp .env.example .env
# edit .env and set PRODUCT_HUNT_TOKEN=...

bun install
bunx playwright install chromium
```

## Running tests

```bash
# API (GraphQL) — requires PRODUCT_HUNT_TOKEN
bun run test:api

# E2E (web) — no token required
bun run test:e2e

# Both
bun run test

# Headed / UI mode (local debugging)
bun run test:e2e:headed
bun run test:e2e:ui
```

## Architecture decisions

1. **Two runners on purpose** — `bun:test` keeps API tests fast and dependency-light; Playwright owns browser lifecycle. Shared TypeScript types live under `src/`.
2. **Thin GraphQL client** — no heavy SDK; explicit status/headers/errors for security and contract assertions (rate-limit headers, auth negatives, introspection policy).
3. **Component + page layer** — components own locators and element actions; pages expose flows used by specs (no raw locators in tests).
4. **No flaky waits** — Playwright web-first assertions only; overlays dismissed best-effort.
5. **Secrets via env** — token never committed; CI uses `PRODUCT_HUNT_TOKEN` GitHub secret.
6. **Risk-based coverage** — suites map to the strategy doc (discovery loop, auth boundaries, pagination, mobile smoke), not vanity metrics.

## Summary of findings

See [docs/exploratory-findings.md](docs/exploratory-findings.md). High-level:

- API correctly requires a bearer token (default deny).
- Client-level tokens should not expose user `viewer` data — covered by automation.
- Confirm whether GraphQL introspection is enabled in production (security observation).
- UI modals/consent can affect first-run automation; page objects dismiss when present.

Update the findings table with concrete bugs from your own exploratory pass before submission.

## What I'd do with more time

- Staging-only mutation / upvote abuse cases and idempotency checks  
- UI ↔ API consistency job (votes, names, slugs) as a scheduled monitor  
- Visual + a11y smoke on homepage/product templates  
- Multi-browser E2E matrix and network stubbing for deterministic product fixtures  
- OpenTelemetry / synthetic checks in production with burn-rate alerts  

## CI

GitHub Actions runs API + E2E on push/PR. Add repository secret `PRODUCT_HUNT_TOKEN` for the API job.

## Assignment mapping

| Part | Artifact |
| --- | --- |
| 1. Test strategy | `docs/test-strategy.md` |
| 2. Exploratory & security | `docs/exploratory-findings.md` |
| 3. Automated tests | `tests/api/*`, `tests/e2e/*` |
