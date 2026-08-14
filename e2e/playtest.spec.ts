import { expect, test, type Page } from '@playwright/test';

type FixtureOptions = {
  language?: 'en' | 'ar';
  knowledge?: number;
  xp?: { translation: number; mathematics: number; astronomy: number };
  research?: string[];
  manuscripts?: string[];
  kindi?: {
    unlocked: boolean;
    phase: 'locked' | 'intro' | 'frequency' | 'comparison' | 'substitution' | 'pattern' | 'complete';
    complete: boolean;
    selectedSymbol: string | null;
    substitution: string | null;
    attempts: number;
  };
  activeActivityId?: string | null;
  started?: boolean;
};

function fixture(options: FixtureOptions = {}) {
  return {
    version: 2,
    knowledge: options.knowledge ?? 0,
    xp: options.xp ?? { translation: 0, mathematics: 0, astronomy: 0 },
    activeActivityId: options.activeActivityId ?? null,
    activityProgressMs: 0,
    lastUpdatedAt: Date.now(),
    research: options.research ?? [],
    manuscripts: options.manuscripts ?? ['damaged-folio'],
    kindi: options.kindi ?? { unlocked: false, phase: 'locked', complete: false, selectedSymbol: null, substitution: null, attempts: 0 },
    language: options.language ?? 'en',
    started: options.started ?? false,
    offlineExplained: false,
    lastReward: null,
  };
}

async function setFixture(page: Page, state: ReturnType<typeof fixture>) {
  await page.goto('/');
  await page.evaluate((value) => localStorage.setItem('house-of-wisdom-v02', JSON.stringify(value)), state);
  await page.reload();
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

function captureRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  return errors;
}

