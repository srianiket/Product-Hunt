import { expect, type Locator, type Page } from "@playwright/test";
import { BaseComponent } from "./base.component";

/** Homepage locators + element-level actions */
export class HomeComponent extends BaseComponent {
  private readonly heading: Locator;
  private readonly logoLink: Locator;
  private readonly searchTrigger: Locator;
  private readonly searchInput: Locator;
  private readonly productLinks: Locator;

  constructor(page: Page) {
    super(page);

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
  }

  async expectLogoVisible() {
    await expect(this.logoLink).toBeVisible();
  }

  async expectHeadingVisible() {
    await expect(this.heading).toBeVisible();
  }

  async expectProductFeedVisible() {
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

  async openSearch() {
    await expect(this.searchTrigger).toBeVisible();
    await this.searchTrigger.click();
  }

  async fillSearch(term: string) {
    await expect(this.searchInput).toBeVisible({ timeout: 10_000 });
    await this.searchInput.fill(term);
    await expect(this.searchInput).toHaveValue(new RegExp(term, "i"));
  }

  async submitSearch() {
    await this.page.keyboard.press("Enter");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectBrandAndNavigation(title: string | RegExp): Promise<void> {
    // String = substring match (PH title is longer than brand alone)
    const expected = typeof title === "string" ? new RegExp(title, "i") : title;
    await expect(this.page).toHaveTitle(expected);
    await this.expectLogoVisible();
  }
}
