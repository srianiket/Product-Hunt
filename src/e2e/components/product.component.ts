import { expect, type Locator, type Page } from "@playwright/test";
import { BaseComponent } from "./base.component";

/** Product detail locators + element-level actions */
export class ProductComponent extends BaseComponent {
  private readonly title: Locator;
  private readonly upvoteControl: Locator;
  private readonly visitWebsiteLink: Locator;
  private readonly commentsSection: Locator;

  constructor(page: Page) {
    super(page);

    this.title = page.getByRole("heading").first();

    this.upvoteControl = page
      .getByRole("button", { name: /upvote|vote/i })
      .or(page.locator('[aria-label*="upvote" i], [aria-label*="vote" i]'))
      .first();

    this.visitWebsiteLink = page
      .getByRole("link", { name: /visit|website|get it/i })
      .first();

    this.commentsSection = page
      .getByRole("heading", { name: /comment/i })
      .or(page.getByText(/comments?/i))
      .first();
  }

  async expectTitleVisible() {
    await expect(this.title).toBeVisible();
  }

  async expectUpvoteVisible() {
    await expect(this.upvoteControl).toBeVisible();
  }

  async expectCommentsVisible() {
    await expect(this.commentsSection).toBeVisible();
  }

  async expectVisitWebsiteVisible() {
    await expect(this.visitWebsiteLink).toBeVisible();
  }
}
