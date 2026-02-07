import { Page } from '@playwright/test';
import path from 'path';
import { parseImageUrls } from './parseImageUrls';
import { downloadImage } from './downloadImages';

/**
 * Shared flow for uploading item images in Better World item forms.
 * Used by both ItemFormPage (auction items) and CampaignItemFormPage (campaign items)
 * when the image UI is the same (#add_image, #new_image, Browse, Save).
 */
export async function uploadItemImages(
  page: Page,
  imageUrls?: string
): Promise<void> {
  const urls = parseImageUrls(imageUrls);
  if (!urls.length) return;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const ext = path.extname(url).split('?')[0] || '.png';
    const filename = `item-${Date.now()}-${i}${ext}`;
    const localPath = await downloadImage(url, filename);

    const imageModal = page.locator('#new_image');

    await page.locator('#add_image').click();

    const chooser = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('link', { name: 'Browse' }).click(),
    ]).then(([fc]) => fc);

    await chooser.setFiles(localPath);

    await Promise.all([
      imageModal.waitFor({ state: 'hidden' }),
      page
        .locator('#new_image_form')
        .getByRole('button', { name: 'Save' })
        .click(),
    ]);
  }

  await Promise.all([
    page.getByRole('button', { name: 'Save', exact: true }).click(),
  ]);
}
