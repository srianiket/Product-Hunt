import { test } from "../../src/fixtures/fixtures";

test.describe("Home — critical path", () => {
  test("loads homepage with brand and primary navigation", async ({
    homePage,
  }) => {
    await homePage.open();
    await homePage.expectBrandAndNavigation();
  });

  test("renders at least one product post link", async ({ homePage }) => {
    await homePage.open();
    await homePage.expectProductFeed();
  });

  test("homepage is usable on a mobile viewport", async ({ homePage }) => {
    await homePage.openOnMobile();
    await homePage.expectMobileLayoutUsable();
  });
});
