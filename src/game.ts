export type Discipline = 'translation' | 'mathematics' | 'astronomy';
export type Language = 'en' | 'ar';
export type LocalizedText = Record<Language, string>;

export const GAME_VERSION = 2 as const;
export const SAVE_KEY = 'house-of-wisdom-v02';
export const LEGACY_SAVE_KEY = 'house-of-wisdom-v01';
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;

export type RewardEvent = {
  activityId: string;
  knowledge: number;
  xp: number;
  repetitions: number;
  at: number;
};

export type KindiPhase =
  | 'locked'
  | 'intro'
  | 'frequency'
  | 'comparison'
  | 'substitution'
  | 'pattern'
  | 'complete';

export type KindiState = {
  unlocked: boolean;
  phase: KindiPhase;
  complete: boolean;
  selectedSymbol: string | null;
  substitution: string | null;
  attempts: number;
};

export type GameState = {
  version: typeof GAME_VERSION;
  knowledge: number;
  xp: Record<Discipline, number>;
  activeActivityId: string | null;
  activityProgressMs: number;
  lastUpdatedAt: number;
  research: string[];
  manuscripts: string[];
  kindi: KindiState;
  language: Language;
  started: boolean;
  offlineExplained: boolean;
  lastReward: RewardEvent | null;
};

export type Activity = {
  id: string;
  discipline: Discipline;
  name: LocalizedText;
  description: LocalizedText;
  durationMs: number;
  knowledge: number;
  xp: number;
  minLevel: number;
  requiresResearch?: string;
};

export const activities: Activity[] = [
  {
    id: 'faded',
    discipline: 'translation',
    name: { en: 'Decipher a Faded Line', ar: 'فكّ سطر باهت' },
    description: { en: 'Recover a single line from the damaged folio.', ar: 'استعد سطراً واحداً من الصحيفة التالفة.' },
    durationMs: 6_000,
    knowledge: 1,
    xp: 4,
    minLevel: 1,
  },
  {
    id: 'passage',
    discipline: 'translation',
    name: { en: 'Copy a Clear Passage', ar: 'انسخ مقطعاً واضحاً' },
    description: { en: 'Preserve a readable passage in a fresh hand.', ar: 'احفظ مقطعاً مقروءاً بخط جديد.' },
    durationMs: 9_000,
    knowledge: 2,
    xp: 6,
    minLevel: 2,
  },
  {
    id: 'folio',
    discipline: 'translation',
    name: { en: 'Translate the Mathematical Folio', ar: 'ترجم الصحيفة الرياضية' },
    description: { en: 'Follow the numerals hidden in the margins.', ar: 'تتبّع الأرقام المدوّنة في الهوامش.' },
    durationMs: 14_000,
    knowledge: 4,
    xp: 9,
    minLevel: 4,
  },
  {
    id: 'compile',
    discipline: 'translation',
    name: { en: 'Compile a Manuscript', ar: 'اجمع مخطوطة' },
    description: { en: 'Use the restored Scriptorium to bind a complete work.', ar: 'استخدم دار النسخ بعد ترميمها لجمع مؤلَّف كامل.' },
    durationMs: 30_000,
    knowledge: 12,
    xp: 18,
    minLevel: 1,
    requiresResearch: 'scriptorium',
  },
  {
    id: 'numerals',
    discipline: 'mathematics',
    name: { en: 'Practice the Numerals', ar: 'تدرّب على الأرقام' },
    description: { en: 'Learn the notation that opened the second discipline.', ar: 'تعلّم الرموز التي فتحت باب العلم الثاني.' },
    durationMs: 7_000,
    knowledge: 1.5,
    xp: 4,
    minLevel: 1,
    requiresResearch: 'mathematics',
  },
  {
    id: 'proof',
    discipline: 'mathematics',
    name: { en: 'Work a Geometric Proof', ar: 'حلّ برهاناً هندسياً' },
    description: { en: 'Move from calculation to a reasoned demonstration.', ar: 'انتقل من الحساب إلى البرهان المنطقي.' },
    durationMs: 11_000,
    knowledge: 3,
    xp: 7,
    minLevel: 3,
    requiresResearch: 'mathematics',
  },
  {
    id: 'patterns',
    discipline: 'mathematics',
    name: { en: 'Study Patterns in Letters', ar: 'ادرس الأنماط في الحروف' },
    description: { en: 'Count repetition where language and number meet.', ar: 'احسب التكرار عند التقاء اللغة بالعدد.' },
    durationMs: 16_000,
    knowledge: 5,
    xp: 10,
    minLevel: 5,
    requiresResearch: 'mathematics',
  },
];

