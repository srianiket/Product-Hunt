import { test as base } from "@playwright/test";
import { HomePage } from "../e2e/pages/home.page";
import { ProductPage } from "../e2e/pages/product.page";

type Fixtures = {
  homePage: HomePage;
  productPage: ProductPage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
});

export { expect } from "@playwright/test";