test('fresh opening is clear and the six-second clock survives rerenders and browser switching', async ({ page, context }) => {
  const errors = captureRuntimeErrors(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'You are the new Keeper of the House of Wisdom.' })).toBeVisible();
  await expect(page.getByText('Damaged Mathematical Folio')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Begin again' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.waitForTimeout(650);
  await page.screenshot({ path: 'playtest-artifacts/opening-desktop.png', fullPage: true });

  const beganAt = Date.now();
  await page.getByRole('button', { name: 'Begin again' }).click();
  await expect(page.getByText('Decipher a Faded Line', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.activity-timer').getByText('6s', { exact: true })).toBeVisible();
  const initialTransform = await page.locator('.timer-track > i').evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(1_000);
  const laterTransform = await page.locator('.timer-track > i').evaluate((element) => getComputedStyle(element).transform);
  expect(laterTransform).not.toBe(initialTransform);

  await page.getByRole('button', { name: 'House', exact: true }).last().click();
  await page.getByRole('button', { name: 'Study', exact: true }).last().click();
  const other = await context.newPage();
  await other.goto('about:blank');
  await other.bringToFront();
  await other.waitForTimeout(2_000);
  await page.bringToFront();
  await page.waitForFunction(() => {
    const value = JSON.parse(localStorage.getItem('house-of-wisdom-v02') ?? '{}');
    return value.knowledge >= 1;
  });
  const actualDuration = Date.now() - beganAt;
  console.log(`Measured initial activity completion: ${actualDuration}ms`);
  expect(actualDuration).toBeGreaterThanOrEqual(5_700);
  expect(actualDuration).toBeLessThan(7_400);
  await expect(page.getByText('+1 ✦', { exact: true })).toBeVisible();
  await other.close();
  expect(errors).toEqual([]);
});

test('research path, visual House stages, and mobile layout are usable', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await setFixture(page, fixture({
    started: true,
    knowledge: 500,
    activeActivityId: 'numerals',
    xp: { translation: 175, mathematics: 175, astronomy: 0 },
    research: ['desk', 'mathematics'],
    manuscripts: ['damaged-folio', 'mathematical-folio'],
  }));
  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Research', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Research path' })).toBeVisible();
  await expect(page.getByText('Your first priority')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Preserve the Folio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Follow the Pattern' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.waitForTimeout(650);
  await page.screenshot({ path: 'playtest-artifacts/research-mobile.png', fullPage: true });

  await page.getByRole('button', { name: /Discover.*55/ }).first().click();
  const chosen = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v02') ?? '{}').research);
  expect(chosen.some((id: string) => id === 'preserve' || id === 'follow')).toBe(true);
  await page.getByRole('button', { name: 'House', exact: true }).last().click();
  await expect(page.locator('.house-stage-2')).toBeVisible();
  await page.waitForTimeout(650);
  await page.screenshot({ path: 'playtest-artifacts/house-stage-2-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('Al-Kindi is a guided interaction and grants the permanent manuscript', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await setFixture(page, fixture({
    started: true,
    knowledge: 50,
    activeActivityId: 'patterns',
    xp: { translation: 265, mathematics: 380, astronomy: 0 },
    research: ['desk', 'mathematics', 'follow', 'language'],
    manuscripts: ['damaged-folio', 'mathematical-folio', 'pattern-notes'],
    kindi: { unlocked: true, phase: 'intro', complete: false, selectedSymbol: null, substitution: null, attempts: 0 },
  }));
  await page.getByRole('button', { name: 'Library', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Al-Kindi — The Cipher' })).toBeVisible();
  await page.getByRole('button', { name: 'Examine the message' }).click();
  await expect(page.getByRole('heading', { name: 'Find the most repeated symbol' })).toBeVisible();
  await page.getByRole('button', { name: '○' }).first().click();
  await expect(page.getByText('Another mark appears more often.')).toBeVisible();
  await page.getByRole('button', { name: '◆' }).first().click();
  await expect(page.getByRole('heading', { name: 'Compare frequency with language' })).toBeVisible();
  await page.getByRole('button', { name: 'Form a hypothesis' }).click();
  await page.getByRole('button', { name: 'Q' }).click();
  await expect(page.getByText('Try a letter that appears very often')).toBeVisible();
  await page.getByRole('button', { name: 'E', exact: true }).click();
  await page.getByRole('button', { name: 'THE KEEPER SEES THE PATTERN' }).click();
  await expect(page.getByRole('heading', { name: 'Method of Analysis', exact: true })).toBeVisible();
  await expect(page.getByText('+10%', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Al-Kindi: Method of Analysis' })).toBeVisible();
  await page.waitForTimeout(650);
  await page.screenshot({ path: 'playtest-artifacts/kindi-complete-desktop.png', fullPage: true });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v02') ?? '{}'));
  expect(saved.kindi.complete).toBe(true);
  expect(saved.manuscripts).toContain('method-of-analysis');
  expect(errors).toEqual([]);
});

test('Arabic RTL and tablet layouts preserve progress and readable controls', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  await setFixture(page, fixture({
    started: true,
    knowledge: 123.5,
    activeActivityId: 'faded',
    xp: { translation: 100, mathematics: 0, astronomy: 0 },
    research: ['desk'],
  }));
  await page.getByRole('button', { name: 'العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText('123.5', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'English' })).toBeVisible();
  await page.getByRole('button', { name: 'الدراسة', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'الدراسة' })).toBeVisible();
  await expect(page.getByText('فكّ سطر باهت', { exact: true }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v02') ?? '{}'));
  expect(persisted.knowledge).toBeGreaterThanOrEqual(123.5);
  await page.waitForTimeout(650);
  await page.screenshot({ path: 'playtest-artifacts/study-arabic-tablet.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('restored Scriptorium communicates offline continuation', async ({ page }) => {
  await setFixture(page, fixture({
    started: true,
    knowledge: 12,
    activeActivityId: 'compile',
    xp: { translation: 380, mathematics: 525, astronomy: 0 },
    research: ['desk', 'mathematics', 'follow', 'language', 'scriptorium'],
    manuscripts: ['damaged-folio', 'mathematical-folio', 'pattern-notes', 'method-of-analysis'],
    kindi: { unlocked: true, phase: 'complete', complete: true, selectedSymbol: '◆', substitution: 'common', attempts: 3 },
  }));
  await expect(page.locator('.house-stage-3')).toBeVisible();
  await expect(page.getByText('The work continues when the book closes')).toBeVisible();
  await expect(page.getByText('up to 8 hours')).toBeVisible();
  await page.waitForTimeout(650);
  await page.screenshot({ path: 'playtest-artifacts/house-scriptorium-desktop.png', fullPage: true });
});
