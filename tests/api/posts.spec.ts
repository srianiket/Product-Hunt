import { beforeAll, describe, expect, test } from "bun:test";
import { ProductHuntGraphQLClient } from "../../src/api/client";
import {
  POST_BY_SLUG_QUERY,
  POSTS_PAGINATED_QUERY,
  POSTS_QUERY,
} from "../../src/api/queries";
import type { PostQueryData, PostsQueryData } from "../../src/api/types";
import { config } from "../../src/config/env";

describe("API posts", () => {
  let client: ProductHuntGraphQLClient;

  beforeAll(() => {
    if (!config.hasToken()) {
      throw new Error("PRODUCT_HUNT_TOKEN is required for API tests.");
    }
    client = ProductHuntGraphQLClient.fromEnv();
  });

  test("returns typed posts with required fields", async () => {
    const data = await client.query<PostsQueryData>(POSTS_QUERY, { first: 5 });

    expect(data.posts.edges.length).toBeGreaterThan(0);
    expect(data.posts.edges.length).toBeLessThanOrEqual(5);

    for (const edge of data.posts.edges) {
      const post = edge.node;
      expect(post.id).toBeTruthy();
      expect(post.name.length).toBeGreaterThan(0);
      expect(post.slug.length).toBeGreaterThan(0);
      expect(typeof post.tagline).toBe("string");
      expect(typeof post.votesCount).toBe("number");
      expect(post.votesCount).toBeGreaterThanOrEqual(0);
      expect(post.url).toMatch(/^https?:\/\//);
      expect(Number.isNaN(Date.parse(post.createdAt))).toBe(false);
    }
  });

  test("pagination cursors yield a distinct next page", async () => {
    const firstPage = await client.query<PostsQueryData>(POSTS_PAGINATED_QUERY, {
      first: 3,
    });

    expect(firstPage.posts.pageInfo.endCursor).toBeTruthy();
    const firstIds = firstPage.posts.edges.map((e) => e.node.id);

    const secondPage = await client.query<PostsQueryData>(
      POSTS_PAGINATED_QUERY,
      {
        first: 3,
        after: firstPage.posts.pageInfo.endCursor,
      },
    );

    const secondIds = secondPage.posts.edges.map((e) => e.node.id);
    expect(secondIds.length).toBeGreaterThan(0);

    const overlap = secondIds.filter((id) => firstIds.includes(id));
    expect(overlap.length).toBe(0);
  });

  test("fetches a single post by slug from the feed", async () => {
    const feed = await client.query<PostsQueryData>(POSTS_QUERY, { first: 1 });
    const slug = feed.posts.edges[0]?.node.slug;
    expect(slug).toBeTruthy();

    const data = await client.query<PostQueryData>(POST_BY_SLUG_QUERY, {
      slug,
    });

    expect(data.post).not.toBeNull();
    expect(data.post?.slug).toBe(slug);
    expect(data.post?.name.length).toBeGreaterThan(0);
  });

  test("unknown slug returns null post without hard failure", async () => {
    const { status, json } = await client.request<PostQueryData>(
      POST_BY_SLUG_QUERY,
      { slug: "this-product-definitely-does-not-exist-spare-qa-xyz" },
    );

    expect(status).toBe(200);
    // Prefer null over throwing for missing resources
    if (!json.errors?.length) {
      expect(json.data?.post ?? null).toBeNull();
    }
  });
});
