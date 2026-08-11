import type { Page } from "@playwright/test";
import { CommonComponent } from "../components/common.component";

/**
 * Page layer — navigation and flows.
 * Locators + element actions live in component classes.
 */
export abstract class BasePage {
  protected readonly common: CommonComponent;

  constructor(protected readonly page: Page) {
    this.common = new CommonComponent(page);
  }

  async goto(path = "/") {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  async dismissOverlaysIfPresent() {
    await this.common.dismissCookieBannerIfPresent();
  }
}
