/** Typed GraphQL documents used by the API suite */

export const POSTS_QUERY = /* GraphQL */ `
  query Posts($first: Int!) {
    posts(first: $first) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          name
          slug
          tagline
          url
          votesCount
          commentsCount
          createdAt
          website
        }
      }
    }
  }
`;

export const POSTS_PAGINATED_QUERY = /* GraphQL */ `
  query PostsPaginated($first: Int!, $after: String) {
    posts(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          name
          slug
        }
      }
    }
  }
`;

export const POST_BY_SLUG_QUERY = /* GraphQL */ `
  query PostBySlug($slug: String!) {
    post(slug: $slug) {
      id
      name
      slug
      tagline
      url
      votesCount
      commentsCount
      createdAt
      description
      website
    }
  }
`;

export const TOPICS_QUERY = /* GraphQL */ `
  query Topics($first: Int!) {
    topics(first: $first) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          name
          slug
          description
          followersCount
        }
      }
    }
  }
`;

export const VIEWER_QUERY = /* GraphQL */ `
  query Viewer {
    viewer {
      user {
        id
        name
        username
        headline
      }
    }
  }
`;

export const INTROSPECTION_TYPE_QUERY = /* GraphQL */ `
  query IntrospectQueryType {
    __type(name: "Query") {
      name
      kind
    }
  }
`;
