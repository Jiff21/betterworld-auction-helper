import { Page } from '@playwright/test';
import path from 'path';
import { parseImageUrls } from '../utils/parseImageUrls';
import { downloadImage } from '../utils/downloadImages';

export class ItemFormPage {
  constructor(private readonly page: Page) {}

  // ─────────────────────────────────────────────
  // Locators (named once, reused everywhere)
  // ─────────────────────────────────────────────
  private titleInput = this.page.getByRole('textbox', { name: 'Title' });
  private locationInput = this.page.getByRole('textbox', { name: 'Location ?' });
  private estimatedValueInput = this.page.getByRole('spinbutton', {
    name: 'Estimated value ?',
  });
  private startingBidInput = this.page.getByRole('spinbutton', {
    name: 'Starting bid',
  });
  private shortDescriptionInput = this.page.getByRole('textbox', {
    name: /Short description/,
  });

  private overviewEditorContainer = this.page.locator('#overview-editor');
  private saveAndContinueButton = this.page.getByRole('button', {
    name: 'Save & continue to images',
  });

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────
  private async fillRichText(
    containerSelector: string,
    text: string
  ) {
    if (!text || !text.trim()) return;

    // Ensure form is mounted
    await this.titleInput.waitFor();

    const container = this.page.locator(containerSelector);
    const editor = container.locator('[contenteditable="true"]');

    // Activate editor (this causes editable node to mount)
    await container.click();

    // Wait for the actual editable surface
    await editor.waitFor({ state: 'attached' });

    // Fill content
    await editor.fill(text);
  }

  // ─────────────────────────────────────────────
  // Public page actions
  // ─────────────────────────────────────────────
  async fillBasicInfo(item: any) {
    await this.titleInput.fill(`${item.title} - ${item.descriptor}`);
    await this.locationInput.fill(item.location);
    await this.estimatedValueInput.fill(String(item.estimatedValue));
    await this.startingBidInput.fill(String(item.startingBid));
    await this.shortDescriptionInput.fill(item.shortDescription);

    // Category
    await this.page.locator('button .filter-option-inner-inner').click();
    await this.page
      .getByRole('listbox')
      .getByText(item.category, { exact: true })
      .click();

    // Long description (rich text)
    await this.fillRichText('#overview-editor', item.longDescription);

    await this.saveAndContinueButton.click();
  }

  async uploadImages(imageUrls?: string) {
    const urls = parseImageUrls(imageUrls);
    if (!urls.length) return;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const ext = path.extname(url).split('?')[0] || '.png';
      const filename = `item-${Date.now()}-${i}${ext}`;

      const localPath = await downloadImage(url, filename);

      const imageModal = this.page.locator('#new_image');

      await this.page.locator('#add_image').click();

      const chooser = await Promise.all([
        this.page.waitForEvent('filechooser'),
        this.page.getByRole('link', { name: 'Browse' }).click(),
      ]).then(([fc]) => fc);

      await chooser.setFiles(localPath);

      await this.page
        .locator('#new_image_form')
        .getByRole('button', { name: 'Save' })
        .click();

      await imageModal.waitFor({ state: 'hidden' });
    }

    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
  }

  async fillDonor(item: any) {
    await this.page.getByRole('link', { name: 'Donor' }).click();

    if (item.donorName)
      await this.page.locator('#display_name').fill(item.donorName);

    if (item.donorWebsite)
      await this.page
        .getByRole('textbox', { name: 'Website' })
        .fill(item.donorWebsite);

    if (item.fulfillmentName)
      await this.page
        .locator('#fulfillment_name')
        .fill(item.fulfillmentName);

    if (item.fulfillmentEmail)
      await this.page
        .getByRole('textbox', { name: 'Email' })
        .fill(item.fulfillmentEmail);

    if (
      item.donorName ||
      item.donorWebsite ||
      item.fulfillmentName ||
      item.fulfillmentEmail
    ) {
      await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    }
  }

  async fillNotes(notes?: string) {
    if (!notes || !notes.trim()) return;

    await this.page.getByRole('link', { name: 'Notes' }).click();
    await this.fillRichText('#notes-editor', notes);

    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
  }
}
