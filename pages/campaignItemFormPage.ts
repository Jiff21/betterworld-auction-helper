import { Page } from '@playwright/test';
import path from 'path';
import { parseImageUrls } from '../utils/parseImageUrls';
import { downloadImage } from '../utils/downloadImages';

export class CampaignItemFormPage {
  constructor(private readonly page: Page) {}

  private get titleInput() {
    return this.page.getByRole('textbox', { name: 'Title' });
  }

  async waitForReady() {
    await this.titleInput.waitFor({ state: 'visible' });
  }

  private get nextButton() {
    return this.page.locator('a.next');
  }

  private get longDescriptionField() {
    return this.page.locator('#long_desc-editor');
  }
  
  private get amountInput() {
    return this.page.locator('input[name="amount"]');
  }

  private get quantityInput() {
    return this.page.locator('#quantity');
  }
  
  private get createItemButton() {
    return this.page.locator('a.submit');
  }
  private get notesTab() {
    return this.page.getByRole('link', { name: 'Internal Notes' });
  }
  
  private get notesForm() {
    return this.page.locator('#notes-editor');
  }

  private get notesSave() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  // Fill out campaign basic info
  async fillBasicInfo(item: any) {
    await this.waitForReady();

    // fill title and move to next part of form
    await this.titleInput.fill(`${item.title}`);
    await this.nextButton.click();

    // fill long description and move to next park of form
    await this.longDescriptionField.fill(`${item.description}`);
    await this.nextButton.click();

    // fill amount and move to next park of form
    await this.amountInput.fill(`${item.amount}`);
    await this.nextButton.click();

    // fill quantity and move to next park of form
    await this.quantityInput.fill(`${item.quantity}`);
    await this.nextButton.click();

    // create item
    await Promise.all([
      this.createItemButton.click(),
    ]);
  }

  // upload item images
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

  // Fill out internal notes
  async filllOutNotes(item: any) {
    await this.waitForReady();

    // Move to notes tab
    await this.notesTab.click();

    // fill long description and move to next park of form
    await this.notesForm.fill(`${item.notes}`);

    // create item
    await Promise.all([
      this.notesSave.click(),
    ]);
  }

}
