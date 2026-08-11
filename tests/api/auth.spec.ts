import { beforeAll, describe, expect, test } from "bun:test";
import { ProductHuntGraphQLClient } from "../../src/api/client";
import { POSTS_QUERY, VIEWER_QUERY } from "../../src/api/queries";
import type { PostsQueryData, ViewerQueryData } from "../../src/api/types";
import { config } from "../../src/config/env";

describe("API auth & transport", () => {
  let client: ProductHuntGraphQLClient;

  beforeAll(() => {
    if (!config.hasToken()) {
      throw new Error(
        "PRODUCT_HUNT_TOKEN is required for API tests. See .env.example.",
      );
    }
    client = ProductHuntGraphQLClient.fromEnv();
  });

  test("rejects requests without Authorization header", async () => {
    const { status, json } = await client.request<PostsQueryData>(
      POSTS_QUERY,
      { first: 1 },
      { token: null },
    );

    // Product Hunt typically returns 401 or GraphQL/auth errors
    const unauthorizedHttp = status === 401 || status === 403;
    const hasAuthError =
      Boolean(json.errors?.length) || json.data === undefined || json.data === null;

    expect(unauthorizedHttp || hasAuthError).toBe(true);
  });

  test("rejects clearly invalid bearer token", async () => {
    const { status, json } = await client.request<PostsQueryData>(
      POSTS_QUERY,
      { first: 1 },
      { token: "invalid-token-spare-qa" },
    );

    const unauthorizedHttp = status === 401 || status === 403;
    const hasAuthError = Boolean(json.errors?.length) || !json.data?.posts;

    expect(unauthorizedHttp || hasAuthError).toBe(true);
  });

  test("accepts valid developer token for public posts", async () => {
    const data = await client.query<PostsQueryData>(POSTS_QUERY, { first: 1 });
    expect(data.posts.edges.length).toBeGreaterThanOrEqual(1);
    expect(data.posts.edges[0]?.node.id).toBeTruthy();
  });

  test("viewer is null (or absent user) for client-level token", async () => {
    // Client credentials / developer tokens are typically not user-scoped
    const { status, json } = await client.request<ViewerQueryData>(VIEWER_QUERY);

    expect(status).toBe(200);
    // Either viewer is null, or GraphQL returns an auth-scoped error — both OK
    if (json.errors?.length) {
      expect(json.errors[0]?.message.length).toBeGreaterThan(0);
    } else {
      expect(json.data?.viewer == null || json.data?.viewer.user == null).toBe(
        true,
      );
    }
  });
});
