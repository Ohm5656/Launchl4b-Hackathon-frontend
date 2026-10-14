import { test, expect, type Page } from '@playwright/test';

const key = 'subtrack.demo.v1';
async function demo(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Login for demo' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your subscriptions' }),
  ).toBeVisible();
}
const saved = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key);
async function nav(page: Page, name: string) {
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  if (await toggle.isVisible()) await toggle.click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name, exact: true })
    .click();
}

test('demo works offline, has consistent totals, and supports search and category filters', async ({
  page,
}) => {
  const backend: string[] = [];
  page.on('request', (req) => {
    if (/localhost:(8000|8080)/.test(req.url())) backend.push(req.url());
  });
  await demo(page);
  await expect(page.locator('.subscription-row')).toHaveCount(7);
  await expect(page.locator('.summary-spend strong')).toHaveText('$125.45');
  await page.getByLabel('Search subscriptions').fill('netflix');
  await expect(page.locator('.subscription-row')).toHaveCount(1);
  await page.getByLabel('Search subscriptions').fill('unknown');
  await expect(
    page.getByRole('heading', { name: 'No matching subscriptions' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('Filter by category').selectOption('Productivity');
  await expect(page.locator('.subscription-row')).toHaveCount(2);
  await nav(page, 'Spending insights');
  await expect(page.locator('.category-total strong')).toHaveText('$125.45');
  await expect(
    page.locator('.insight-stats').getByText('$1,505.40', { exact: true }),
  ).toBeVisible();
  expect(backend).toEqual([]);
});

test('edits, notes, payment history and preferences survive reload and sign-out', async ({
  page,
}) => {
  await demo(page);
  const history = (await saved(page)).subscriptions[0].paymentHistory;
  await page.getByRole('button', { name: 'View Netflix', exact: true }).click();
  await page.getByRole('button', { name: 'Edit details' }).click();
  await page.getByLabel('Amount (USD)').fill('20.49');
  await page
    .getByLabel('Notes', { exact: true })
    .fill('Keep for weekend movie nights. Review next month.');
  await page.getByRole('button', { name: 'Save subscription' }).click();
  await expect(page.locator('.summary-spend strong')).toHaveText('$130.45');
  await nav(page, 'Settings');
  await page.getByLabel('Budget (USD)').fill('200');
  await page.getByRole('button', { name: 'Save budget' }).click();
  await page.getByRole('switch').click();
  await page.reload();
  await expect(page.getByRole('switch')).toHaveAttribute(
    'aria-checked',
    'false',
  );
  await expect(page.getByLabel('Budget (USD)')).toHaveValue('200');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('button', { name: 'Login for demo' }).click();
  await page.getByRole('button', { name: 'View Netflix', exact: true }).click();
  await expect(
    page.getByText('Keep for weekend movie nights. Review next month.'),
  ).toBeVisible();
  expect((await saved(page)).subscriptions[0].paymentHistory).toEqual(history);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await nav(page, 'Spending insights');
  await expect(page.locator('.category-total strong')).toHaveText('$130.45');
});

test('manual annual subscriptions appear across pages and removal stays removed', async ({
  page,
}) => {
  await demo(page);
  await page
    .getByRole('button', { name: 'Add subscription', exact: true })
    .click();
  await page.getByLabel('Service name').fill('Design Toolkit');
  await page.getByLabel('Amount (USD)').fill('120');
  await page.getByLabel('Billing cycle').selectOption('yearly');
  await page.getByLabel('Billing date').fill('2026-10-31');
  await page
    .getByLabel('Notes', { exact: true })
    .fill('Annual license for design projects.');
  await page.getByRole('button', { name: 'Save subscription' }).click();
  await expect(page.locator('.summary-spend strong')).toHaveText('$135.45');
  await nav(page, 'Billing calendar');
  await expect(
    page.locator('.agenda-list').getByText('Design Toolkit'),
  ).toBeVisible();
  await nav(page, 'Overview');
  await page
    .getByRole('button', { name: 'View Design Toolkit', exact: true })
    .click();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(
    page.getByText('It does not cancel', { exact: false }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Remove subscription', exact: true })
    .click();
  await page.reload();
  await expect(page.locator('.subscription-row')).toHaveCount(7);
  await expect(
    page.getByRole('button', { name: 'View Design Toolkit' }),
  ).toHaveCount(0);
});

test('future visits preserve the original records and project renewals without expiry', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-14T10:00:00+07:00') });
  await demo(page);
  const original = await saved(page);
  await page.clock.setSystemTime(new Date('2036-02-20T10:00:00+07:00'));
  await page.reload();
  await expect(page.locator('.subscription-row')).toHaveCount(7);
  expect(await saved(page)).toEqual(original);
  const days = await page.locator('.renewal-cell small').allTextContents();
  expect(
    days.every((d) => d === 'Today' || Number(d.match(/\d+/)?.[0]) <= 366),
  ).toBe(true);
  await nav(page, 'Billing calendar');
  await expect(
    page.getByRole('heading', { name: 'February 2036' }),
  ).toBeVisible();
  await expect(page.locator('.agenda-list button')).toHaveCount(6);
});

test('export and restore preserve details, and malformed backups never overwrite data', async ({
  page,
}) => {
  await demo(page);
  const original = await saved(page);
  await nav(page, 'Settings');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/subtrack-demo-.*\.json/);
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
    preferences: { budget: 300, reminders: false },
    subscriptions: original.subscriptions.slice(0, 2),
  };
  await page.getByLabel('Workspace backup file').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(replacement)),
  });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page
    .getByRole('button', { name: 'Restore workspace', exact: true })
    .click();
  await page.reload();
  expect(await saved(page)).toEqual(replacement);
  await nav(page, 'Overview');
  await expect(page.locator('.subscription-row')).toHaveCount(2);
});

