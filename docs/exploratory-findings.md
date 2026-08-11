# Exploratory Testing & Security Assessment — Product Hunt

> Working notes as if reporting to an engineering team. Stay ethical: no exploitation, no credential stuffing, no destructive mutations against production.

**Surfaces explored:** `https://www.producthunt.com`, `https://api.producthunt.com/v2/api/graphql`  
**Date:** assignment run (update when you explore live)

## Method

1. Walk the public discovery loop (home → product → comments / visit).
2. Probe GraphQL with a developer token: happy path, auth negatives, pagination, malformed queries, introspection.
3. Note inconsistencies between UI copy/URLs and API fields.
4. Capture severity using: **blocker / high / medium / low / observation**.

## Findings template (fill during your run)

| ID | Severity | Area | Observation | Evidence | Suggested follow-up |
| --- | --- | --- | --- | --- | --- |
| F-01 | | Web | | | |
| F-02 | | API | | | |
| F-03 | | Security | | | |

### Seed observations (validate live — may change)

| ID | Severity | Area | Observation | Suggested follow-up |
| --- | --- | --- | --- | --- |
| S-01 | Observation | API | Public GraphQL requires a bearer token — good default deny. | Keep API suite auth negatives in CI. |
| S-02 | Observation | API | Rate-limit headers (`X-Rate-Limit-*`) are documented; confirm presence under current gateway. | Alert if headers disappear (ops signal). |
| S-03 | Medium (if true) | Security | Introspection may still be enabled (`__type` / `__schema`). | Disable in production or gate by role. |
| S-04 | Observation | AuthZ | Client-level token should not expose `viewer.user`; confirm null/error. | Regression test included. |
| S-05 | Low–Med | Consistency | UI routes use `/posts/...` while API exposes `slug` + `url` — verify deep links stay aligned after redesigns. | Contract test: API `url` host + path shape. |
| S-06 | Observation | UX/Web | Cookie/consent and promo modals can obscure first paint for automation and users. | Stable dismiss control / test hooks. |

## Security checklist (ethical)

- [ ] Missing `Authorization` rejected
- [ ] Invalid token rejected
- [ ] User-scoped fields not readable with client token
- [ ] Malformed queries return errors without stack traces / internals
- [ ] Introspection policy reviewed
- [ ] No secrets in client-side JS bundles (spot-check network/HAR)
- [ ] Rate limiting behaves under light parallel requests (do **not** load-test aggressively)

## Bugs / inconsistencies log

Add concrete bugs here after your exploratory session (screenshots, request IDs, timestamps, expected vs actual). Prefer reproducible steps over opinions.

## What I would do next

- Diff UI vote counts vs API `votesCount` for N products daily (consistency monitor).
- Add mutation tests in a **staging** environment only.
- Wire Playwright traces + API failure payloads into Slack for on-call.
