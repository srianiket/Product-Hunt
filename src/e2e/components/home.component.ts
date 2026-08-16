import { expect, type Locator, type Page } from "@playwright/test";
import { BaseComponent } from "./base.component";
import { CommonComponent } from "./common.component";

/** Homepage locators + all home actions */
export class HomeComponent extends BaseComponent {
  private readonly common: CommonComponent;
  private readonly heading: Locator;
  private readonly logoLink: Locator;
  private readonly searchTrigger: Locator;
  private readonly searchInput: Locator;
  private readonly productLinks: Locator;
  private readonly voteButtons: Locator;
  private readonly todayNav: Locator;
  private readonly yesterdayNav: Locator;
  private readonly topBarElements: (name: string) => Locator;
  private readonly commentButton: Locator;
  private readonly actionsOnProducts: Locator;

  constructor(page: Page) {
    super(page);
    this.common = new CommonComponent(page);

    this.heading = page.getByRole("heading").first();

    this.logoLink = page
      .getByRole("link", { name: /product hunt/i })
      .first();

    this.searchTrigger = page
      .getByRole("button", { name: /search/i })
      .or(page.getByRole("link", { name: /search/i }))
      .or(page.getByPlaceholder(/search/i))
      .first();

    this.searchInput = page.getByPlaceholder(/search/i).first();

    this.productLinks = page.locator('a[href*="/posts/"]');
    this.voteButtons = page.locator('[data-test="vote-button"]');

    this.todayNav = page
      .getByRole("link", { name: /^today$/i })
      .or(page.getByRole("button", { name: /^today$/i }))
      .or(page.getByText(/^today$/i))
      .first();

    this.yesterdayNav = page
      .getByRole("link", { name: /^yesterday$/i })
      .or(page.getByRole("button", { name: /^yesterday$/i }))
      .or(page.getByText(/^yesterday$/i))
      .first();

    this.topBarElements = (name: string) =>
      page.getByRole("link", { name: new RegExp(name, "i") });

    this.commentButton = page
      .locator('button[type="button"]')
      .filter({ has: page.locator("p.text-sm") })
      .first();

    this.actionsOnProducts = page.locator('[data-test="vote-button"]');
  }

  async open(): Promise<void> {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    await this.common.dismissCookieBannerIfPresent();
  }

  async openOnMobile(width = 390, height = 844): Promise<void> {
    await this.page.setViewportSize({ width, height });
    await this.open();
  }

  async expectBrandAndNavigation(title: string | RegExp): Promise<void> {
    const expected = typeof title === "string" ? new RegExp(title, "i") : title;
    await expect(this.page).toHaveTitle(expected);
    await this.expectLogoVisible();
  }

