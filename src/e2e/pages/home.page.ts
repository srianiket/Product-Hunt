import { expect, type Page } from "@playwright/test";
import { HomeComponent } from "../components/home.component";
import { BasePage } from "./base.page";

/**
 * Homepage flows. Specs call these methods;
 * locators/actions are delegated to HomeComponent / CommonComponent.
 */
export class HomePage extends BasePage {
  private readonly home: HomeComponent;

  constructor(page: Page) {
    super(page);
    this.home = new HomeComponent(page);
  }

  async open() {
    await this.goto("/");
    await this.dismissOverlaysIfPresent();
  }

  async openOnMobile(width = 390, height = 844) {
    await this.page.setViewportSize({ width, height });
    await this.open();
  }

  async expectBrandAndNavigation() {
    await expect(this.page).toHaveTitle(/product hunt/i);
    await this.common.expectPrimaryNavVisible();
    await this.home.expectLogoVisible();
  }

  async expectProductFeed() {
    await this.home.expectProductFeedVisible();
    const count = await this.home.getProductLinkCount();
    expect(count).toBeGreaterThan(0);
  }

  async expectMobileLayoutUsable() {
    await this.common.expectPrimaryNavVisible();
    await this.home.expectProductFeedVisible();
  }

  async openFirstProduct() {
    const href = await this.home.getFirstProductHref();
    expect(href).toBeTruthy();
    await this.home.clickFirstProduct();
    await expect(this.page).toHaveURL(/\/posts\//);
  }

  async searchFor(term: string) {
    await this.home.openSearch();
    await this.home.fillSearch(term);
    await this.home.submitSearch();
  }

  async expectSignInEntryVisible() {
    await this.common.expectSignInVisible();
  }

  async openTopicsOrLaunch() {
    if (await this.common.isTopicsOrLaunchVisible()) {
      await this.common.clickTopicsOrLaunch();
      await expect(this.page).toHaveURL(/.+/);
      await this.home.expectHeadingVisible();
      return;
    }

    await this.goto("/topics");
    await this.home.expectHeadingVisible();
  }
}
