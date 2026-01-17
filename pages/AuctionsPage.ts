import { Page, Locator } from '@playwright/test';

export class AuctionsPage {
  constructor(private readonly page: Page) {}

  // Lazy locators
  private get auctionsNavLink(): Locator {
    return this.page.getByRole('link', { name: ' Auctions' });
  }

  private get newItemLink(): Locator {
    return this.page.getByRole('link', {
      name: 'New item',
      exact: true,
    });
  }

  async goToAuctions() {
    await Promise.all([
      this.auctionsNavLink.click(),
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
