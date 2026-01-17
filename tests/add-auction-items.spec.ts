import { test } from '@playwright/test';
import dotenv from 'dotenv';

import { readAuctionItems } from '../utils/readCsv';
import { LoginPage } from '../pages/LoginPage';
import { AuctionsPage } from '../pages/AuctionsPage';
import { ItemFormPage } from '../pages/ItemFormPage';


dotenv.config({ path: 'secrets/local.env' });

const auctionItemsUrl = process.env.AUCTION_ITEMS_URL;

if (!auctionItemsUrl) {
  console.error('AUCTION_ITEMS_URL is not set. Please create a secrets/local.env file.');
  process.exit(1);
}

test.describe('Auction item ingestion', () => {
  test('Add auction items from CSV', async ({ page }) => {
    // Long-running workflow (uploads + rich text + navigation)
    test.setTimeout(10 * 60 * 1000);

    const items = readAuctionItems();

    const loginPage = new LoginPage(page);
    const auctionsPage = new AuctionsPage(page);
    const itemForm = new ItemFormPage(page);

    // ── LOGIN ───────────────────────────────
    await loginPage.goto();
    await loginPage.login(
      process.env.BW_EMAIL!,
      process.env.BW_PASSWORD!
    );

    // ── PROCESS ITEMS ──────────────────────
    let index = 0;

    for (const item of items) {
      index++;
      console.log(
        `\n▶ Adding item ${index} / ${items.length}: ${item.title}`
      );

      // Always navigate fresh for each item
      await auctionsPage.goToItems(auctionItemsUrl);

      // Start item creation
      await auctionsPage.startNewItem();

      // ── ITEM WORKFLOW ────────────────────
      await itemForm.fillBasicInfo(item);
      await itemForm.uploadImages(item.imageUrls);
      await itemForm.fillDonor(item);
      await itemForm.fillNotes(item.notes);

    }
  });
});
