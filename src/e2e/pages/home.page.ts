import type { Page } from "@playwright/test";
import { HomeComponent } from "../components/home.component";
import { BasePage } from "./base.page";

/**
 * Homepage page object — thin wrappers only.
 * Locators and actions live in HomeComponent.
 */
export class HomePage extends BasePage {
  private readonly home: HomeComponent;

  constructor(page: Page) {
    super(page);
    this.home = new HomeComponent(page);
  }

  async open(): Promise<void> {
    return this.home.open();
  }

  async openOnMobile(width = 390, height = 844): Promise<void> {
    return this.home.openOnMobile(width, height);
  }

  async expectBrandAndNavigation(title: string | RegExp): Promise<void> {
    return this.home.expectBrandAndNavigation(title);
  }

  async expectProductFeed(): Promise<void> {
    return this.home.expectProductFeed();
  }

  async expectFeaturedListingLoaded(): Promise<void> {
    return this.home.expectFeaturedListingLoaded();
  }

  async getFirstVoteCount(): Promise<number> {
    return this.home.getFirstVoteCount();
  }

  async getFirstProductName(): Promise<string> {
    return this.home.getFirstProductName();
  }

  async expectUpvoteRequiresAuth(): Promise<void> {
    return this.home.expectUpvoteRequiresAuth();
  }

  async expectMobileLayoutUsable(): Promise<void> {
    return this.home.expectMobileLayoutUsable();
  }

  async openFirstProduct(): Promise<void> {
    return this.home.openFirstProduct();
  }

  async searchFor(term: string): Promise<void> {
    return this.home.searchFor(term);
  }

  async expectSearchResultsFor(term: string): Promise<void> {
    return this.home.expectSearchResultsFor(term);
  }

  async expectNoSearchResults(): Promise<void> {
    return this.home.expectNoSearchResults();
  }

  async expectSignInEntryVisible(): Promise<void> {
    return this.home.expectSignInEntryVisible();
  }

  async openTopicsOrLaunch(): Promise<void> {
    return this.home.openTopicsOrLaunch();
  }

  async verifyHomePageHeader(header: string): Promise<void> {
    return this.home.verifyHomePageHeader(header);
  }

  async homePageUrl(url: string): Promise<void> {
    return this.home.homePageUrl(url);
  }

  async verifyHomePageLogo(): Promise<void> {
    return this.home.verifyHomePageLogo();
  }

  async verifyTopBarElements(element: string): Promise<void> {
    return this.home.verifyTopBarElements(element);
  }

  async verifyActionsOnProducts(): Promise<void> {
    return this.home.verifyActionsOnProducts();
  }
}
