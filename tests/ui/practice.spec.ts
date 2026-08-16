import { test } from "../../src/fixtures/fixtures";

test.describe("Home — page features", () => {

  test.beforeEach(async ({ homePage }) => { 
    await homePage.open();
  });

  test("Verify whether user landed on the home page or not", async ({ homePage }) => {
    await homePage.verifyHomePageHeader('Top Products Launching Today');
    await homePage.homePageUrl('https://www.producthunt.com/');
    await homePage.verifyHomePageLogo();
  });

  test("Verify Products have upvote and comment features", async ({ homePage }) => {
    await homePage.verifyActionsOnProducts();
  });

  test("Verify all the elements on the top bar are visible", async ({ homePage }) => {
    await homePage.verifyTopBarElements('Sign In');
    await homePage.verifyTopBarElements('Subscribe');
    await homePage.verifyTopBarElements('Launches');
    await homePage.verifyTopBarElements('News');
    await homePage.verifyTopBarElements('Notifications');
    await homePage.verifyTopBarElements('Advertise');
    await homePage.verifyTopBarElements('Forums');
    await homePage.verifyTopBarElements('Best Products');
  });

  test("Verify the search entry point is available from the homepage", async ({ homePage }) => {
    await homePage.searchFor('notion');
  });

  test("Verify user can open a product from the homepage feed", async ({ homePage, productPage }) => {
    await homePage.openFirstProduct();
    await productPage.expectLoaded();
  });
});
