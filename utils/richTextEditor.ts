import { Page, expect } from '@playwright/test';

export async function fillRichTextEditor(
  page: Page,
  containerSelector: string,
  text: string
) {
  if (!text?.trim()) return;

  const container = page.locator(containerSelector);

  // Activate editor
  await container.scrollIntoViewIfNeeded();
  await container.click({ force: true });

  const editor = container.locator('[data-medium-focused="true"]').first();
  
  // Type using keyboard events
  await page.keyboard.type(text, { delay: 1 });
  // await editor.fill(text);

  // Blur to force commit
  await page.keyboard.press('Tab');
}
