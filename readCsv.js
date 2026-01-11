import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { readAuctionItems } from '../utils/readCsv';

test('Add auction items from CSV', async ({ page }) => {
  const items = readAuctionItems();

  // ─────────────────────────────
  // LOGIN
  // ─────────────────────────────
  await page.goto('https://betterworld.org/sign-in/');

  await page.getByRole('textbox', { name: 'Email' })
    .fill(process.env.BW_EMAIL);

  await page.getByRole('textbox', { name: 'Password' })
    .fill(process.env.BW_PASSWORD);

  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForLoadState('networkidle');

  // ─────────────────────────────
  // NAVIGATE TO ITEMS
  // ─────────────────────────────
  await page.getByRole('link', { name: ' Auctions' }).click();
  await page.getByRole('link', { name: 'Manage ' }).first().click();
  await page.getByRole('link', { name: 'Items' }).click();

  // ─────────────────────────────
  // LOOP THROUGH CSV ROWS
  // ─────────────────────────────
  for (const item of items) {
    console.log(`Adding item: ${item.title}`);

    await page.getByRole('link', { name: 'New item', exact: true }).click();

    // ── BASIC INFO ──
    await page.getByRole('textbox', { name: 'Title' }).fill(item.title);
    await page.getByRole('textbox', { name: 'Location ?' }).fill(item.location);

    await page.getByRole('spinbutton', { name: 'Estimated value ?' })
      .fill(String(item.estimatedValue));

    await page.getByRole('spinbutton', { name: 'Starting bid' })
      .fill(String(item.startingBid));

    // Category (example: first non-default)
    await page.getByRole('combobox', { name: 'Uncategorized' }).click();
    await page.locator('#bs-select-1-1').click();

    await page.getByRole('textbox', {
      name: /Short description/
    }).fill(item.shortDescription);

    await page.locator('#overview-editor')
      .fill(item.longDescription);

    await page.getByRole('button', {
      name: 'Save & continue to images'
    }).click();

    // ── IMAGES ──
    await page.getByRole('link', { name: 'Add image' }).click();
    await page.getByRole('link', { name: 'Browse' })
      .setInputFiles('images/Calendar.png');
    await page.locator('#new_image_form')
      .getByRole('button', { name: 'Save' }).click();

    await page.getByRole('link', { name: 'Add image' }).click();
    await page.getByRole('link', { name: 'Browse' })
      .setInputFiles('images/KeyLinks.png');
    await page.locator('#new_image_form')
      .getByRole('button', { name: 'Save' }).click();

    await page.getByRole('button', { name: 'Save' }).click();

    // ── DONOR INFO ──
    await page.getByRole('link', { name: 'Donor' }).click();

    await page.locator('#display_name').fill(item.donorName);
    await page.getByRole('textbox', { name: 'Website' })
      .fill(item.donorWebsite);

    await page.locator('#fulfillment_name')
      .fill(item.fulfillmentName);

    await page.getByRole('textbox', { name: 'Email' })
      .fill(item.fulfillmentEmail);

    await page.getByRole('button', { name: 'Save' }).click();

    // ── RETURN TO ITEMS LIST ──
    await page.goto(
      'https://dashboard.betterworld.org/auctions/56215/items'
    );

    await page.waitForLoadState('networkidle');
  }
});
