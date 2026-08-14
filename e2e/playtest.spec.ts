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
  const started = options.started ?? true;
  const deskRepaired = options.deskRepaired ?? false;
  return {
    version: 4,
    knowledge: options.knowledge ?? 0,
    materials: options.materials ?? { timber: 0, stone: 0 },
    xp: options.xp ?? { language: 0, translation: 0, mathematics: 0, architecture: 0 },
    activeActivityId: options.activeActivityId ?? null,
    activityProgressMs: 0,
    lastUpdatedAt: Date.now(),
    skills: options.skills ?? [],
    inventory: options.inventory ?? ['torn-manuscript', 'worn-hammer'],
    lightMilestones: deskRepaired ? ['keeper-desk'] : [],
    language: options.language ?? 'en',
    started,
    comicSeen: started,
    ghostEncountered: started,
    ghostIdentityRevealed: options.ghostIdentityRevealed ?? false,
    deskRepaired,
    ignoranceRevealed: options.ignoranceRevealed ?? deskRepaired,
    prologueComplete: options.prologueComplete ?? deskRepaired,
    offlineExplained: false,
    tutorialStep: deskRepaired ? 'complete' : started ? 'guided' : 'comic',
    tutorialSkipped: started,
    lastReward: null,
  };
}

async function setFixture(page: Page, state: ReturnType<typeof fixture>) {
  await page.goto('/');
  await page.evaluate((value) => {
    localStorage.clear();
    localStorage.setItem('house-of-wisdom-v031', JSON.stringify(value));
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

test('the comic and speech bubble guide a fresh player to the first insight', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Darkness covers Baghdad.' })).toBeVisible();
  await expect(page.getByLabel('Four panels telling the beginning of the quest')).toBeVisible();
  await expect(page.locator('.comic-panel')).toHaveCount(4);
  await expect(page.getByText('No dawn has come to Baghdad for longer than its people can remember.')).toBeVisible();
  await expect(page.getByText('Bring light back to Baghdad')).toBeVisible();
  await page.screenshot({ path: 'playtest-artifacts/v031-opening-desktop.png', fullPage: true });

  await page.getByRole('button', { name: 'Enter the House' }).click();
  await expect(page.getByLabel('100% Darkness')).toBeVisible();
  await expect(page.getByText('I cannot understand his words, but he is pointing toward the torn manuscript.')).toBeVisible();
  await page.locator('.speech-bubble').getByRole('button', { name: 'Inspect the manuscript' }).click();
  await expect(page.getByRole('heading', { name: 'Work' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Manuscript Desk' })).toBeVisible();
  await expect(page.getByText('First discovery bonus')).toBeVisible();

  await page.waitForFunction(() => JSON.parse(localStorage.getItem('house-of-wisdom-v031') ?? '{}').knowledge >= 8, null, { timeout: 8_000 });
  await page.locator('.navigation').getByRole('button', { name: 'House', exact: true }).click();
  await expect(page.getByText('The work produced Knowledge. The first insight may restore one word of his voice.')).toBeVisible();
  await page.locator('.speech-bubble').getByRole('button', { name: 'Open Knowledge' }).click();
  await expect(page.getByRole('heading', { name: 'Knowledge' })).toBeVisible();
  await page.getByRole('button', { name: /Understand.*8/ }).click();
  await expect(page.getByText('Read.', { exact: true })).toBeVisible();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v031') ?? '{}'));
  expect(saved.version).toBe(4);
  expect(saved.skills).toContain('first-letter');
  expect(saved.inventory).toContain('first-word');
  expect(saved.tutorialStep).toBe('guided');
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('the three-section mobile interface reveals Al-Jahiz and keeps inventory in the Satchel', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await setFixture(page, fixture({
    knowledge: 70,
    xp: { language: 170, translation: 0, mathematics: 0, architecture: 0 },
    skills: ['first-letter', 'word-roots', 'grammar'],
    inventory: ['torn-manuscript', 'worn-hammer', 'first-word', 'restored-sentence'],
    activeActivityId: 'study-eloquence',
  }));
  await expect(page.locator('.navigation button')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Inventory', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Knowledge', exact: true }).last().click();
  await page.getByRole('button', { name: /Understand.*55/ }).click();
  await expect(page.getByAltText('Al-Jahiz')).toBeVisible();
  await expect(page.getByText(/before the dust claims ownership/)).toBeVisible();
  await page.getByRole('button', { name: 'Satchel', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Satchel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Al-Jahiz’s Signature' })).toBeVisible();
  await page.screenshot({ path: 'playtest-artifacts/v031-al-jahiz-satchel-mobile.png', fullPage: true });
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('restoring the Keeper’s Desk names Ignorance, records the memory, and lowers Darkness to 99%', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await setFixture(page, fixture({
    knowledge: 30,
    materials: { timber: 5, stone: 4 },
    xp: { language: 180, translation: 0, mathematics: 0, architecture: 20 },
    skills: ['first-letter', 'word-roots', 'grammar', 'eloquence'],
    inventory: ['torn-manuscript', 'worn-hammer', 'first-word', 'restored-sentence', 'al-jahiz-signature'],
    activeActivityId: 'sort-stone',
    ghostIdentityRevealed: true,
  }));
  await page.getByRole('button', { name: 'Repair the desk' }).click();
  await expect(page.getByRole('heading', { name: 'Baghdad’s Darkness falls to 99%' })).toBeVisible();
  await expect(page.getByText(/Darkness is not night: it is Ignorance/)).toBeVisible();
  await page.locator('.modal-card').getByRole('button', { name: 'See what the House remembers', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ignorance Given Weight' })).toBeVisible();
  await expect(page.getByText('The House was not abandoned. It was silenced.')).toBeVisible();
  await expect(page.getByLabel('99% Darkness').first()).toBeVisible();
  await page.screenshot({ path: 'playtest-artifacts/v031-prologue-complete-desktop.png', fullPage: true });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v031') ?? '{}'));
  expect(saved.lightMilestones).toEqual(['keeper-desk']);
  expect(saved.tutorialStep).toBe('complete');
  expect(errors).toEqual([]);
});

test('Arabic RTL preserves progress and Work controls at tablet width', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  await setFixture(page, fixture({
    knowledge: 23.5,
    xp: { language: 72, translation: 0, mathematics: 0, architecture: 0 },
    skills: ['first-letter', 'word-roots'],
    activeActivityId: 'copy-phrase',
  }));
  await page.getByRole('button', { name: 'العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText('23.5', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'العمل', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'العمل' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'مكتب المخطوطات' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'playtest-artifacts/v031-work-arabic-tablet.png', fullPage: true });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v031') ?? '{}'));
  expect(saved.language).toBe('ar');
  expect(saved.knowledge).toBeGreaterThanOrEqual(23.5);
  expect(errors).toEqual([]);
});

test('v0.3 saves preserve progress and skip the forced tutorial', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('house-of-wisdom-v03', JSON.stringify({
      version: 3,
      knowledge: 23.5,
      materials: { timber: 2, stone: 1 },
      xp: { language: 72, translation: 0, mathematics: 0, architecture: 6 },
      activeActivityId: 'copy-phrase', activityProgressMs: 0, lastUpdatedAt: Date.now(),
      skills: ['first-letter', 'word-roots'], inventory: ['torn-manuscript', 'worn-hammer', 'first-word'],
      language: 'en', started: true, comicSeen: true, ghostEncountered: true,
      ghostIdentityRevealed: false, deskRepaired: false, ignoranceRevealed: false,
      prologueComplete: false, offlineExplained: false, lastReward: null,
    }));
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'The Darkness now has a purpose' })).toBeVisible();
  await expect(page.getByText(/previous progress is preserved/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue the journey' }).click();
  await expect(page.getByText('23.5', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The First Word' })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('house-of-wisdom-v031') ?? '{}'));
  expect(saved.version).toBe(4);
  expect(saved.skills).toEqual(['first-letter', 'word-roots']);
  expect(saved.tutorialSkipped).toBe(true);
  expect(saved.tutorialStep).toBe('guided');
});
