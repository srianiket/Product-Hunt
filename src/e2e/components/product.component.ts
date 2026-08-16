import { expect, type Locator, type Page } from "@playwright/test";
import { BaseComponent } from "./base.component";
import { CommonComponent } from "./common.component";

/** Product detail locators + element-level actions */
export class ProductComponent extends BaseComponent {
  private readonly common: CommonComponent;
  private readonly title: Locator;
  private readonly upvoteControl: Locator;
  private readonly visitWebsiteLink: Locator;
  private readonly commentsSection: Locator;
  private readonly commentInput: Locator;
  private readonly submitComment: Locator;
  private readonly makerInfo: Locator;

  constructor(page: Page) {
    super(page);
    this.common = new CommonComponent(page);

    this.title = page.getByRole("heading").first();

    this.upvoteControl = page.locator('[data-test="vote-button"]').first();

    this.visitWebsiteLink = page
      .getByRole("link", { name: /visit|website|get it|download/i })
      .first();

    this.commentsSection = page
      .getByRole("heading", { name: /comment/i })
      .or(page.getByText(/comments?/i))
      .first();

    this.commentInput = page
      .getByPlaceholder(/comment|add a comment|what do you think/i)
      .or(page.getByRole("textbox", { name: /comment/i }))
      .first();

    this.submitComment = page
      .getByRole("button", { name: /comment|post|submit|send/i })
      .first();

    this.makerInfo = page
      .getByText(/maker|hunter|launched by/i)
      .or(page.locator('a[href*="/@"], a[href*="/users/"]'))
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

  async getVoteCount(): Promise<number> {
    await expect(this.upvoteControl).toBeVisible();
    const text = (await this.upvoteControl.innerText()).trim();
    const match = text.match(/\d+/);
    expect(match).toBeTruthy();
    return Number(match![0]);
  }

  async expectDetailContent(expectedName?: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/posts\//);
    await this.expectTitleVisible();

    if (expectedName) {
      await expect(this.page.getByText(expectedName, { exact: false }).first()).toBeVisible();
    }

    await this.expectUpvoteVisible();
    await this.expectCommentsVisible();

    // Related external link when present
    if (await this.visitWebsiteLink.isVisible().catch(() => false)) {
      await expect(this.visitWebsiteLink).toBeVisible();
    }

    // Maker/hunter attribution when present
    if (await this.makerInfo.isVisible().catch(() => false)) {
      await expect(this.makerInfo).toBeVisible();
    }
  }

  async expectVoteCountMatchesListing(listingCount: number): Promise<void> {
    const detailCount = await this.getVoteCount();
    expect(detailCount).toBe(listingCount);
  }

  async clickUpvote(): Promise<void> {
    await expect(this.upvoteControl).toBeVisible();
    await this.upvoteControl.click();
  }

  async expectUpvoteRequiresAuth(): Promise<void> {
    await this.clickUpvote();
    const authUrl = /login|sign[_-]?in|sign[_-]?up|authenticate|oauth/i;
    const onAuthUrl = authUrl.test(this.page.url());
    const authHeading = this.page.getByRole("heading", {
      name: /sign in|log in|create account|welcome/i,
    });
    const authHeadingVisible = await authHeading
      .isVisible()
      .catch(() => false);
    const dialogVisible = await this.page
      .getByRole("dialog")
      .isVisible()
      .catch(() => false);

    let signInVisible = false;
    try {
      await this.common.expectSignInVisible();
      signInVisible = true;
    } catch {
      signInVisible = false;
    }

    expect(
      onAuthUrl || signInVisible || authHeadingVisible || dialogVisible,
    ).toBe(true);
  }

  async attemptCommentAsGuest(text = "Great product — QA probe"): Promise<void> {
    if (await this.commentInput.isVisible().catch(() => false)) {
      await this.commentInput.click();
      await this.commentInput.fill(text);
      if (await this.submitComment.isVisible().catch(() => false)) {
        await this.submitComment.click();
      }
    } else {
      // Focusing comments / "Add a comment" often opens auth for guests
      await this.commentsSection.click();
    }
  }

  async expectCommentRequiresAuth(): Promise<void> {
    await this.attemptCommentAsGuest();
    const authUrl = /login|sign[_-]?in|sign[_-]?up|authenticate|oauth/i;
    const onAuthUrl = authUrl.test(this.page.url());
    const authHeading = this.page.getByRole("heading", {
      name: /sign in|log in|create account|welcome/i,
    });
    const authHeadingVisible = await authHeading
      .isVisible()
      .catch(() => false);
    const dialogVisible = await this.page
      .getByRole("dialog")
      .isVisible()
      .catch(() => false);

    let signInVisible = false;
    try {
      await this.common.expectSignInVisible();
      signInVisible = true;
    } catch {
      signInVisible = false;
    }

    expect(
      onAuthUrl || signInVisible || authHeadingVisible || dialogVisible,
    ).toBe(true);
  }
}
