import { Page, Locator } from '@playwright/test';

export class DonationCampaign {
  constructor(private readonly page: Page) {}

  private get campaignNavLink(): Locator {
    return this.page.locator('/campaigns' );
  }

  private get newItemLink(): Locator {
    return this.page.getByRole('link', {
      name: 'New item',
      exact: true,
    });
  }

  async goToAuctions() {
    await Promise.all([
      this.campaignNavLink.click(),
    ]);
  }

  async goToItems(auctionUrl: string) {
    await this.page.goto(auctionUrl);
  }

  async startNewItem() {
    await Promise.all([
      this.newItemLink.click(),
    ]);
  }
}
