import { test, expect, type Page } from '@playwright/test';

const key = 'subtrack.demo.v1';
const saved = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key);
async function demo(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Login for demo' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your subscriptions' }),
  ).toBeVisible();
}
async function nav(page: Page, name: string) {
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  if (await toggle.isVisible()) await toggle.click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name, exact: true })
    .click();
}
async function backups(page: Page) {
  await nav(page, 'Inbox');
  await page.getByText('Saved data and backups', { exact: true }).click();
}
const receipt = {
  service_name: 'Real service',
  amount: 24,
  currency: 'USD',
  billing_cycle: 'monthly',
  next_billing_date: '2026-10-25',
  category: 'Productivity',
};
async function account(page: Page) {
  await page.addInitScript(() =>
    localStorage.setItem('authToken', 'test-account-token'),
  );
  await page.route('**/api/subscriptions', (route) =>
    route.fulfill({ json: [receipt] }),
  );
  await page.goto('/app');
  await expect(
    page.getByRole('button', { name: 'View Real service', exact: true }),
  ).toBeVisible();
}

test('demo is read-only, works offline, and shows only essential information', async ({
  page,
}) => {
  const backend: string[] = [];
  page.on('request', (req) => {
    if (/localhost:(8000|8080)/.test(req.url())) backend.push(req.url());
  });
  await demo(page);
  await expect(page.locator('.subscription-row')).toHaveCount(7);
  await expect(page.locator('.summary-spend strong')).toContainText('$125.45');
  await expect(
    page.getByRole('button', { name: /Add subscription|Edit|Remove/ }),
  ).toHaveCount(0);
  await expect(page.getByText('Monthly budget', { exact: true })).toHaveCount(
    0,
  );
  await page.getByLabel('Search subscriptions').fill('netflix');
  await expect(page.locator('.subscription-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'View Netflix', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('textbox')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Edit|Remove|Save/ }),
  ).toHaveCount(0);
  await expect(
    page.getByText('Next payment', { exact: true }).last(),
  ).toBeVisible();
  await expect(page.locator('.receipt-history')).not.toHaveAttribute(
    'open',
    '',
  );
  await page.getByText('Sample receipt history', { exact: true }).click();
  await expect(page.locator('.history-row')).toHaveCount(4);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Search subscriptions').fill('unknown');
  await expect(
    page.getByRole('heading', { name: 'No matching subscriptions' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.locator('.subscription-row')).toHaveCount(7);
  await nav(page, 'Insights');
  await expect(page.locator('.category-total strong')).toHaveText('$125.45');
  expect(backend).toEqual([]);
});

test('saved demo details survive reload, navigation and sign-out without reseeding', async ({
  page,
}) => {
  await demo(page);
  const original = await saved(page);
  await page.reload();
  await nav(page, 'Calendar');
  await nav(page, 'Home');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByRole('button', { name: 'Login for demo' }).click();
  expect(await saved(page)).toEqual(original);
});

test('future visits keep the original receipts and project renewals without expiry', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-14T10:00:00+07:00') });
  await demo(page);
  const original = await saved(page);
  await page.clock.setSystemTime(new Date('2036-02-20T10:00:00+07:00'));
  await page.reload();
  await expect(page.locator('.subscription-row')).toHaveCount(7);
  expect(await saved(page)).toEqual(original);
  await page.getByRole('button', { name: 'View Netflix', exact: true }).click();
  await expect(
    page.getByRole('dialog').getByText('Mar 16, 2036'),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await nav(page, 'Calendar');
  await expect(
    page.getByRole('heading', { name: 'February 2036' }),
  ).toBeVisible();
  await page.getByText('Payment list', { exact: true }).click();
  await expect(page.locator('.agenda-list button')).toHaveCount(6);
});

test('backup tools are tucked away and preserve valid data without accepting malformed files', async ({
  page,
}) => {
  await demo(page);
  const original = await saved(page);
  await nav(page, 'Inbox');
  await expect(
    page.getByRole('button', { name: 'Export backup' }),
  ).not.toBeVisible();
  await page.getByText('Saved data and backups', { exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  expect((await download).suggestedFilename()).toMatch(
    /subtrack-demo-.*\.json/,
  );
  await page.getByLabel('Workspace backup file').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"subscriptions":[null]}'),
  });
  await expect(
    page.getByText('This file does not contain a valid SubTrack workspace.'),
  ).toBeVisible();
  expect(await saved(page)).toEqual(original);
  const replacement = {
    ...original,
    subscriptions: original.subscriptions.slice(0, 2),
  };
  await page.getByLabel('Workspace backup file').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(replacement)),
  });
  await page
    .getByRole('button', { name: 'Restore workspace', exact: true })
    .click();
  await page.reload();
  expect(await saved(page)).toEqual(replacement);
});

test('empty and unreadable saved workspaces are never silently replaced', async ({
  page,
}) => {
  await demo(page);
  await page.goto('/');
  await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!);
    data.subscriptions = [];
    localStorage.setItem(key, JSON.stringify(data));
  }, key);
  await page.goto('/app');
  await expect(
    page.getByRole('heading', { name: 'No subscriptions yet' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add subscription' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByRole('button', { name: 'Login for demo' }).click();
  await expect(page.locator('.subscription-row')).toHaveCount(0);
  await page.goto('/');
  await page.evaluate((key) => localStorage.setItem(key, 'corrupt data'), key);
  await page.goto('/app');
  await expect(
    page.getByRole('heading', { name: 'Saved workspace needs attention' }),
  ).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    'corrupt data',
  );
});

