import { mkdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

type FixtureOptions = {
  language?: 'en' | 'ar';
  knowledge?: number;
  materials?: { timber: number; stone: number };
  activeActivityId?: string | null;
  skills?: string[];
  inventory?: string[];
  itemCounts?: Record<string, number>;
  deskRepaired?: boolean;
  scriptoriumRepaired?: boolean;
  schoolRelit?: boolean;
  dailyNeedId?: 'eastern-school' | null;
  dailyNeedStep?: number;
  civicProgress?: { easternSchoolDeciphered: boolean; primersCopied: number; primersDelivered: number };
  dailyNeedGeneratedOn?: string | null;
  dailyDutyProgress?: { learn: number; make: number; serve: number };
  dailyEncroachment?: number;
};

function fixture(options: FixtureOptions = {}) {
  const deskRepaired = options.deskRepaired ?? true;
  const scriptoriumRepaired = options.scriptoriumRepaired ?? false;
  const schoolRelit = options.schoolRelit ?? false;
  const active = options.activeActivityId ?? null;
  return {
    version: 6,
    knowledge: options.knowledge ?? 100,
    materials: options.materials ?? { timber: 10, stone: 10 },
    xp: { language: 250, scribing: 0, gathering: 20, translation: 0, mathematics: 0, architecture: 0 },
    activeActivityId: active,
    workQueue: active ? [{ activityId: active }] : [],
    workTargetRemaining: null,
    activityProgressMs: 0,
    lastUpdatedAt: Date.now(),
    skills: options.skills ?? ['first-letter', 'word-roots', 'grammar', 'eloquence'],
    inventory: options.inventory ?? ['torn-manuscript', 'worn-hammer', 'first-word', 'restored-sentence', 'al-jahiz-signature', 'keeper-desk'],
    itemCounts: options.itemCounts ?? {},
    activityMasteryXp: {},
    pinnedTaskIds: ['restore-scriptorium'],
    lightMilestones: schoolRelit ? ['keeper-desk', 'scriptorium', 'eastern-school'] : scriptoriumRepaired ? ['keeper-desk', 'scriptorium'] : deskRepaired ? ['keeper-desk'] : [],
    language: options.language ?? 'en',
    started: true,
    comicSeen: true,
    ghostEncountered: true,
    ghostIdentityRevealed: true,
    deskRepaired,
    scriptoriumRepaired,
    ignoranceRevealed: deskRepaired,
    prologueComplete: deskRepaired,
    offlineExplained: true,
    tutorialStep: 'complete',
    tutorialSkipped: true,
    lastReward: null,
    dailyNeedId: options.dailyNeedId ?? (scriptoriumRepaired && !schoolRelit ? 'eastern-school' : null),
    dailyNeedStep: options.dailyNeedStep ?? (schoolRelit ? 3 : 0),
    dailyEncroachment: options.dailyEncroachment ?? 0,
    dailyNeedGeneratedOn: options.dailyNeedGeneratedOn ?? null,
    lastDailyResolvedOn: schoolRelit ? new Date().toISOString().slice(0, 10) : null,
    schoolRelit,
    civicProgress: options.civicProgress ?? { easternSchoolDeciphered: schoolRelit, primersCopied: schoolRelit ? 20 : 0, primersDelivered: schoolRelit ? 20 : 0 },
    dailyDutyProgress: options.dailyDutyProgress ?? { learn: 0, make: 0, serve: 0 },
  };
}

async function setFixture(page: Page, state: ReturnType<typeof fixture>) {
  await page.goto('/');
  await page.evaluate((value) => {
    localStorage.clear();
    localStorage.setItem('house-of-wisdom-v05', JSON.stringify(value));
  }, state);
  await page.reload();
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function dismissReturnReport(page: Page) {
  const button = page.getByRole('button', { name: 'Return to the House' });
  if (await button.isVisible()) await button.click();
}

function captureRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  return errors;
}

test.beforeAll(() => mkdirSync('playtest-artifacts', { recursive: true }));

test('the fast comic and speech tutorial still lead to the first Arabic insight', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Darkness covers Baghdad.' })).toBeVisible();
  await expect(page.locator('.comic-panel')).toHaveCount(4);
  await page.getByRole('button', { name: 'Enter the House' }).click();
  await page.locator('.speech-bubble').getByRole('button', { name: 'Inspect the manuscript' }).click();
  await expect(page.getByRole('heading', { name: 'Current Work' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Arabic Language' })).toBeVisible();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('house-of-wisdom-v05') ?? '{}').knowledge >= 8, null, { timeout: 8_000 });
  await page.locator('.navigation').getByRole('button', { name: 'House', exact: true }).click();
  await page.locator('.speech-bubble').getByRole('button', { name: 'Open Knowledge' }).click();
  await expect(page.locator('.discipline-card')).toHaveCount(6);
  await page.getByRole('button', { name: /Understand.*8/ }).click();
  await expect(page.getByText('Read.', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('the Scholar Ledger is persistent while Work runs one targetable activity', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await setFixture(page, fixture({ knowledge: 1_200, materials: { timber: 230, stone: 140 } }));
  await expect(page.getByRole('heading', { name: 'Scholar’s Ledger' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Restore the Scriptorium' })).toBeVisible();
  await expect(page.getByText('1200 / 6000')).toBeVisible();
  await page.getByRole('button', { name: 'Work', exact: true }).click();
  await expect(page.getByText('Up to 24 hours offline')).toBeVisible();
  await page.getByRole('button', { name: /Recover Fallen Timber/ }).click();
  await expect(page.getByRole('heading', { name: 'Recover Fallen Timber' })).toBeVisible();
  await page.locator('.work-targets').getByRole('button', { name: '10', exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v05') ?? '{}'));
  expect(saved.workQueue).toEqual([{ activityId: 'salvage-timber' }]);
  expect(saved.workTargetRemaining).toBe(10);
  await page.screenshot({ path: 'playtest-artifacts/v05-ledger-current-work.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('twenty copied primers relight the school and unlock Translation', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await setFixture(page, fixture({
    knowledge: 10_000, scriptoriumRepaired: true, dailyNeedStep: 1,
    inventory: ['torn-manuscript', 'worn-hammer', 'keeper-desk', 'scriptorium', 'ink'], itemCounts: { ink: 20 },
    civicProgress: { easternSchoolDeciphered: true, primersCopied: 0, primersDelivered: 0 },
  }));
  await page.getByRole('button', { name: 'Work', exact: true }).click();
  await page.getByRole('button', { name: /Copy a Working Primer/ }).click();
  await page.evaluate(() => {
    const key = 'house-of-wisdom-v05'; const saved = JSON.parse(localStorage.getItem(key)!); saved.lastUpdatedAt = Date.now() - 20 * 45_000 - 5_000; localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await dismissReturnReport(page);
  await expect(page.getByText('20 / 20').first()).toBeVisible();
  await page.getByRole('button', { name: 'Work', exact: true }).click();
  await page.getByRole('button', { name: /Deliver the Primer/ }).click();
  await page.evaluate(() => {
    const key = 'house-of-wisdom-v05'; const saved = JSON.parse(localStorage.getItem(key)!); saved.lastUpdatedAt = Date.now() - 20 * 30_000 - 5_000; localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await dismissReturnReport(page);
  await expect(page.locator('.chapter-strip .darkness-meter[aria-label="95% Darkness"]')).toBeVisible();
  await expect(page.getByText('The school is lit')).toBeVisible();
  await page.getByRole('button', { name: 'Knowledge', exact: true }).click();
  const translation = page.locator('.discipline-card').filter({ hasText: 'Translation' });
  await expect(translation).toContainText('Skill unlocked');
  await page.screenshot({ path: 'playtest-artifacts/v05-school-relit.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('a later day shows three non-stacking Daily Duties at 98% Darkness', async ({ page }) => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1_000).toISOString().slice(0, 10);
  await setFixture(page, fixture({ schoolRelit: true, scriptoriumRepaired: true, dailyNeedGeneratedOn: yesterday, dailyEncroachment: 0 }));
  await expect(page.locator('.chapter-strip .darkness-meter[aria-label="98% Darkness"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Daily Study' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Daily Craft' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Daily Service' })).toBeVisible();
  await expect(page.getByText('0 / 5000')).toBeVisible();
});

test('v0.4 saves migrate to v0.5 and mobile Arabic remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate((value) => {
    localStorage.clear();
    const old = { ...value, version: 5, xp: { language: 250, translation: 0, mathematics: 0, architecture: 20 }, workQueue: [{ activityId: 'trace-letters' }, { activityId: 'salvage-timber' }], activeActivityId: 'trace-letters' };
    delete old.itemCounts; delete old.activityMasteryXp; delete old.pinnedTaskIds; delete old.workTargetRemaining; delete old.civicProgress; delete old.dailyDutyProgress;
    localStorage.setItem('house-of-wisdom-v04', JSON.stringify(old));
  }, fixture({ language: 'ar' }));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { name: 'العتمة صارت لها غاية' })).toBeVisible();
  await page.getByRole('button', { name: 'واصل الرحلة' }).click();
  await expect(page.getByRole('heading', { name: 'سجل الباحث' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v05') ?? '{}'));
  expect(saved.version).toBe(6);
  expect(saved.workQueue).toHaveLength(1);
});
