import { test } from "../../src/fixtures/fixtures";

test.describe("Auth surfaces (public)", () => {
  test("sign-in entry is discoverable without authenticating", async ({
    homePage,
  }) => {
    await homePage.open();
    await homePage.expectSignInEntryVisible();
  });
});