export type ResearchNode = {
  id: string;
  cost: number | null;
  kind: 'restoration' | 'unlock' | 'choice' | 'chronicle' | 'teaser';
  name: LocalizedText;
  eyebrow: LocalizedText;
  description: LocalizedText;
  requiresResearch?: string[];
  requiresAnyResearch?: string[];
  requiresLevels?: Partial<Record<Discipline, number>>;
  requiresKindiComplete?: boolean;
  choiceGroup?: string;
};

export const researchNodes: ResearchNode[] = [
  {
    id: 'desk',
    cost: 40,
    kind: 'restoration',
    eyebrow: { en: 'Restore', ar: 'ترميم' },
    name: { en: 'The Keeper’s Desk', ar: 'مكتب القيّم' },
    description: { en: 'Restore the first place of study. Translation produces +5% Knowledge.', ar: 'رمّم أول موضع للدراسة. تنتج الترجمة معرفة إضافية بنسبة ٥٪.' },
  },
  {
    id: 'mathematics',
    cost: 95,
    kind: 'unlock',
    eyebrow: { en: 'Discover', ar: 'اكتشاف' },
    name: { en: 'Numerals in the Margins', ar: 'أرقام في الهوامش' },
    description: { en: 'The damaged folio reveals a second discipline: Mathematics.', ar: 'تكشف الصحيفة التالفة علماً ثانياً: الرياضيات.' },
    requiresResearch: ['desk'],
  },
  {
    id: 'preserve',
    cost: 55,
    kind: 'choice',
    eyebrow: { en: 'First priority', ar: 'الأولوية الأولى' },
    name: { en: 'Preserve the Folio', ar: 'احفظ الصحيفة' },
    description: { en: 'Prioritize the translators. Translation produces +15% Knowledge.', ar: 'امنح المترجمين الأولوية. تنتج الترجمة معرفة إضافية بنسبة ١٥٪.' },
    requiresResearch: ['mathematics'],
    choiceGroup: 'first-focus',
  },
  {
    id: 'follow',
    cost: 55,
    kind: 'choice',
    eyebrow: { en: 'First priority', ar: 'الأولوية الأولى' },
    name: { en: 'Follow the Pattern', ar: 'تتبّع النمط' },
    description: { en: 'Prioritize the mathematicians. Mathematics produces +15% Knowledge.', ar: 'امنح الرياضيين الأولوية. تنتج الرياضيات معرفة إضافية بنسبة ١٥٪.' },
    requiresResearch: ['mathematics'],
    choiceGroup: 'first-focus',
  },
  {
    id: 'language',
    cost: 330,
    kind: 'chronicle',
    eyebrow: { en: 'Chronicle', ar: 'سجلّ' },
    name: { en: 'Patterns in Language', ar: 'أنماط في اللغة' },
    description: { en: 'Connect Translation and Mathematics to discover Al-Kindi’s method.', ar: 'صِل بين الترجمة والرياضيات لاكتشاف منهج الكندي.' },
    requiresResearch: ['mathematics'],
    requiresAnyResearch: ['preserve', 'follow'],
    requiresLevels: { translation: 4, mathematics: 5 },
  },
  {
    id: 'scriptorium',
    cost: 240,
    kind: 'restoration',
    eyebrow: { en: 'Restore', ar: 'ترميم' },
    name: { en: 'The Scriptorium', ar: 'دار النسخ' },
    description: { en: 'Put Al-Kindi’s method to work and reopen manuscript production.', ar: 'طبّق منهج الكندي وأعد فتح دار إنتاج المخطوطات.' },
    requiresResearch: ['language'],
    requiresKindiComplete: true,
  },
  {
    id: 'heavens',
    cost: null,
    kind: 'teaser',
    eyebrow: { en: 'Beyond this session', ar: 'ما بعد هذه الجلسة' },
    name: { en: 'Measured Heavens', ar: 'السماء المقاسة' },
    description: { en: 'The restored House points toward a future Observatory.', ar: 'تقود الدار بعد ترميمها إلى مرصد سيُفتح لاحقاً.' },
    requiresResearch: ['scriptorium'],
  },
];

