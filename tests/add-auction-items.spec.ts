import { test } from '@playwright/test';
import 'dotenv/config';

import { readAuctionItems } from '../utils/readCsv';
import { LoginPage } from '../pages/LoginPage';
import { AuctionsPage } from '../pages/AuctionsPage';
import { ItemFormPage } from '../pages/ItemFormPage';

const auctionItemsUrl =
  'https://dashboard.betterworld.org/auctions/56215/items';

test('Add auction items from CSV', async ({ page }) => {
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

  // ── NAVIGATION ──────────────────────────
  await auctionsPage.goToAuctions();

  let i = 0;

  for (const item of items) {
    i++;
    console.log(`Adding item ${i} / ${items.length}: ${item.title}`);

    await auctionsPage.goToItems(auctionItemsUrl);
    await auctionsPage.startNewItem();

    // ── ITEM WORKFLOW ────────────────────
    await itemForm.fillBasicInfo(item);
    await itemForm.uploadImages(item.imageUrls);
    await itemForm.fillDonor(item);
    await itemForm.fillNotes(item.notes);
  }
});