test('fresh email receipts update amounts and dates, and successful empty responses clear stale services', async ({
  page,
}) => {
  await account(page);
  await page.unroute('**/api/subscriptions');
  await page.route('**/api/subscriptions', (route) =>
    route.fulfill({
      json: [
        {
          ...receipt,
          amount: 30,
          next_billing_date: '2026-11-05',
          category: 'Cloud storage',
        },
        { ...receipt, service_name: 'New service', amount: 5 },
      ],
    }),
  );
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.locator('.summary-spend strong')).toContainText('$35.00');
  await page
    .getByRole('button', { name: 'View Real service', exact: true })
    .click();
  await expect(page.getByRole('dialog').getByText('Nov 5, 2026')).toBeVisible();
  await expect(
    page.getByRole('dialog').getByText('Cloud storage'),
  ).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('textbox')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.unroute('**/api/subscriptions');
  await page.route('**/api/subscriptions', (route) =>
    route.fulfill({ json: [] }),
  );
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'No subscriptions yet' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('subtrack.account.v1')!).subscriptions,
    ),
  ).toEqual([]);
});

test('backend failures and invalid receipts retain the cached email data', async ({
  page,
}) => {
  await account(page);
  const original = await page.evaluate(() =>
    localStorage.getItem('subtrack.account.v1'),
  );
  await page.unroute('**/api/subscriptions');
  await page.route('**/api/subscriptions', (route) => route.abort());
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(
    page.getByText(
      'Could not reach Gmail. Your saved subscriptions are still available.',
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('subtrack.account.v1')),
  ).toBe(original);
  for (const variant of [
    { ...receipt, next_billing_date: '2026-02-30' },
    { ...receipt, currency: 'THB' },
  ]) {
    await page.unroute('**/api/subscriptions');
    await page.route('**/api/subscriptions', (route) =>
      route.fulfill({ json: [variant] }),
    );
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    const message =
      variant.currency === 'THB'
        ? 'This workspace supports USD only. Your saved data was kept.'
        : 'Some receipts are missing a valid amount or billing date. Your saved data was kept.';
    await expect(page.getByText(message)).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem('subtrack.account.v1')),
    ).toBe(original);
  }
});

test('email refreshes remain available in memory when browser storage is full', async ({
  page,
}) => {
  await account(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await page.unroute('**/api/subscriptions');
  await page.route('**/api/subscriptions', (route) =>
    route.fulfill({ json: [{ ...receipt, amount: 40 }] }),
  );
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Browser storage is full or unavailable',
  );
  await expect(page.locator('.summary-spend strong')).toContainText('$40.00');
  await backups(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  expect((await download).suggestedFilename()).toContain('subtrack-workspace-');
});

test('Google and Gmail screens preserve the OAuth flow without pretending to connect', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(
    page.getByText(
      'Google sign-in is not configured for this preview. Use Login for demo to explore.',
    ),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Login for demo' }).click();
  await page.goto('/add-gmail');
  await expect(
    page.getByRole('heading', { name: 'Your demo inbox is ready' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Connect with Google' }),
  ).toHaveCount(0);
  await page.goto('/gmail-callback?error=access_denied');
  await expect(
    page.getByRole('heading', { name: 'Connection needs another try' }),
  ).toBeVisible();
  await page.route('**/api/gmail/callback', (route) => route.abort());
  await page.goto('/gmail-callback?code=example&state=example');
  await expect(
    page.getByRole('heading', { name: 'Connection needs another try' }),
  ).toBeVisible();
});

test('animated details dismiss with Escape and return keyboard focus to the selected service', async ({
  page,
}) => {
  await demo(page);
  const card = page.getByRole('button', { name: 'View Netflix', exact: true });
  await card.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(card).toBeFocused();
  await card.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await nav(page, 'Calendar');
  const originalMonth = await page.locator('.calendar-header h2').textContent();
  await page.getByRole('button', { name: 'Next month' }).click();
  await expect(page.locator('.calendar-header h2')).not.toHaveText(
    originalMonth!,
  );
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(page.locator('.calendar-header h2')).toHaveText(originalMonth!);
});

test('reduced motion keeps navigation and service details usable without decorative movement', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await demo(page);
  expect(
    await page
      .locator('.service-stack')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await page.getByRole('button', { name: 'View Netflix', exact: true }).click();
  expect(
    await page
      .getByRole('dialog')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await nav(page, 'Insights');
  await expect(
    page.getByRole('heading', { name: 'Spending insights' }),
  ).toBeVisible();
});

for (const width of [320, 390, 768, 1440]) {
  test(`read-only screens fit a ${width}px viewport`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await demo(page);
    if (width <= 760) {
      const navBounds = await page
        .getByRole('navigation', { name: 'Main navigation' })
        .boundingBox();
      expect(navBounds?.y).toBeGreaterThan(700);
    }
    for (const route of ['', '/calendar', '/insights', '/settings']) {
      await page.goto('/app' + route);
      await expect(page.locator('.page-header h1')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow on ${route}`,
      ).toBe(true);
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: testInfo.outputPath(`${route.slice(1) || 'overview'}.png`),
          fullPage: true,
        });
    }
    await nav(page, 'Home');
    await page
      .getByRole('button', { name: 'View Netflix', exact: true })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole('button', { name: 'Close', exact: true }).click();
  });
}