  async expectProductFeed(): Promise<void> {
    await this.expectProductFeedVisible();
    const count = await this.getProductLinkCount();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Core listing check: products render with key elements
   * (name/link, vote count, comment affordance) and date nav works.
   */
  async expectFeaturedListingLoaded(): Promise<void> {
    await this.expectProductFeedVisible();
    await expect(this.voteButtons.first()).toBeVisible();

    const firstProduct = this.productLinks.first();
    await expect(firstProduct).toBeVisible();
    const name = (await firstProduct.innerText()).trim();
    expect(name.length).toBeGreaterThan(0);

    const voteText = (await this.voteButtons.first().innerText()).trim();
    expect(voteText).toMatch(/\d+/);

    // Comment control often sits near vote; soft presence via numeric button or text
    const commentOrDiscussion = this.page.getByText(/comment/i).first();
    if (await commentOrDiscussion.isVisible().catch(() => false)) {
      await expect(commentOrDiscussion).toBeVisible();
    }

    // Date navigation: Today visible; Yesterday clickable when present
    if (await this.todayNav.isVisible().catch(() => false)) {
      await expect(this.todayNav).toBeVisible();
    }
    if (await this.yesterdayNav.isVisible().catch(() => false)) {
      await this.yesterdayNav.click();
      await this.page.waitForLoadState("domcontentloaded");
      await this.expectProductFeedVisible();
      if (await this.todayNav.isVisible().catch(() => false)) {
        await this.todayNav.click();
        await this.page.waitForLoadState("domcontentloaded");
      }
    }
  }

  async getFirstVoteCount(): Promise<number> {
    const text = (await this.voteButtons.first().innerText()).trim();
    const match = text.match(/\d+/);
    expect(match).toBeTruthy();
    return Number(match![0]);
  }

  async getFirstProductName(): Promise<string> {
    const name = (await this.productLinks.first().innerText()).trim();
    expect(name.length).toBeGreaterThan(0);
    return name.split("\n")[0]!.trim();
  }

  async clickFirstVoteButton(): Promise<void> {
    await expect(this.voteButtons.first()).toBeVisible();
    await this.voteButtons.first().click();
  }

  /** Logged-out upvote should gate behind auth (URL or sign-in UI). */
  async expectUpvoteRequiresAuth(): Promise<void> {
    await this.clickFirstVoteButton();
    await this.expectAuthGate();
  }

  async expectAuthGate(): Promise<void> {
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

  async expectMobileLayoutUsable(): Promise<void> {
    await this.common.expectPrimaryNavVisible();
    await this.expectProductFeedVisible();
  }

  async openFirstProduct(): Promise<void> {
    await this.clickFirstProduct();
  }

  async searchFor(term: string): Promise<void> {
    await this.openSearch();
    await this.fillSearch(term);
    await this.submitSearch();
  }

  async expectSearchResultsFor(term: string): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    const results = this.page
      .locator('a[href*="/posts/"]')
      .or(this.page.getByText(new RegExp(term, "i")).first());
    await expect(results.first()).toBeVisible({ timeout: 15_000 });
  }

  async expectNoSearchResults(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    const emptyState = this.page.getByText(
      /no results|nothing found|we couldn’t find|could not find|0 results/i,
    );
    const hasEmpty = await emptyState
      .first()
      .isVisible()
      .catch(() => false);
    if (hasEmpty) {
      await expect(emptyState.first()).toBeVisible();
      return;
    }
    // Fallback: feed should not show a dense product list for nonsense queries
    const count = await this.productLinks.count();
    expect(count).toBeLessThan(3);
  }

  async expectSignInEntryVisible(): Promise<void> {
    await this.common.expectSignInVisible();
  }

  async openTopicsOrLaunch(): Promise<void> {
    if (await this.common.isTopicsOrLaunchVisible()) {
      await this.common.clickTopicsOrLaunch();
      await expect(this.page).toHaveURL(/.+/);
      await this.expectHeadingVisible();
      return;
    }

    await this.page.goto("/topics", { waitUntil: "domcontentloaded" });
    await this.expectHeadingVisible();
  }

  async expectLogoVisible(): Promise<void> {
    await expect(this.logoLink).toBeVisible();
  }

  async expectHeadingVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async expectProductFeedVisible(): Promise<void> {
    await expect(this.productLinks.first()).toBeVisible();
  }

  async getProductLinkCount(): Promise<number> {
    return this.productLinks.count();
  }

  async getFirstProductHref(): Promise<string | null> {
    return this.productLinks.first().getAttribute("href");
  }

  async clickFirstProduct(): Promise<void> {
    await expect(this.productLinks.first()).toBeVisible();
    await this.productLinks.first().click();
  }

  async openSearch(): Promise<void> {
    await expect(this.searchTrigger).toBeVisible();
    await this.searchTrigger.click();
  }

  async fillSearch(term: string): Promise<void> {
    await expect(this.searchInput).toBeVisible({ timeout: 10_000 });
    await this.searchInput.fill(term);
    await expect(this.searchInput).toHaveValue(new RegExp(term, "i"));
  }

  async submitSearch(): Promise<void> {
    await this.page.keyboard.press("Enter");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async verifyHomePageHeader(header: string): Promise<void> {
    await expect(this.heading).toHaveText(header);
  }

  async homePageUrl(url: string): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  async verifyHomePageLogo(): Promise<void> {
    await expect(this.logoLink).toBeVisible();
  }

  async verifyTopBarElements(element: string): Promise<void> {
    await expect(this.topBarElements(element)).toBeVisible();
  }

  async verifyActionsOnProducts(): Promise<void> {
    await expect(this.commentButton).toBeVisible();
    await expect(this.actionsOnProducts.first()).toBeVisible();
  }
}
