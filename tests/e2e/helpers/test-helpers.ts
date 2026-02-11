import { Page } from '@playwright/test';

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for all animations to complete
 */
export async function waitForAnimations(page: Page) {
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.querySelectorAll('*')).map((element) => {
        const animations = element.getAnimations();
        return Promise.all(animations.map((animation) => animation.finished));
      })
    );
  });
}

/**
 * Take a screenshot with a meaningful name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `tests/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Login helper for quick authentication
 */
export async function quickLogin(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin|\/app/, { timeout: 10000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Minha Conta")');
  if (await userMenu.isVisible()) {
    await userMenu.click();
  }
  await page.getByRole('button', { name: /sair|logout/i }).click();
  await page.waitForURL(/\/login/);
}

/**
 * Clear all cookies and local storage
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Mock API response
 */
export async function mockApiResponse(page: Page, url: string, response: any) {
  await page.route(url, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, text?: string) {
  const toast = page.locator('[role="status"], .toast, [data-testid="toast"]');
  await toast.waitFor({ state: 'visible' });
  
  if (text) {
    await toast.locator(`text="${text}"`).waitFor({ state: 'visible' });
  }
  
  return toast;
}

/**
 * Dismiss all toasts
 */
export async function dismissToasts(page: Page) {
  const closeButtons = page.locator('[role="status"] button, .toast button');
  const count = await closeButtons.count();
  
  for (let i = 0; i < count; i++) {
    await closeButtons.nth(i).click();
  }
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, selector);
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, selector);
  await page.waitForTimeout(500); // Wait for smooth scroll
}

/**
 * Get text content cleaned up
 */
export async function getCleanText(page: Page, selector: string): Promise<string> {
  const element = page.locator(selector);
  const text = await element.textContent();
  return text?.trim().replace(/\s+/g, ' ') || '';
}

/**
 * Fill form with multiple fields
 */
export async function fillForm(page: Page, formData: Record<string, string>) {
  for (const [name, value] of Object.entries(formData)) {
    const input = page.locator(`input[name="${name}"], textarea[name="${name}"]`);
    if (await input.isVisible()) {
      await input.fill(value);
    }
  }
}

/**
 * Check accessibility of current page
 */
export async function checkAccessibility(page: Page) {
  const violations = await page.evaluate(() => {
    const issues: string[] = [];
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.alt) {
        issues.push(`Image without alt text: ${img.src}`);
      }
    });
    
    // Check for button labels
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
        issues.push('Button without text or aria-label');
      }
    });
    
    // Check for form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const id = input.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label) {
          issues.push(`Input without label: ${id}`);
        }
      }
    });
    
    return issues;
  });
  
  return violations;
}

/**
 * Retry an action until it succeeds or timeout
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}