import { test } from "../../src/fixtures/fixtures";

test.describe("Search & discovery", () => {
  test("search entry point is available from the homepage", async ({
    homePage,
  }) => {
    await homePage.open();
    await homePage.searchFor("notion");
  });

  test("topics / launch routes are reachable", async ({ homePage }) => {
    await homePage.open();
    await homePage.openTopicsOrLaunch();
  });
});