test('an intentionally empty workspace stays empty and saved corruption is retained', async ({
  page,
}) => {
  await demo(page);
  await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!);
    data.subscriptions = [];
    localStorage.setItem(key, JSON.stringify(data));
  }, key);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Your workspace is ready' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('button', { name: 'Login for demo' }).click();
  await expect(page.locator('.subscription-row')).toHaveCount(0);
  await page.evaluate((key) => localStorage.setItem(key, 'corrupt data'), key);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Saved workspace needs attention' }),
  ).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    'corrupt data',
  );
});

test('real receipts remain cached when the backend becomes unavailable', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('authToken', 'test-account-token'),
  );
  await page.route('**/api/subscriptions', (route) =>
    route.fulfill({
      json: [
        {
          service_name: 'Real service',
          amount: 24,
          currency: 'USD',
          billing_cycle: 'monthly',
          next_billing_date: '2026-10-25',
          category: 'Productivity',
        },
      ],
    }),
  );
  await page.goto('/app');
  await expect(
    page.getByRole('button', { name: 'View Real service' }),
  ).toBeVisible();
  await page.unroute('**/api/subscriptions');
  await page.route('**/api/subscriptions', (route) => route.abort());
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'View Real service' }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Could not reach Gmail. Your saved subscriptions are still available.',
    ),
  ).toBeVisible();
  await expect(page.locator('.demo-badge')).toHaveCount(0);
});

test('refreshing real receipts does not overwrite saved plan details or notes', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('authToken', 'test-account-token'),
  );
  await page.route('**/api/subscriptions', (route) =>
    route.fulfill({
      json: [
        {
          service_name: 'Real service',
          amount: 24,
          currency: 'USD',
          billing_cycle: 'monthly',
          next_billing_date: '2026-10-25',
          category: 'Productivity',
        },
      ],
    }),
  );
  await page.goto('/app');
  await page.getByRole('button', { name: 'View Real service' }).click();
  await page.getByRole('button', { name: 'Edit details' }).click();
  await page
    .getByLabel('Notes', { exact: true })
    .fill('Keep this review note after refreshing receipts.');
  await page.getByRole('button', { name: 'Save subscription' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'View Real service' }).click();
  await expect(
    page.getByText('Keep this review note after refreshing receipts.'),
  ).toBeVisible();
});

test('invalid receipt dates and mixed currencies keep the cached workspace intact', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('authToken', 'test-account-token'),
  );
  const receipt = {
    service_name: 'Existing service',
    amount: 24,
    currency: 'USD',
    billing_cycle: 'monthly',
    next_billing_date: '2026-10-25',
  };
  await page.route('**/api/subscriptions', (route) =>
    route.fulfill({ json: [receipt] }),
  );
  await page.goto('/app');
  await expect(
    page.getByRole('button', { name: 'View Existing service' }),
  ).toBeVisible();
  const original = await page.evaluate(() =>
    localStorage.getItem('subtrack.account.v1'),
  );
  await nav(page, 'Settings');
  for (const variant of [
    { ...receipt, next_billing_date: '2026-02-30' },
    { ...receipt, currency: 'THB' },
  ]) {
    await page.unroute('**/api/subscriptions');
    await page.route('**/api/subscriptions', (route) =>
      route.fulfill({ json: [variant] }),
    );
    await page.getByRole('button', { name: 'Refresh receipts' }).click();
    await expect(
      page.getByText(/Your saved data was kept/).last(),
    ).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem('subtrack.account.v1')),
    ).toBe(original);
  }
});

test('storage failures are visible and edits remain exportable in the current tab', async ({
  page,
}) => {
  await demo(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await page
    .getByRole('button', { name: 'Add subscription', exact: true })
    .click();
  await page.getByLabel('Service name').fill('Unsaved service');
  await page.getByLabel('Amount (USD)').fill('5');
  await page.getByRole('button', { name: 'Save subscription' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Browser storage is full or unavailable',
  );
  await expect(
    page.getByText('Changes not saved', { exact: true }),
  ).toBeVisible();
  await nav(page, 'Settings');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  expect((await download).suggestedFilename()).toContain('subtrack-demo-');
});

test('Google and Gmail connection screens do not simulate successful authentication', async ({
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

test('layouts fit phone, tablet and desktop widths, with usable mobile navigation', async ({
  page,
}, testInfo) => {
  // This check navigates sixteen pages and captures eight full-page previews.
  test.setTimeout(60_000);
  await demo(page);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['', '/calendar', '/insights', '/settings']) {
      await page.goto('/app' + route);
      await expect(page.locator('.page-header h1')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `overflow at ${width} on ${route}`,
      ).toBe(true);
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: testInfo.outputPath(
            `${width}-${route.slice(1) || 'overview'}.png`,
          ),
          fullPage: true,
        });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await nav(page, 'Overview');
  await expect(
    page.getByRole('heading', { name: 'Your subscriptions' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open navigation' }),
  ).toBeVisible();
});
