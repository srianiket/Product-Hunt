import type { Page } from "@playwright/test";

/** Base for components that own locators + element-level actions */
export abstract class BaseComponent {
  constructor(protected readonly page: Page) {}
}
