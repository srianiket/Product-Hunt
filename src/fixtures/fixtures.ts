import { test as base } from "@playwright/test";
import { HomePage } from "../e2e/pages/home.page";
import { ProductPage } from "../e2e/pages/product.page";

type Fixtures = {
  homePage: HomePage;
  productPage: ProductPage;
};

export const test = base.extend<Fixtures>({
  // Optional logged-in session for upvote/comment mutation coverage
  context: async ({ browser }, use) => {
    const storageState = process.env.PH_STORAGE_STATE?.trim();
    const context = await browser.newContext(
      storageState ? { storageState } : {},
    );
    await use(context);
    await context.close();
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
});

export { expect } from "@playwright/test";
