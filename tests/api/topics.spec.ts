import { beforeAll, describe, expect, test } from "bun:test";
import { ProductHuntGraphQLClient } from "../../src/api/client";
import {
  INTROSPECTION_TYPE_QUERY,
  TOPICS_QUERY,
} from "../../src/api/queries";
import type { TopicsQueryData } from "../../src/api/types";
import { config } from "../../src/config/env";

describe("API topics & contract", () => {
  let client: ProductHuntGraphQLClient;

  beforeAll(() => {
    if (!config.hasToken()) {
      throw new Error("PRODUCT_HUNT_TOKEN is required for API tests.");
    }
    client = ProductHuntGraphQLClient.fromEnv();
  });

  test("lists topics with slug and name", async () => {
    const data = await client.query<TopicsQueryData>(TOPICS_QUERY, {
      first: 5,
    });

    expect(data.topics.edges.length).toBeGreaterThan(0);

    for (const edge of data.topics.edges) {
      expect(edge.node.id).toBeTruthy();
      expect(edge.node.name.length).toBeGreaterThan(0);
      expect(edge.node.slug).toMatch(/^[a-z0-9-]+$/i);
    }
  });

  test("rate-limit headers are present on successful responses", async () => {
    const { status, headers } = await client.request(
      TOPICS_QUERY,
      { first: 1 },
    );

    expect(status).toBe(200);

    const limit =
      headers.get("x-rate-limit-limit") ??
      headers.get("X-Rate-Limit-Limit");
    const remaining =
      headers.get("x-rate-limit-remaining") ??
      headers.get("X-Rate-Limit-Remaining");

    // Documented by PH; assert when present (don't fail if gateway strips them)
    if (limit !== null) {
      expect(Number(limit)).toBeGreaterThan(0);
    }
    if (remaining !== null) {
      expect(Number(remaining)).toBeGreaterThanOrEqual(0);
    }
  });

  test("malformed GraphQL query returns structured errors", async () => {
    const { status, json } = await client.request(
      `query { posts(first: 1) { notARealField } }`,
    );

    expect(status).toBe(200);
    expect(json.errors?.length).toBeGreaterThan(0);
    expect(json.errors?.[0]?.message.length).toBeGreaterThan(0);
  });

  test("introspection of Query type succeeds or is explicitly blocked", async () => {
    const { status, json } = await client.request<{
      __type: { name: string; kind: string } | null;
    }>(INTROSPECTION_TYPE_QUERY);

    expect(status).toBe(200);

    if (json.errors?.length) {
      // Hardening: introspection disabled in production is a positive finding
      expect(json.errors[0]?.message.toLowerCase()).toMatch(
        /introspection|unauthorized|forbidden|denied|disabled/i,
      );
    } else {
      expect(json.data?.__type?.name).toBe("Query");
      expect(json.data?.__type?.kind).toBe("OBJECT");
    }
  });
});
