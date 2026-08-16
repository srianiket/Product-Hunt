import { expect, test } from "../../src/fixtures/fixtures";

const hasLoggedInSession = Boolean(process.env.PH_STORAGE_STATE?.trim());

test.describe("Top 5 E2E — Product Hunt core journeys", () => {
  test("1. Homepage product listing loads and displays correctly", async ({
    homePage,
  }) => {
    await homePage.open();
    await homePage.expectFeaturedListingLoaded();
  });

  test("2. Upvote functionality (logged-out vs logged-in)", async ({
    homePage,
    productPage,
    page,
  }) => {
    await test.step("Logged-out user clicks upvote → auth gate", async () => {
      await homePage.open();
      await homePage.expectUpvoteRequiresAuth();
    });

    if (hasLoggedInSession) {
      await test.step("Logged-in upvote increment + toggle + persist", async () => {
        await homePage.open();
        await homePage.openFirstProduct();
        await productPage.expectLoaded();

        const before = await productPage.getVoteCount();
        await productPage.clickUpvote();
        await expect
          .poll(async () => productPage.getVoteCount())
          .not.toBe(before);

        // Toggle back
        await productPage.clickUpvote();
        await page.reload({ waitUntil: "domcontentloaded" });
        await productPage.expectUpvoteAvailable();
      });
    } else {
      test.info().annotations.push({
        type: "note",
        description:
          "Logged-in upvote skipped — set PH_STORAGE_STATE for full coverage",
      });
    }
  });

  test("3. Product detail page navigation and content", async ({
    homePage,
    productPage,
  }) => {
    await homePage.open();

    const listingVotes = await homePage.getFirstVoteCount();
    const productName = await homePage.getFirstProductName();

    await homePage.openFirstProduct();
    await productPage.expectDetailContent(productName);
    await productPage.expectVoteCountMatchesListing(listingVotes);
  });

  test("4. Search functionality", async ({ homePage }) => {
    await homePage.open();

    await test.step("Known keyword returns relevant results", async () => {
      await homePage.searchFor("notion");
      await homePage.expectSearchResultsFor("notion");
    });

    await test.step("Nonsense query shows empty / no dense results", async () => {
      await homePage.open();
      await homePage.searchFor("zzzznonexistentproductxyz123spareqa");
      await homePage.expectNoSearchResults();
    });
  });

  test("5. Comment submission on a product", async ({
    homePage,
    productPage,
  }) => {
    await test.step("Logged-out user attempting to comment → auth gate", async () => {
      await homePage.open();
      await homePage.openFirstProduct();
      await productPage.expectLoaded();
      await productPage.expectCommentRequiresAuth();
    });

    if (hasLoggedInSession) {
      await test.step("Logged-in comments section available", async () => {
        await homePage.open();
        await homePage.openFirstProduct();
        await productPage.expectCommentsAvailable();
      });
    } else {
      test.info().annotations.push({
        type: "note",
        description:
          "Logged-in comment submit skipped — set PH_STORAGE_STATE for full coverage",
      });
    }
  });
});
