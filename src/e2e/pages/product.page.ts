import { expect, type Page } from "@playwright/test";
import { ProductComponent } from "../components/product.component";
import { BasePage } from "./base.page";

/**
 * Product detail flows. Specs call these methods;
 * locators/actions are delegated to ProductComponent.
 */
export class ProductPage extends BasePage {
  private readonly product: ProductComponent;

  constructor(page: Page) {
    super(page);
    this.product = new ProductComponent(page);
  }

  async openByPath(path: string) {
    await this.goto(path);
    await this.dismissOverlaysIfPresent();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/posts\//);
    await this.product.expectTitleVisible();
  }

  async expectUpvoteAvailable() {
    await this.product.expectUpvoteVisible();
  }

  async expectCommentsAvailable() {
    await this.product.expectCommentsVisible();
  }
}
