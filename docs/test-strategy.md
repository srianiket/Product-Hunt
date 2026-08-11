# Test Strategy — Product Hunt (Spare QA Assignment)

**Owner mindset:** sole QA for a newly shipped product. Goal: risk-based coverage that protects trust, discovery, and the public GraphQL API — not exhaustive UI clicking.

## What matters (priority order)

1. **Trust & authenticity** — Upvotes, rankings, and product identity must be consistent across web and API. Inflated/corrupt engagement destroys the product.
2. **Core discovery loop** — Homepage → product detail → external site / discussion. If this path breaks, the product fails its job.
3. **API contract & auth** — Product Hunt is API-first adjacent for integrations. Broken auth, pagination, or schema drift breaks partners silently.
4. **Abuse & security boundaries** — Authz on viewer/user data, rate limits, introspection exposure, injection via GraphQL variables.
5. **Cross-surface consistency** — Name, slug, votes, and URLs should match between `producthunt.com` and GraphQL.
6. **Resilience** — Empty states, unknown slugs, mobile layout, graceful degradation under rate limiting.

## Approach

| Layer | Scope | Tooling |
| --- | --- | --- |
| Strategy / risk | Document risks & severity | This doc + findings |
| Exploratory | Bugs, UX, security notes | Manual + API probes |
| API automation | Auth, posts, pagination, topics, errors | Bun + typed GraphQL client |
| E2E automation | Homepage, product, search, sign-in entry | Playwright (headless, CI) |

**Not in v1 (more time):** visual regression, full OAuth user flows, mutation/write abuse cases, performance budgets, production synthetic monitors.

## Risk → test mapping

- **Feed empty / broken** → E2E homepage product links; API `posts(first: n)`
- **Wrong product / deep link** → E2E click-through; API `post(slug:)`
- **Pagination duplicates / skips** → API cursor tests
- **Token leakage / weak auth** → API missing/invalid token; viewer with client token
- **Schema / field regressions** → typed responses + malformed query error shape
- **Mobile unusable** → E2E mobile viewport smoke

## CI & quality bars

- Headless Chromium only (fast signal); retries on CI, traces on failure.
- No `waitForTimeout`; web-first assertions and locator auto-wait.
- API tests isolated (no shared mutable client state); secrets via env only.
- Fail closed when `PRODUCT_HUNT_TOKEN` is missing for API suite.

## Success for this assignment

A reviewer can clone, set a token, run both suites in CI, read findings, and see clear prioritization trade-offs — not a sea of low-value assertions.
