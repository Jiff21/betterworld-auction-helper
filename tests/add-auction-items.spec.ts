import { test } from '@playwright/test';
import path from 'path';
import 'dotenv/config';

import { readAuctionItems } from '../utils/readCsv';
import { parseImageUrls } from '../utils/parseImageUrls';
import { downloadImage } from '../utils/downloadImages';

test('Add auction items from CSV', async ({ page }) => {
  const items = readAuctionItems();

  // ── LOGIN ─────────────────────
  await page.goto('https://betterworld.org/sign-in/');

  await page.getByRole('textbox', { name: 'Email' })
    .fill(process.env.BW_EMAIL!);

  await page.getByRole('textbox', { name: 'Password' })
    .fill(process.env.BW_PASSWORD!);

  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForLoadState('networkidle');

  // ── NAVIGATION ─────────────────
  await page.getByRole('link', { name: ' Auctions' }).click();
  await page.getByRole('link', { name: 'Manage ' }).first().click();
  await page.getByRole('link', { name: 'Items' }).click();

  // ── CSV LOOP ───────────────────
  for (const [index, item] of items.entries()) {
    if (index > 0) break; // SAFETY: remove after testing

    console.log(`Adding item: ${item.title}`);

    await page.getByRole('link', { name: 'New item', exact: true }).click();

    await page.getByRole('textbox', { name: 'Title' }).fill(item.title);
    await page.getByRole('textbox', { name: 'Location ?' }).fill(item.location);

    await page.getByRole('spinbutton', { name: 'Estimated value ?' })
      .fill(String(item.estimatedValue));

    await page.getByRole('spinbutton', { name: 'Starting bid' })
      .fill(String(item.startingBid));

    await page.getByRole('textbox', {
      name: /Short description/
    }).fill(item.shortDescription);

    await page.locator('#overview-editor')
      .fill(item.longDescription);

    await page.getByRole('button', {
      name: 'Save & continue to images'
    }).click();

    // ── IMAGES (optional) ─────────
    const urls = parseImageUrls(item.imageUrls);

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const ext = path.extname(url).split('?')[0] || '.png';
      const filename = `item-${Date.now()}-${i}${ext}`;

      const localPath = await downloadImage(url, filename);

      await page.getByRole('link', { name: 'Add image' }).click();
      await page.getByRole('link', { name: 'Browse' })
        .setInputFiles(localPath);

      await page.locator('#new_image_form')
        .getByRole('button', { name: 'Save' }).click();
    }

    if (urls.length > 0) {
      await page.getByRole('button', { name: 'Save' }).click();
    }

    // ── DONOR ─────────────────────
    await page.getByRole('link', { name: 'Donor' }).click();

    await page.locator('#display_name').fill(item.donorName);
    await page.getByRole('textbox', { name: 'Website' })
      .fill(item.donorWebsite);

    await page.locator('#fulfillment_name')
      .fill(item.fulfillmentName);

    await page.getByRole('textbox', { name: 'Email' })
      .fill(item.fulfillmentEmail);

    await page.getByRole('button', { name: 'Save' }).click();

    await page.goto(
      'https://dashboard.betterworld.org/auctions/56215/items'
    );
    await page.waitForLoadState('networkidle');
  }
});
