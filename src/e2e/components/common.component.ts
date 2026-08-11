import { expect, type Locator, type Page } from "@playwright/test";
import { BaseComponent } from "./base.component";

/** Shared locators + actions (overlays, auth entry, global nav) */
export class CommonComponent extends BaseComponent {
  private readonly cookieBannerDismiss: Locator;
  private readonly signIn: Locator;
  private readonly primaryNav: Locator;
  private readonly topicsOrLaunchLink: Locator;

  constructor(page: Page) {
    super(page);

    this.cookieBannerDismiss = page
      .getByRole("button", { name: /accept|agree|got it|allow all/i })
      .first();

    this.signIn = page
      .getByRole("link", { name: /sign in|log in|login/i })
      .or(page.getByRole("button", { name: /sign in|log in|login/i }))
      .first();

    this.primaryNav = page.getByRole("navigation").first();

    this.topicsOrLaunchLink = page
      .getByRole("link", { name: /topics|launch/i })
      .first();
  }

  async dismissCookieBannerIfPresent() {
    if (await this.cookieBannerDismiss.isVisible().catch(() => false)) {
      await this.cookieBannerDismiss
        .click({ timeout: 3_000 })
        .catch(() => undefined);
    }
  }

  async expectPrimaryNavVisible() {
    await expect(this.primaryNav).toBeVisible();
  }

  async expectSignInVisible() {
    await expect(this.signIn).toBeVisible();
  }

  async isTopicsOrLaunchVisible(): Promise<boolean> {
    return this.topicsOrLaunchLink.isVisible().catch(() => false);
  }

  async clickTopicsOrLaunch() {
    await this.topicsOrLaunchLink.click();
  }
}
