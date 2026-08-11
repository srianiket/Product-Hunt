/**
 * Central config — reads from env with safe defaults for local runs.
 * API suites require PRODUCT_HUNT_TOKEN; E2E does not.
 */

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. Copy .env.example → .env and set your Product Hunt developer token.`,
    );
  }
  return value;
}

export const config = {
  baseUrl: process.env.BASE_URL ?? "https://www.producthunt.com",
  graphqlUrl:
    process.env.GRAPHQL_URL ?? "https://api.producthunt.com/v2/api/graphql",
  /** Lazy: only resolved when API client needs a token */
  get token(): string {
    return required("PRODUCT_HUNT_TOKEN");
  },
  hasToken(): boolean {
    return Boolean(process.env.PRODUCT_HUNT_TOKEN?.trim());
  },
} as const;
