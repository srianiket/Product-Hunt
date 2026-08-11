import { config } from "../config/env";
import type { GraphQLResponse } from "./types";

export class GraphQLClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "GraphQLClientError";
  }
}

export type RequestOptions = {
  /** Override token (e.g. invalid token negative tests) */
  token?: string | null;
  /** Extra headers for security / contract checks */
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/**
 * Minimal typed GraphQL client using Bun's fetch.
 * Isolated per-call — no shared mutable session state.
 */
export class ProductHuntGraphQLClient {
  constructor(
    private readonly endpoint = config.graphqlUrl,
    private readonly defaultToken?: string,
  ) {}

  static fromEnv(): ProductHuntGraphQLClient {
    return new ProductHuntGraphQLClient(config.graphqlUrl, config.token);
  }

  async request<T>(
    query: string,
    variables?: Record<string, unknown>,
    options: RequestOptions = {},
  ): Promise<{ status: number; headers: Headers; json: GraphQLResponse<T> }> {
    const token =
      options.token === undefined
        ? (this.defaultToken ?? config.token)
        : options.token;

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      signal: options.signal,
    });

    const text = await response.text();
    let json: GraphQLResponse<T>;
    try {
      json = JSON.parse(text) as GraphQLResponse<T>;
    } catch {
      throw new GraphQLClientError(
        `Non-JSON response from GraphQL (${response.status})`,
        response.status,
        text.slice(0, 500),
      );
    }

    return { status: response.status, headers: response.headers, json };
  }

  /** Asserts HTTP OK and no GraphQL errors; returns data */
  async query<T>(
    query: string,
    variables?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    const { status, json } = await this.request<T>(query, variables, options);

    if (status < 200 || status >= 300) {
      throw new GraphQLClientError(
        `GraphQL HTTP ${status}`,
        status,
        json,
      );
    }

    if (json.errors?.length) {
      throw new GraphQLClientError(
        json.errors.map((e) => e.message).join("; "),
        status,
        json.errors,
      );
    }

    if (json.data === undefined) {
      throw new GraphQLClientError("GraphQL response missing data", status, json);
    }

    return json.data;
  }
}
