import { test } from "../../src/fixtures/fixtures";

test.describe("Product detail", () => {
  test("opens a product from the homepage feed", async ({
    homePage,
    productPage,
  }) => {
    await homePage.open();
    await homePage.openFirstProduct();
    await productPage.expectLoaded();
  });

  test("product page exposes vote affordance", async ({
    homePage,
    productPage,
  }) => {
    await homePage.open();
    await homePage.openFirstProduct();
    await productPage.expectUpvoteAvailable();
  });

  test("product page shows comments or discussion context", async ({
    homePage,
    productPage,
  }) => {
    await homePage.open();
    await homePage.openFirstProduct();
    await productPage.expectCommentsAvailable();
  });
});
