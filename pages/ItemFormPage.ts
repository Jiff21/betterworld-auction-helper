import { Page } from '@playwright/test';
import path from 'path';
import { parseImageUrls } from '../utils/parseImageUrls';
import { downloadImage } from '../utils/downloadImages';
import { fillRichTextEditor } from '../utils/richTextEditor';


export class ItemFormPage {
  constructor(private readonly page: Page) {}

  // ─────────────────────────────────────────────
  // Lazy locators (evaluated at time of use)
  // ─────────────────────────────────────────────
  private get titleInput() {
    return this.page.getByRole('textbox', { name: 'Title' });
  }

  private get locationInput() {
    return this.page.getByRole('textbox', { name: 'Location ?' });
  }

  private get estimatedValueInput() {
    return this.page.getByRole('spinbutton', { name: 'Estimated value ?' });
  }

  private get startingBidInput() {
    return this.page.getByRole('spinbutton', { name: 'Starting bid' });
  }

  private get shortDescriptionInput() {
    return this.page.getByRole('textbox', {
      name: /Short description/,
    });
  }

  private get saveAndContinueButton() {
    return this.page.getByRole('button', {
      name: 'Save & continue to images',
    });
  }

  // ─────────────────────────────────────────────
  // Page readiness
  // ─────────────────────────────────────────────
  async waitForReady() {
    await this.titleInput.waitFor({ state: 'visible' });
  }



  // ─────────────────────────────────────────────
  // Public actions
  // ─────────────────────────────────────────────
  async fillBasicInfo(item: any) {
    await this.waitForReady();

    await this.titleInput.fill(`${item.title} - ${item.descriptor}`);
    await this.locationInput.fill(item.location);
    await this.estimatedValueInput.fill(String(item.estimatedValue));
    await this.startingBidInput.fill(String(item.startingBid));
    await this.shortDescriptionInput.fill(item.shortDescription);

    // Category selection
    await this.page
      .locator('button .filter-option-inner-inner')
      .click();

    await this.page
      .getByRole('listbox')
      .getByText(item.category, { exact: true })
      .click();

    // Long description
    await fillRichTextEditor(
      this.page,
      '#overview-editor',
      item.longDescription
    );


    // Navigation-safe save
    await Promise.all([
      this.saveAndContinueButton.click(),
    ]);
  }

  async uploadImages(imageUrls?: string) {
    const urls = parseImageUrls(imageUrls);
    if (!urls.length) return;

    await this.page.locator('#go-to-edit-page').click();
    
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

      await Promise.all([
        imageModal.waitFor({ state: 'hidden' }),
        this.page
          .locator('#new_image_form')
          .getByRole('button', { name: 'Save' })
          .click(),
      ]);
    }

    await Promise.all([
      this.page.getByRole('button', { name: 'Save', exact: true }).click(),
    ]);
  }

  async fillDonor(item: any) {
    await this.page.getByRole('link', { name: 'Donor' }).click();

    if (item.donorName) {
      await this.page.locator('#display_name').fill(item.donorName);
    }

    if (item.donorWebsite) {
      await this.page
        .getByRole('textbox', { name: 'Website' })
        .fill(item.donorWebsite);
    }

    if (item.fulfillmentName) {
      await this.page
        .locator('#fulfillment_name')
        .fill(item.fulfillmentName);
    }

    if (item.fulfillmentEmail) {
      await this.page
        .getByRole('textbox', { name: 'Email' })
        .fill(item.fulfillmentEmail);
    }

    if (
      item.donorName ||
      item.donorWebsite ||
      item.fulfillmentName ||
      item.fulfillmentEmail
    ) {
      await Promise.all([
        this.page.getByRole('button', { name: 'Save', exact: true }).click(),
      ]);
    }
  }


  async fillNotes(notes?: string) {
    if (!notes?.trim()) return;

    await this.page.getByRole('link', { name: 'Notes' }).click();
    
    await fillRichTextEditor(
      this.page,
      '#notes-editor',
      notes
    );


    await Promise.all([
      this.page.getByRole('button', { name: 'Save', exact: true }).click(),
    ]);
  }
}