const levelThresholds = [0, 20, 55, 105, 175, 265, 380, 525, 700, 910, 1_160];

export function levelForXp(xp: number) {
  let result = 1;
  for (let index = 1; index < levelThresholds.length; index += 1) {
    if (xp >= levelThresholds[index]) result = index + 1;
    else break;
  }
  return result;
}

export function levelProgress(xp: number) {
  const currentLevel = levelForXp(xp);
  const currentFloor = levelThresholds[currentLevel - 1] ?? levelThresholds.at(-1)!;
  const next = levelThresholds[currentLevel] ?? null;
  if (next === null) return { currentLevel, currentXp: xp - currentFloor, requiredXp: null, percent: 100 };
  const currentXp = xp - currentFloor;
  const requiredXp = next - currentFloor;
  return { currentLevel, currentXp, requiredXp, percent: Math.min(100, (currentXp / requiredXp) * 100) };
}

export function hasResearch(state: GameState, id: string) {
  return state.research.includes(id);
}

export function hasManuscript(state: GameState, id: string) {
  return state.manuscripts.includes(id);
}

export function createInitialState(now = Date.now(), language: Language = 'en'): GameState {
  return {
    version: GAME_VERSION,
    knowledge: 0,
    xp: { translation: 0, mathematics: 0, astronomy: 0 },
    activeActivityId: null,
    activityProgressMs: 0,
    lastUpdatedAt: now,
    research: [],
    manuscripts: ['damaged-folio'],
    kindi: {
      unlocked: false,
      phase: 'locked',
      complete: false,
      selectedSymbol: null,
      substitution: null,
      attempts: 0,
    },
    language,
    started: false,
    offlineExplained: false,
    lastReward: null,
  };
}

export function getActivity(id: string | null) {
  return activities.find((activity) => activity.id === id) ?? null;
}

export function activityAvailable(state: GameState, activity: Activity) {
  return levelForXp(state.xp[activity.discipline]) >= activity.minLevel
    && (!activity.requiresResearch || hasResearch(state, activity.requiresResearch));
}

