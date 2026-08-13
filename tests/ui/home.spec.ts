import { test } from "../../src/fixtures/fixtures";

test.describe("Home — page features", () => {
  test.only("loads homepage with brand and primary navigation", async ({ homePage }) => {
    await homePage.open();
    await homePage.expectBrandAndNavigation('Product Hunt');
  });

  test("renders at least one product post link", async ({ homePage }) => {
    await homePage.open();
    await homePage.expectProductFeed();
  });

  test("homepage is usable on a mobile viewport", async ({ homePage }) => {
    await homePage.openOnMobile();
    await homePage.expectMobileLayoutUsable();
  });

  test("search entry point is available from the homepage", async ({ homePage }) => {
    await homePage.open();
    await homePage.searchFor("notion");
  });

  test("opens a product from the homepage feed", async ({ homePage, productPage }) => {
    await homePage.open();
    await homePage.openFirstProduct();
    await productPage.expectLoaded();
  });

  test("product page exposes vote affordance", async ({ homePage, productPage }) => {
    await homePage.open();
    await homePage.openFirstProduct();
    await productPage.expectUpvoteAvailable();
  });

  test("product page shows comments or discussion context", async ({ homePage, productPage }) => {
    await homePage.open();
    await homePage.openFirstProduct();
    await productPage.expectCommentsAvailable();
  });
});
