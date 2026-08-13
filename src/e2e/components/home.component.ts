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

    this.topBarElements = (name: string) => page.getByRole('link', { name: new RegExp(name, 'i') });

    this.commentButton = page.locator('button[type="button"]').filter({
      has: page.locator("p.text-sm"),
    }).first();

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
    await expect(this.actionsOnProducts).toBeVisible();
  }
}