function roundResource(value: number) {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

export function knowledgeMultiplier(state: GameState, discipline: Discipline) {
  let multiplier = 1;
  if (discipline === 'translation' && hasResearch(state, 'desk')) multiplier += 0.05;
  if (discipline === 'translation' && hasResearch(state, 'preserve')) multiplier += 0.15;
  if (discipline === 'mathematics' && hasResearch(state, 'follow')) multiplier += 0.15;
  if (state.kindi.complete) multiplier += 0.1;
  return multiplier;
}

export type AdvanceSummary = {
  elapsedMs: number;
  appliedElapsedMs: number;
  cappedMs: number;
  knowledge: number;
  xp: number;
  completions: number;
  activityId: string | null;
};

export function advanceGame(input: GameState, now = Date.now(), capMs = OFFLINE_CAP_MS) {
  const state = structuredClone(input);
  const elapsedMs = Math.max(0, now - state.lastUpdatedAt);
  const appliedElapsedMs = Math.min(elapsedMs, Math.max(0, capMs));
  const activity = getActivity(state.activeActivityId);
  const summary: AdvanceSummary = {
    elapsedMs,
    appliedElapsedMs,
    cappedMs: elapsedMs - appliedElapsedMs,
    knowledge: 0,
    xp: 0,
    completions: 0,
    activityId: activity?.id ?? null,
  };

  if (activity && activityAvailable(state, activity)) {
    const totalProgress = state.activityProgressMs + appliedElapsedMs;
    const repetitions = Math.floor(totalProgress / activity.durationMs);
    state.activityProgressMs = totalProgress % activity.durationMs;

    if (repetitions > 0) {
      const knowledge = roundResource(repetitions * activity.knowledge * knowledgeMultiplier(state, activity.discipline));
      const xp = repetitions * activity.xp;
      state.knowledge = roundResource(state.knowledge + knowledge);
      state.xp[activity.discipline] += xp;
      state.lastReward = { activityId: activity.id, knowledge, xp, repetitions, at: now };
      summary.knowledge = knowledge;
      summary.xp = xp;
      summary.completions = repetitions;
    }
  }

  state.lastUpdatedAt = now;
  return { state, summary };
}

export function activityTiming(state: GameState, now = Date.now()) {
  const activity = getActivity(state.activeActivityId);
  if (!activity) return null;
  const elapsed = Math.min(Math.max(0, now - state.lastUpdatedAt), OFFLINE_CAP_MS);
  const total = state.activityProgressMs + elapsed;
  if (total >= activity.durationMs) {
    return { durationMs: activity.durationMs, elapsedMs: activity.durationMs, remainingMs: 0, percent: 100 };
  }
  return {
    durationMs: activity.durationMs,
    elapsedMs: total,
    remainingMs: activity.durationMs - total,
    percent: (total / activity.durationMs) * 100,
  };
}

export function startGame(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (state.started) return state;
  state.started = true;
  state.activeActivityId = 'faded';
  state.activityProgressMs = 0;
  state.lastUpdatedAt = now;
  return state;
}

export function selectActivity(input: GameState, id: string, now = Date.now()) {
  const { state } = advanceGame(input, now);
  const activity = getActivity(id);
  if (!activity || !activityAvailable(state, activity)) return state;
  if (state.activeActivityId === id) return state;
  state.activeActivityId = id;
  state.activityProgressMs = 0;
  state.lastUpdatedAt = now;
  return state;
}

function otherChoicePurchased(state: GameState, node: ResearchNode) {
  if (!node.choiceGroup) return false;
  return researchNodes.some((candidate) => candidate.choiceGroup === node.choiceGroup
    && candidate.id !== node.id
    && hasResearch(state, candidate.id));
}

export function researchRequirementsMet(state: GameState, node: ResearchNode) {
  if (node.requiresResearch?.some((id) => !hasResearch(state, id))) return false;
  if (node.requiresAnyResearch && !node.requiresAnyResearch.some((id) => hasResearch(state, id))) return false;
  if (node.requiresKindiComplete && !state.kindi.complete) return false;
  if (node.requiresLevels) {
    for (const [discipline, requiredLevel] of Object.entries(node.requiresLevels)) {
      if (levelForXp(state.xp[discipline as Discipline]) < Number(requiredLevel)) return false;
    }
  }
  if (otherChoicePurchased(state, node) && !hasResearch(state, 'scriptorium')) return false;
  return true;
}

export function researchAvailable(state: GameState, node: ResearchNode) {
  return !hasResearch(state, node.id)
    && node.kind !== 'teaser'
    && node.cost !== null
    && researchRequirementsMet(state, node);
}

export function buyResearch(input: GameState, id: string, now = Date.now()) {
  const { state } = advanceGame(input, now);
  const node = researchNodes.find((candidate) => candidate.id === id);
  if (!node || !researchAvailable(state, node) || node.cost === null || state.knowledge + Number.EPSILON < node.cost) return state;

  state.knowledge = roundResource(state.knowledge - node.cost);
  state.research.push(node.id);

  if (node.id === 'mathematics') state.manuscripts.push('mathematical-folio');
  if (node.id === 'preserve') state.manuscripts.push('preserved-folio');
  if (node.id === 'follow') state.manuscripts.push('pattern-notes');
  if (node.id === 'language') {
    state.kindi.unlocked = true;
    state.kindi.phase = 'intro';
  }
  return state;
}

export function setLanguage(input: GameState, language: Language, now = Date.now()) {
  const { state } = advanceGame(input, now);
  state.language = language;
  return state;
}

export function beginKindi(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (!state.kindi.unlocked || state.kindi.complete) return state;
  state.kindi.phase = 'frequency';
  state.kindi.selectedSymbol = null;
  state.kindi.substitution = null;
  return state;
}

export function chooseKindiSymbol(input: GameState, symbol: string, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (state.kindi.phase !== 'frequency') return state;
  state.kindi.selectedSymbol = symbol;
  state.kindi.attempts += 1;
  if (symbol === '◆') state.kindi.phase = 'comparison';
  return state;
}

export function compareKindiFrequency(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (state.kindi.phase === 'comparison') state.kindi.phase = 'substitution';
  return state;
}

export function chooseKindiSubstitution(input: GameState, letter: string, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (state.kindi.phase !== 'substitution') return state;
  state.kindi.substitution = letter;
  state.kindi.attempts += 1;
  if (letter === 'common') state.kindi.phase = 'pattern';
  return state;
}

export function chooseKindiPlaintext(input: GameState, plaintext: string, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (state.kindi.phase !== 'pattern') return state;
  state.kindi.attempts += 1;
  if (plaintext !== 'correct') return state;
  state.kindi.phase = 'complete';
  state.kindi.complete = true;
  if (!hasManuscript(state, 'method-of-analysis')) state.manuscripts.push('method-of-analysis');
  return state;
}

export function acknowledgeOffline(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  state.offlineExplained = true;
  return state;
}

export function houseStage(state: GameState) {
  if (hasResearch(state, 'scriptorium')) return 3;
  if (hasResearch(state, 'preserve') || hasResearch(state, 'follow')) return 2;
  if (hasResearch(state, 'desk')) return 1;
  return 0;
}

export function objective(state: GameState, language: Language) {
  const ar = language === 'ar';
  if (!state.started) return ar ? 'ابدأ الترجمة' : 'Begin the work of Translation';
  if (!hasResearch(state, 'desk')) return ar ? 'رمّم مكتب القيّم' : 'Restore the Keeper’s Desk';
  if (!hasResearch(state, 'mathematics')) return ar ? 'اكشف الأرقام في الهوامش' : 'Reveal the Numerals in the Margins';
  if (!hasResearch(state, 'preserve') && !hasResearch(state, 'follow')) return ar ? 'اختر الأولوية الأولى للدار' : 'Choose the House’s first priority';
  if (!state.kindi.unlocked) return ar ? 'اربط بين اللغة والعدد' : 'Connect language and number';
  if (!state.kindi.complete) return ar ? 'حلّ شفرة الكندي' : 'Apply Al-Kindi’s method';
  if (!hasResearch(state, 'scriptorium')) return ar ? 'رمّم دار النسخ' : 'Restore the Scriptorium';
  return ar ? 'ستواصل الدار عملها في غيابك' : 'The House will keep working while you are away';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeState(value: unknown, now: number): GameState | null {
  if (!isRecord(value) || value.version !== GAME_VERSION) return null;
  const initial = createInitialState(now, value.language === 'ar' ? 'ar' : 'en');
  const xp = isRecord(value.xp) ? value.xp : {};
  const kindi = isRecord(value.kindi) ? value.kindi : {};
  const validPhase: KindiPhase[] = ['locked', 'intro', 'frequency', 'comparison', 'substitution', 'pattern', 'complete'];
  const research = Array.isArray(value.research) ? [...new Set(value.research.filter((item): item is string => typeof item === 'string'))] : [];
  const manuscripts = Array.isArray(value.manuscripts) ? [...new Set(value.manuscripts.filter((item): item is string => typeof item === 'string'))] : initial.manuscripts;
  const activeActivityId = typeof value.activeActivityId === 'string' && getActivity(value.activeActivityId) ? value.activeActivityId : null;

  return {
    ...initial,
    knowledge: typeof value.knowledge === 'number' && Number.isFinite(value.knowledge) ? Math.max(0, value.knowledge) : 0,
    xp: {
      translation: typeof xp.translation === 'number' ? Math.max(0, xp.translation) : 0,
      mathematics: typeof xp.mathematics === 'number' ? Math.max(0, xp.mathematics) : 0,
      astronomy: typeof xp.astronomy === 'number' ? Math.max(0, xp.astronomy) : 0,
    },
    activeActivityId,
    activityProgressMs: typeof value.activityProgressMs === 'number' ? Math.max(0, value.activityProgressMs) : 0,
    lastUpdatedAt: typeof value.lastUpdatedAt === 'number' && Number.isFinite(value.lastUpdatedAt) ? value.lastUpdatedAt : now,
    research,
    manuscripts,
    kindi: {
      unlocked: Boolean(kindi.unlocked) || research.includes('language'),
      phase: typeof kindi.phase === 'string' && validPhase.includes(kindi.phase as KindiPhase) ? kindi.phase as KindiPhase : 'locked',
      complete: Boolean(kindi.complete),
      selectedSymbol: typeof kindi.selectedSymbol === 'string' ? kindi.selectedSymbol : null,
      substitution: typeof kindi.substitution === 'string' ? kindi.substitution : null,
      attempts: typeof kindi.attempts === 'number' ? Math.max(0, Math.floor(kindi.attempts)) : 0,
    },
    language: value.language === 'ar' ? 'ar' : 'en',
    started: Boolean(value.started),
    offlineExplained: Boolean(value.offlineExplained),
    lastReward: isRecord(value.lastReward)
      && typeof value.lastReward.activityId === 'string'
      && typeof value.lastReward.knowledge === 'number'
      && typeof value.lastReward.xp === 'number'
      && typeof value.lastReward.repetitions === 'number'
      && typeof value.lastReward.at === 'number'
      ? value.lastReward as RewardEvent
      : null,
  };
}

function migrateLegacy(value: unknown, now: number): GameState | null {
  if (!isRecord(value) || value.version !== 1) return null;
  const migrated = createInitialState(now, value.language === 'ar' ? 'ar' : 'en');
  const xp = isRecord(value.xp) ? value.xp : {};
  const legacyKindi = isRecord(value.alkindi) ? value.alkindi : {};
  migrated.knowledge = typeof value.knowledge === 'number' ? Math.max(0, value.knowledge) : 0;
  migrated.xp = {
    translation: typeof xp.translation === 'number' ? Math.max(0, xp.translation) : 0,
    mathematics: typeof xp.mathematics === 'number' ? Math.max(0, xp.mathematics) : 0,
    astronomy: typeof xp.astronomy === 'number' ? Math.max(0, xp.astronomy) : 0,
  };
  migrated.research = Array.isArray(value.research) ? [...new Set(value.research.filter((item): item is string => typeof item === 'string'))] : [];
  migrated.activeActivityId = typeof value.active === 'string' && getActivity(value.active) ? value.active : 'faded';
  migrated.activityProgressMs = typeof value.progressMs === 'number' ? Math.max(0, value.progressMs) : 0;
  migrated.lastUpdatedAt = typeof value.lastUpdatedAt === 'number' ? value.lastUpdatedAt : now;
  migrated.started = true;
  migrated.kindi.unlocked = Boolean(legacyKindi.unlocked) || migrated.research.includes('language');
  migrated.kindi.complete = Boolean(legacyKindi.complete);
  migrated.kindi.phase = migrated.kindi.complete ? 'complete' : migrated.kindi.unlocked ? 'intro' : 'locked';
  if (migrated.kindi.complete) migrated.manuscripts.push('method-of-analysis');
  return migrated;
}

export function serializeGame(state: GameState) {
  return JSON.stringify(state);
}

export function loadGame(raw: string | null, now = Date.now()) {
  if (!raw) return { state: createInitialState(now), summary: null as AdvanceSummary | null, migrated: false, isNew: true };
  try {
    const parsed: unknown = JSON.parse(raw);
    const current = sanitizeState(parsed, now);
    const legacy = current ? null : migrateLegacy(parsed, now);
    const loaded = current ?? legacy;
    if (!loaded) return { state: createInitialState(now), summary: null, migrated: false, isNew: true };
    const advanced = advanceGame(loaded, now);
    return { state: advanced.state, summary: advanced.summary, migrated: Boolean(legacy), isNew: false };
  } catch {
    return { state: createInitialState(now), summary: null, migrated: false, isNew: true };
  }
}
