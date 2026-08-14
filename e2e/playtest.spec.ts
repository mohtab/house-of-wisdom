import { mkdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

type FixtureOptions = {
  language?: 'en' | 'ar';
  knowledge?: number;
  materials?: { timber: number; stone: number };
  xp?: { language: number; translation: number; mathematics: number; architecture: number };
  skills?: string[];
  inventory?: string[];
  activeActivityId?: string | null;
  started?: boolean;
  ghostIdentityRevealed?: boolean;
  deskRepaired?: boolean;
  ignoranceRevealed?: boolean;
  prologueComplete?: boolean;
};

function fixture(options: FixtureOptions = {}) {
  return {
    version: 3,
    knowledge: options.knowledge ?? 0,
    materials: options.materials ?? { timber: 0, stone: 0 },
    xp: options.xp ?? { language: 0, translation: 0, mathematics: 0, architecture: 0 },
    activeActivityId: options.activeActivityId ?? null,
    activityProgressMs: 0,
    lastUpdatedAt: Date.now(),
    skills: options.skills ?? [],
    inventory: options.inventory ?? ['torn-manuscript', 'worn-hammer'],
    language: options.language ?? 'en',
    started: options.started ?? false,
    comicSeen: options.started ?? false,
    ghostEncountered: options.started ?? false,
    ghostIdentityRevealed: options.ghostIdentityRevealed ?? false,
    deskRepaired: options.deskRepaired ?? false,
    ignoranceRevealed: options.ignoranceRevealed ?? false,
    prologueComplete: options.prologueComplete ?? false,
    offlineExplained: false,
    lastReward: null,
  };
}

async function setFixture(page: Page, state: ReturnType<typeof fixture>) {
  await page.goto('/');
  await page.evaluate((value) => {
    localStorage.clear();
    localStorage.setItem('house-of-wisdom-v03', JSON.stringify(value));
  }, state);
  await page.reload();
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

function captureRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

test.beforeAll(() => mkdirSync('playtest-artifacts', { recursive: true }));

test('the Arabic-first opening clearly establishes the mystery and the real-time loop', async ({ page, context }) => {
  const errors = captureRuntimeErrors(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'The House of Wisdom is silent.' })).toBeVisible();
  await expect(page.getByAltText('Four panels showing the researcher arriving and meeting the ghost')).toBeVisible();
  await expect(page.getByText('The manuscript restores meaning. The hammer restores the House.')).toBeVisible();
  await page.screenshot({ path: 'playtest-artifacts/v03-opening-desktop.png', fullPage: true });
  await expectNoHorizontalOverflow(page);

  const beganAt = Date.now();
  await page.getByRole('button', { name: 'Enter the House' }).click();
  await expect(page.getByText('The darkness swallows most of his words.')).toBeVisible();
  await page.getByRole('button', { name: 'Study', exact: true }).last().click();
  await expect(page.getByText('Trace the Broken Letters', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.activity-timer').getByText('6s', { exact: true }).first()).toBeVisible();

  const other = await context.newPage();
  await other.goto('about:blank');
  await other.bringToFront();
  await other.waitForTimeout(2_000);
  await page.bringToFront();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('house-of-wisdom-v03') ?? '{}').knowledge >= 1);
  const duration = Date.now() - beganAt;
  expect(duration).toBeGreaterThanOrEqual(5_700);
  expect(duration).toBeLessThan(7_800);
  await expect(page.getByText('+1', { exact: true }).first()).toBeVisible();
  await other.close();
  expect(errors).toEqual([]);
});

test('the Language tree reveals Al-Jahiz and remains usable on mobile', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await setFixture(page, fixture({
    started: true,
    knowledge: 70,
    xp: { language: 170, translation: 0, mathematics: 0, architecture: 0 },
    skills: ['first-letter', 'word-roots', 'grammar'],
    inventory: ['torn-manuscript', 'worn-hammer', 'first-word', 'restored-sentence'],
    activeActivityId: 'study-eloquence',
  }));
  await page.getByRole('button', { name: 'Language', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Language & Literature' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Voice behind the Words' })).toBeVisible();
  await page.getByRole('button', { name: /Understand.*55/ }).click();
  await expect(page.getByAltText('Al-Jahiz')).toBeVisible();
  await expect(page.getByText('Al-Jahiz', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/before the dust claims ownership/)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'playtest-artifacts/v03-al-jahiz-mobile.png', fullPage: true });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v03') ?? '{}'));
  expect(saved.ghostIdentityRevealed).toBe(true);
  expect(saved.inventory).toContain('al-jahiz-signature');
  expect(errors).toEqual([]);
});

test('restoring the Keeper desk names Ignorance and opens the journal', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await setFixture(page, fixture({
    started: true,
    knowledge: 30,
    materials: { timber: 5, stone: 4 },
    xp: { language: 180, translation: 0, mathematics: 0, architecture: 20 },
    skills: ['first-letter', 'word-roots', 'grammar', 'eloquence'],
    inventory: ['torn-manuscript', 'worn-hammer', 'first-word', 'restored-sentence', 'al-jahiz-signature'],
    activeActivityId: 'sort-stone',
    ghostIdentityRevealed: true,
  }));
  await page.getByRole('button', { name: 'Inventory', exact: true }).last().click();
  await page.getByRole('button', { name: 'Repair the desk' }).click();
  await expect(page.getByRole('heading', { name: 'The Keeper’s Desk lives again' })).toBeVisible();
  await expect(page.getByText(/gives it a name: Ignorance/)).toBeVisible();
  await page.getByRole('button', { name: 'Open the journal' }).click();
  await expect(page.getByRole('heading', { name: 'Journal of The First Word' })).toBeVisible();
  await expect(page.getByText('The House was not abandoned. It was silenced.')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'playtest-artifacts/v03-prologue-complete-desktop.png', fullPage: true });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v03') ?? '{}'));
  expect(saved.deskRepaired).toBe(true);
  expect(saved.ignoranceRevealed).toBe(true);
  expect(saved.prologueComplete).toBe(true);
  expect(saved.inventory).toContain('keeper-desk');
  expect(errors).toEqual([]);
});

test('Arabic RTL preserves progress and readable controls at tablet width', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  await setFixture(page, fixture({
    started: true,
    language: 'en',
    knowledge: 23.5,
    xp: { language: 72, translation: 0, mathematics: 0, architecture: 0 },
    skills: ['first-letter', 'word-roots'],
    activeActivityId: 'copy-phrase',
  }));
  await page.getByRole('button', { name: 'العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText('23.5', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'الدراسة', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'الدراسة والعمل' })).toBeVisible();
  await expect(page.getByText('أعد بناء عبارة مكسورة', { exact: true }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'playtest-artifacts/v03-study-arabic-tablet.png', fullPage: true });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v03') ?? '{}'));
  expect(saved.language).toBe('ar');
  expect(saved.knowledge).toBeGreaterThanOrEqual(23.5);
  expect(errors).toEqual([]);
});

test('earlier saves migrate into the rewritten prologue without carrying incompatible economy data', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('house-of-wisdom-v02', JSON.stringify({ version: 2, language: 'en', knowledge: 999 }));
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'The opening has been rewritten' })).toBeVisible();
  await page.getByRole('button', { name: 'Begin the chapter' }).click();
  await expect(page.getByRole('heading', { name: 'The House of Wisdom is silent.' })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v03') ?? '{}'));
  expect(saved.version).toBe(3);
  expect(saved.language).toBe('en');
  expect(saved.knowledge).toBe(0);
});
