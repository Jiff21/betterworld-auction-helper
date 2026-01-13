import { test } from '@playwright/test';
import path from 'path';
import 'dotenv/config';

import { readAuctionItems } from '../utils/readCsv';
import { parseImageUrls } from '../utils/parseImageUrls';
import { downloadImage } from '../utils/downloadImages';


const auctionUrl= 'https://dashboard.betterworld.org/auctions/56215/items'

test('Add auction items from CSV', async ({ page }) => {
  const items = readAuctionItems();

  // ── LOGIN ─────────────────────
  await page.goto('https://betterworld.org/sign-in/');

  await page.getByRole('textbox', { name: 'Email' })
    .fill(process.env.BW_EMAIL!);

  await page.getByRole('textbox', { name: 'Password' })
    .fill(process.env.BW_PASSWORD!);

  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  // await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: ' Auctions' })

  // ── NAVIGATION ─────────────────
  await page.getByRole('link', { name: ' Auctions' }).click();

  let i = 0;
  // ── CSV LOOP ───────────────────
  for (const [index, item] of items.entries()) {
    // if (index > 0) break; // SAFETY: remove after testing
    
    await page.goto(
      auctionUrl
    );
    
    console.log(`Adding item: ${item.title}`);
    i += 1
    console.log(`Adding item: ${i} / ${items.length}`);
    // await page.waitForTimeout(3000);

    await page.getByRole('link', { name: 'New item', exact: true }).click();

    await page.getByRole('textbox', { name: 'Title' }).fill(item.title + ' - ' + item.descriptor);
    
    await page.getByRole('textbox', { name: 'Location ?' }).fill(item.location);

    await page.getByRole('spinbutton', { name: 'Estimated value ?' })
      .fill(String(item.estimatedValue));

    await page.getByRole('spinbutton', { name: 'Starting bid' })
      .fill(String(item.startingBid));

    await page.getByRole('textbox', {
      name: /Short description/
    }).fill(item.shortDescription);

    await page.locator('button .filter-option-inner-inner').click();
    await page.getByRole('listbox').getByText(item.category, { exact: true }).click();

    const longDescriptionEditor = page
      .locator('#overview-editor[contenteditable="true"]');
    await longDescriptionEditor.waitFor({ state: 'visible' });
    '#overview-editor'
    await longDescriptionEditor.click();
    await longDescriptionEditor.fill(item.longDescription);


    await page.getByRole('button', {
      name: 'Save & continue to images'
    }).click();

    // click through to item details
    await page.locator('#add_image, #go-to-edit-page').click();

    // ── IMAGES (optional) ─────────
    const urls = parseImageUrls(item.imageUrls);

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const ext = path.extname(url).split('?')[0] || '.png';
      const filename = `item-${Date.now()}-${i}${ext}`;

      const localPath = await downloadImage(url, filename);

      //Add Image Buttons
      await page.locator('#add_image').click();
      const imageModal = page.locator('#new_image');

      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByRole('link', { name: 'Browse' }).click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(localPath);

      await page.locator('#new_image_form')
        .getByRole('button', { name: 'Save' }).click();
      await imageModal.waitFor({ state: 'hidden' });
      await page.waitForTimeout(1000);
    }
    
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // ── DONOR ─────────────────────
    await page.getByRole('link', { name: 'Donor' }).click();

    if (item.donorName && item.donorName.trim() !== "") {
      await page.locator('#display_name').fill(item.donorName);
    }

    if (item.donorWebsite && item.donorWebsite.trim() !== "") {
      await page.getByRole('textbox', { name: 'Website' })
        .fill(item.donorWebsite);
    }

    if (item.fulfillmentName && item.fulfillmentName.trim() !== "") {
      await page.locator('#fulfillment_name')
        .fill(item.fulfillmentName);
    }

    if (item.fulfillmentEmail && item.fulfillmentEmail.trim() !== "") {
      await page.getByRole('textbox', { name: 'Email' })
        .fill(item.fulfillmentEmail);
    }

    if (item.donorName || item.donorWebsite | item.fulfillmentName || item.fulfillmentEmail) {
      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForTimeout(500);
    }

    // fill notes with special instructions if populated
    if (item.notes) {
      const notesField = page
        .locator('#notes-editor[contenteditable="true"]');
      await notesField.waitFor({ state: 'visible' });
      await notesField.click();
      await notesField.fill(item.notes);
      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForTimeout(500);
    }

    await page.goto(auctionUrl);
    await page.waitForLoadState('networkidle');
  }
});
