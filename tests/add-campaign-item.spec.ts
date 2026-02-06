import { test } from '@playwright/test';
import dotenv from 'dotenv';

import { readCampaignItems } from '../utils/readCampaignCsv';
import { LoginPage } from '../pages/LoginPage';
import { DonationCampaign } from '../pages/DonationCampaign';
import { CampaignItemFormPage } from '../pages/campaignItemFormPage';

dotenv.config({ path: 'secrets/local.env' });

const donationItemsUrl = process.env.DONATION_CAMPAIGN_URL;

if (!donationItemsUrl) {
  console.error('DONATION_CAMPAIGN_URL is not set. Please create a secrets/local.env file.');
  process.exit(1);
}

test.describe('Campaign item ingestion', () => {
  test('Add Campaign items from CSV', async ({ page }) => {
    test.setTimeout(10 * 60 * 1000);

    const items = readCampaignItems();
    console.log(`\n▶ Adding new ${items.length} items found`);

    const loginPage = new LoginPage(page);
    const donationPage = new DonationCampaign(page);
    const campaignItemFormPage = new CampaignItemFormPage(page);

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
      await donationPage.goToItems(donationItemsUrl);

      // Start item creation
      await donationPage.startNewItem();

      // ── ITEM WORKFLOW ────────────────────
      await campaignItemFormPage.fillBasicInfo(item);
      await campaignItemFormPage.uploadImages(item.imageUrls);
      await campaignItemFormPage.filllOutNotes(item);

    }
  });
});
