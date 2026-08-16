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

  async expectDetailContent(expectedName?: string): Promise<void> {
    return this.product.expectDetailContent(expectedName);
  }

  async expectVoteCountMatchesListing(listingCount: number): Promise<void> {
    return this.product.expectVoteCountMatchesListing(listingCount);
  }

  async expectUpvoteRequiresAuth(): Promise<void> {
    return this.product.expectUpvoteRequiresAuth();
  }

  async expectCommentRequiresAuth(): Promise<void> {
    return this.product.expectCommentRequiresAuth();
  }

  async clickUpvote(): Promise<void> {
    return this.product.clickUpvote();
  }

  async getVoteCount(): Promise<number> {
    return this.product.getVoteCount();
  }
}
