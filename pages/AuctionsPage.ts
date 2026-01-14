import { Page, Locator } from '@playwright/test';

export class AuctionsPage {
  readonly page: Page;

  readonly auctionsNavLink: Locator;
  readonly newItemLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.auctionsNavLink = page.getByRole('link', { name: ' Auctions' });
    this.newItemLink = page.getByRole('link', {
      name: 'New item',
      exact: true
    });
  }

  async goToAuctions() {
    await this.auctionsNavLink.click();
  }

  async goToItems(auctionUrl: string) {
    await this.page.goto(auctionUrl);
    await this.page.waitForLoadState('networkidle');
  }

  async startNewItem() {
    await this.newItemLink.click();
  }
}
