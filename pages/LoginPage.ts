import { Page, Locator } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  // Lazy locators
  private get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  private get signInButton(): Locator {
    return this.page.getByRole('button', {
      name: 'Sign in',
      exact: true,
    });
  }

  async goto() {
    await this.page.goto('https://betterworld.org/sign-in/');
  }

  async login(email: string, password: string) {
    await this.emailInput.waitFor({ state: 'visible' });

    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    await Promise.all([
      this.page.waitForNavigation(),
      this.signInButton.click(),
    ]);
  }
}
