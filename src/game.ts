export type Discipline = 'language' | 'scribing' | 'gathering' | 'translation' | 'mathematics' | 'architecture';
export type Language = 'en' | 'ar';
export type LocalizedText = Record<Language, string>;
export type Material = 'timber' | 'stone';
export type TutorialStep = 'comic' | 'inspect-manuscript' | 'first-reward' | 'first-insight' | 'guided' | 'complete';
export type Destination = 'house' | 'work' | 'knowledge' | 'satchel' | 'memories';
export type TaskPurpose = 'learn' | 'make' | 'serve';
export type DailyNeedId = 'eastern-school';
export type QueueEntry = { activityId: string };
export type TaskCategory = 'chronicle' | 'restoration' | 'civic' | 'research' | 'daily';

export const GAME_VERSION = 6 as const;
export const SAVE_KEY = 'house-of-wisdom-v05';
export const V5_SAVE_KEY = 'house-of-wisdom-v04';
export const V4_SAVE_KEY = 'house-of-wisdom-v031';
export const V3_SAVE_KEY = 'house-of-wisdom-v03';
export const V2_SAVE_KEY = 'house-of-wisdom-v02';
export const LEGACY_SAVE_KEY = 'house-of-wisdom-v01';
export const OFFLINE_CAP_MS = 24 * 60 * 60 * 1_000;
export const PINNED_TASK_CAPACITY = 3;
export const DAILY_DUTY_TARGETS: Record<TaskPurpose, number> = { learn: 5_000, make: 100, serve: 50 };
export const EASTERN_SCHOOL_TARGET = 20;

export const lightMilestoneWeights: Record<string, number> = {
  'keeper-desk': 1,
  scriptorium: 3,
  'eastern-school': 1,
};

export type RewardEvent = {
  activityId: string;
  knowledge: number;
  xp: number;
  masteryXp: number;
  timber: number;
  stone: number;
  repetitions: number;
  at: number;
};

export type GameState = {
  version: typeof GAME_VERSION;
  knowledge: number;
  materials: Record<Material, number>;
  xp: Record<Discipline, number>;
  activeActivityId: string | null;
  workQueue: QueueEntry[];
  workTargetRemaining: number | null;
  activityProgressMs: number;
  lastUpdatedAt: number;
  skills: string[];
  inventory: string[];
  itemCounts: Record<string, number>;
  activityMasteryXp: Record<string, number>;
  pinnedTaskIds: string[];
  lightMilestones: string[];
  language: Language;
  started: boolean;
  comicSeen: boolean;
  ghostEncountered: boolean;
  ghostIdentityRevealed: boolean;
  deskRepaired: boolean;
  scriptoriumRepaired: boolean;
  ignoranceRevealed: boolean;
  prologueComplete: boolean;
  offlineExplained: boolean;
  tutorialStep: TutorialStep;
  tutorialSkipped: boolean;
  lastReward: RewardEvent | null;
  dailyNeedId: DailyNeedId | null;
  dailyNeedStep: number;
  dailyEncroachment: number;
  dailyNeedGeneratedOn: string | null;
  lastDailyResolvedOn: string | null;
  schoolRelit: boolean;
  civicProgress: {
    easternSchoolDeciphered: boolean;
    primersCopied: number;
    primersDelivered: number;
  };
  dailyDutyProgress: Record<TaskPurpose, number>;
};

export type Activity = {
  id: string;
  kind: 'study' | 'salvage' | 'scribe' | 'translate' | 'calculate' | 'build';
  purpose: TaskPurpose;
  discipline: Discipline;
  name: LocalizedText;
  description: LocalizedText;
  durationMs: number;
  knowledge: number;
  xp: number;
  timber?: number;
  stone?: number;
  minLevel: number;
  requiresSkills?: string[];
  requiresIdentity?: boolean;
  requiresScriptorium?: boolean;
  requiresSchool?: boolean;
  requiresDiscipline?: { discipline: Discipline; level: number };
  dailyStep?: number;
  singleRun?: boolean;
  knowledgeCost?: number;
  requiresItem?: string;
  rewardsItem?: string;
  consumesItem?: string;
};

export const activities: Activity[] = [
  {
    id: 'trace-letters', kind: 'study', purpose: 'learn', discipline: 'language',
    name: { en: 'Trace the Broken Letters', ar: 'تتبّع الحروف المكسورة' },
    description: { en: 'Compare the surviving marks in the torn manuscript.', ar: 'قارن العلامات الباقية في المخطوطة الممزقة.' },
    durationMs: 6_000, knowledge: 1, xp: 4, minLevel: 1,
  },
  {
    id: 'restore-word', kind: 'study', purpose: 'learn', discipline: 'language',
    name: { en: 'Restore a Missing Word', ar: 'استعد كلمة مفقودة' },
    description: { en: 'Use roots and context to recover one complete word.', ar: 'استخدم الجذور والسياق لاستعادة كلمة كاملة.' },
    durationMs: 9_000, knowledge: 2, xp: 6, minLevel: 2, requiresSkills: ['first-letter'],
  },
  {
    id: 'copy-phrase', kind: 'study', purpose: 'learn', discipline: 'language',
    name: { en: 'Rebuild a Broken Phrase', ar: 'أعد بناء عبارة مكسورة' },
    description: { en: 'Join words into a sentence the ghost can recognize.', ar: 'صِل الكلمات في جملة يستطيع الشبح تمييزها.' },
    durationMs: 13_000, knowledge: 4, xp: 8, minLevel: 3, requiresSkills: ['word-roots'],
  },
  {
    id: 'study-eloquence', kind: 'study', purpose: 'learn', discipline: 'language',
    name: { en: 'Listen for Meaning', ar: 'أنصت إلى المعنى' },
    description: { en: 'Recover tone, intent, and the humour hidden between words.', ar: 'استعد النبرة والقصد والفكاهة المختبئة بين الكلمات.' },
    durationMs: 17_000, knowledge: 6, xp: 10, minLevel: 4, requiresSkills: ['grammar'],
  },
  {
    id: 'salvage-timber', kind: 'salvage', purpose: 'make', discipline: 'gathering',
    name: { en: 'Recover Fallen Timber', ar: 'استخرج الخشب الساقط' },
    description: { en: 'Sort sound beams from splintered remains.', ar: 'افرز العوارض السليمة من البقايا المتكسرة.' },
    durationMs: 8_000, knowledge: 0.2, xp: 2, timber: 1, minLevel: 1,
    requiresSkills: ['eloquence'], requiresIdentity: true,
  },
  {
    id: 'sort-stone', kind: 'salvage', purpose: 'make', discipline: 'gathering',
    name: { en: 'Sort Usable Stone', ar: 'افرز الحجارة الصالحة' },
    description: { en: 'Find blocks strong enough to brace the Keeper’s Desk.', ar: 'اعثر على حجارة تصلح لتثبيت مكتب القيّم.' },
    durationMs: 10_000, knowledge: 0.2, xp: 2, stone: 1, minLevel: 1,
    requiresSkills: ['eloquence'], requiresIdentity: true,
  },
  {
    id: 'decipher-primer', kind: 'study', purpose: 'learn', discipline: 'language',
    name: { en: 'Decipher the Damaged Primer', ar: 'فكّ رموز الكرّاس التالف' },
    description: { en: 'Recover the lesson the eastern school can no longer read.', ar: 'استعد الدرس الذي لم تعد مدرسة الشرق قادرة على قراءته.' },
    durationMs: 60_000, knowledge: 25, xp: 30, minLevel: 5,
    requiresSkills: ['eloquence'], requiresScriptorium: true, dailyStep: 0, singleRun: true,
  },
  {
    id: 'copy-primer', kind: 'scribe', purpose: 'make', discipline: 'scribing',
    name: { en: 'Copy a Working Primer', ar: 'انسخ كرّاساً صالحاً' },
    description: { en: 'Preserve the original in the House and prepare a copy for the school.', ar: 'احفظ الأصل في الدار وأعدّ نسخة للمدرسة.' },
    durationMs: 45_000, knowledge: 0, xp: 12, minLevel: 1, knowledgeCost: 10,
    requiresSkills: ['eloquence'], requiresScriptorium: true, dailyStep: 1, requiresItem: 'ink', consumesItem: 'ink', rewardsItem: 'primer-copy',
  },
  {
    id: 'deliver-primer', kind: 'scribe', purpose: 'serve', discipline: 'scribing',
    name: { en: 'Deliver the Primer', ar: 'أوصل الكرّاس' },
    description: { en: 'Place the copied lesson in the hands of the eastern school.', ar: 'ضع نسخة الدرس في أيدي مدرسة الشرق.' },
    durationMs: 30_000, knowledge: 0, xp: 8, minLevel: 1,
    requiresSkills: ['eloquence'], requiresScriptorium: true, dailyStep: 2,
    requiresItem: 'primer-copy', consumesItem: 'primer-copy',
  },
  {
    id: 'prepare-ink', kind: 'scribe', purpose: 'make', discipline: 'scribing',
    name: { en: 'Prepare Scriptorium Ink', ar: 'حضّر حبر دار النسخ' },
    description: { en: 'Grind soot and bind it into ink that will survive handling.', ar: 'اطحن السخام وامزجه في حبر يصمد أمام كثرة الاستعمال.' },
    durationMs: 24_000, knowledge: 0.5, xp: 8, minLevel: 1,
    requiresSkills: ['eloquence'], requiresScriptorium: true, rewardsItem: 'ink',
  },
  {
    id: 'copy-folio', kind: 'scribe', purpose: 'make', discipline: 'scribing',
    name: { en: 'Copy a Useful Folio', ar: 'انسخ ورقة نافعة' },
    description: { en: 'Turn stored understanding into a copy that can leave the House.', ar: 'حوّل الفهم المحفوظ إلى نسخة تستطيع مغادرة الدار.' },
    durationMs: 45_000, knowledge: 0, xp: 12, minLevel: 2, knowledgeCost: 8,
    requiresSkills: ['eloquence'], requiresScriptorium: true, requiresItem: 'ink', consumesItem: 'ink', rewardsItem: 'folio-copy',
  },
  {
    id: 'teach-reading', kind: 'study', purpose: 'serve', discipline: 'language',
    name: { en: 'Teach at the Eastern School', ar: 'علّم في مدرسة الشرق' },
    description: { en: 'Spend Knowledge where it becomes another person’s ability to read.', ar: 'أنفق المعرفة حيث تصبح قدرةً على القراءة لدى شخص آخر.' },
    durationMs: 30_000, knowledge: 0, xp: 10, minLevel: 5, knowledgeCost: 5,
    requiresSkills: ['eloquence'], requiresSchool: true,
  },
  {
    id: 'compare-syriac', kind: 'translate', purpose: 'learn', discipline: 'translation',
    name: { en: 'Compare a Syriac Passage', ar: 'قارن مقطعاً سريانياً' },
    description: { en: 'Carry one recovered idea into Arabic without flattening its meaning.', ar: 'انقل فكرة مستعادة إلى العربية من غير أن تفقد معناها.' },
    durationMs: 75_000, knowledge: 18, xp: 15, minLevel: 1,
    requiresScriptorium: true, requiresSchool: true,
  },
  {
    id: 'study-geometry', kind: 'calculate', purpose: 'learn', discipline: 'mathematics',
    name: { en: 'Study Geometric Measures', ar: 'ادرس المقاييس الهندسية' },
    description: { en: 'Recover the ratios needed to turn a translated proof into a sound plan.', ar: 'استعد النسب اللازمة لتحويل البرهان المترجم إلى خطة سليمة.' },
    durationMs: 90_000, knowledge: 24, xp: 18, minLevel: 1,
    requiresDiscipline: { discipline: 'translation', level: 10 },
  },
  {
    id: 'draft-arch', kind: 'build', purpose: 'make', discipline: 'architecture',
    name: { en: 'Draft a Load-Bearing Arch', ar: 'ارسم مخطط قوس حامل' },
    description: { en: 'Apply Mathematics to a structure that can carry real stone.', ar: 'طبّق الرياضيات على بناء يستطيع حمل الحجر فعلاً.' },
    durationMs: 120_000, knowledge: 0, xp: 22, minLevel: 1, knowledgeCost: 30,
    requiresDiscipline: { discipline: 'mathematics', level: 10 },
  },
];

export type LanguageSkill = {
  id: string;
  cost: number | null;
  kind: 'language' | 'future';
  name: LocalizedText;
  eyebrow: LocalizedText;
  description: LocalizedText;
  minLevel: number;
  requiresSkills?: string[];
};

export const languageSkills: LanguageSkill[] = [
  {
    id: 'first-letter', cost: 8, kind: 'language', minLevel: 2,
    eyebrow: { en: 'Script', ar: 'الخط' }, name: { en: 'The First Letter', ar: 'الحرف الأول' },
    description: { en: 'Separate one surviving letter from the Darkness. The ghost’s first word becomes clear.', ar: 'ميّز حرفاً باقياً من العتمة. تتضح أول كلمة يقولها الشبح.' },
  },
  {
    id: 'word-roots', cost: 20, kind: 'language', minLevel: 3, requiresSkills: ['first-letter'],
    eyebrow: { en: 'Spelling & roots', ar: 'الإملاء والجذور' }, name: { en: 'Roots beneath the Dust', ar: 'جذور تحت الغبار' },
    description: { en: 'Recognize how related words preserve meaning even when their letters are damaged.', ar: 'تعرّف كيف تحفظ الكلمات المترابطة معناها حتى حين تتلف حروفها.' },
  },
  {
    id: 'grammar', cost: 35, kind: 'language', minLevel: 4, requiresSkills: ['word-roots'],
    eyebrow: { en: 'Grammar', ar: 'النحو' }, name: { en: 'Grammar Restores Meaning', ar: 'النحو يعيد المعنى' },
    description: { en: 'Reconnect subject, action, and intent. The ghost can finally speak a complete sentence.', ar: 'أعد وصل الفاعل والفعل والقصد. يستطيع الشبح أخيراً قول جملة كاملة.' },
  },
  {
    id: 'eloquence', cost: 55, kind: 'language', minLevel: 5, requiresSkills: ['grammar'],
    eyebrow: { en: 'Rhetoric', ar: 'البلاغة' }, name: { en: 'The Voice behind the Words', ar: 'الصوت خلف الكلمات' },
    description: { en: 'Recover tone, personality, and the signature hidden in the manuscript. The ghost’s identity is revealed.', ar: 'استعد النبرة والشخصية والتوقيع المخفي في المخطوطة. تنكشف هوية الشبح.' },
  },
  {
    id: 'poetry', cost: null, kind: 'future', minLevel: 1, requiresSkills: ['eloquence'],
    eyebrow: { en: 'Future branch', ar: 'فرع قادم' }, name: { en: 'Poetry & Metre', ar: 'الشعر والوزن' },
    description: { en: 'Language remembered through rhythm, image, and public memory.', ar: 'لغة تحفظها الأوزان والصور وذاكرة الناس.' },
  },
  {
    id: 'translation', cost: null, kind: 'future', minLevel: 1, requiresSkills: ['eloquence'],
    eyebrow: { en: 'Future branch', ar: 'فرع قادم' }, name: { en: 'Translation', ar: 'الترجمة' },
    description: { en: 'Carry ideas between Arabic, Greek, Syriac, Persian, and other scholarly traditions.', ar: 'انقل الأفكار بين العربية واليونانية والسريانية والفارسية وغيرها من التقاليد العلمية.' },
  },
];

const levelThresholds = [0, 8, 28, 60, 105, 170, 260, 380, 530, 720, 950];
for (let level = levelThresholds.length + 1; level <= 100; level += 1) {
  const previous = levelThresholds.at(-1)!;
  const increment = Math.round(250 * Math.pow(1.115, level - 11));
  levelThresholds.push(previous + increment);
}
const tutorialSteps = new Set<TutorialStep>(['comic', 'inspect-manuscript', 'first-reward', 'first-insight', 'guided', 'complete']);

export const disciplineDefinitions: Array<{ id: Discipline; name: LocalizedText; description: LocalizedText; glyph: string }> = [
  { id: 'language', glyph: 'ا', name: { en: 'Arabic Language', ar: 'اللغة العربية' }, description: { en: 'Letters, roots, grammar, eloquence, and poetry.', ar: 'الحروف والجذور والنحو والبلاغة والشعر.' } },
  { id: 'scribing', glyph: 'ق', name: { en: 'Scribing', ar: 'النسخ والكتابة' }, description: { en: 'Ink, folios, copying, binding, and preservation.', ar: 'الحبر والأوراق والنسخ والتجليد والحفظ.' } },
  { id: 'gathering', glyph: '◆', name: { en: 'Gathering', ar: 'جمع المواد' }, description: { en: 'Salvage, timber, stone, reeds, and later mining.', ar: 'الإنقاذ والخشب والحجر والقصب ثم التعدين.' } },
  { id: 'translation', glyph: 'ت', name: { en: 'Translation', ar: 'الترجمة' }, description: { en: 'Carry ideas between scholarly traditions.', ar: 'نقل الأفكار بين التقاليد العلمية.' } },
  { id: 'mathematics', glyph: '∑', name: { en: 'Mathematics', ar: 'الرياضيات' }, description: { en: 'Arithmetic, geometry, algebra, and measurement.', ar: 'الحساب والهندسة والجبر والقياس.' } },
  { id: 'architecture', glyph: '⌂', name: { en: 'Architecture', ar: 'العمارة' }, description: { en: 'Plans, structures, rooms, and civic restoration.', ar: 'المخططات والبناء والغرف والترميم المدني.' } },
];

export function levelForXp(xp: number) {
  let result = 1;
  for (let index = 1; index < levelThresholds.length; index += 1) {
    if (xp >= levelThresholds[index]) result = index + 1;
    else break;
  }
  return result;
}

export function masteryLevelForXp(xp: number) {
  return Math.min(100, Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 20)) + 1));
}

export function activityMasteryLevel(state: GameState, activityId: string) {
  return masteryLevelForXp(state.activityMasteryXp[activityId] ?? 0);
}

export function activityDurationMs(state: GameState, activity: Activity) {
  const level = activityMasteryLevel(state, activity.id);
  const reduction = Math.min(0.25, (level - 1) * 0.0025);
  return Math.max(1_000, Math.round(activity.durationMs * (1 - reduction)));
}

export function disciplineUnlocked(state: GameState, discipline: Discipline) {
  if (discipline === 'language') return state.started;
  if (discipline === 'gathering') return state.ghostIdentityRevealed;
  if (discipline === 'scribing') return state.scriptoriumRepaired;
  if (discipline === 'translation') return state.schoolRelit;
  if (discipline === 'mathematics') return levelForXp(state.xp.translation) >= 10;
  return levelForXp(state.xp.mathematics) >= 10;
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

export function hasSkill(state: GameState, id: string) { return state.skills.includes(id); }
export function getItemCount(state: GameState, id: string) { return state.itemCounts[id] ?? (state.inventory.includes(id) ? 1 : 0); }
export function hasItem(state: GameState, id: string) { return getItemCount(state, id) > 0; }

export function campaignDarknessPercent(state: GameState) {
  const restored = state.lightMilestones.reduce((total, id) => total + (lightMilestoneWeights[id] ?? 0), 0);
  return Math.max(0, Math.round((100 - restored) * 10) / 10);
}

export function darknessPercent(state: GameState) {
  return Math.min(100, campaignDarknessPercent(state) + state.dailyEncroachment);
}

function addLightMilestone(state: GameState, id: string) {
  if (lightMilestoneWeights[id] !== undefined && !state.lightMilestones.includes(id)) state.lightMilestones.push(id);
}

function localDateKey(now: number) {
  const date = new Date(now);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function beginDailyDuties(state: GameState, now: number) {
  if (!state.schoolRelit) return;
  const today = localDateKey(now);
  if (state.dailyNeedGeneratedOn === today) return;
  state.dailyDutyProgress = { learn: 0, make: 0, serve: 0 };
  state.dailyEncroachment = 3;
  state.dailyNeedGeneratedOn = today;
}

export function createInitialState(now = Date.now(), language: Language = 'ar'): GameState {
  return {
    version: GAME_VERSION,
    knowledge: 0,
    materials: { timber: 0, stone: 0 },
    xp: { language: 0, scribing: 0, gathering: 0, translation: 0, mathematics: 0, architecture: 0 },
    activeActivityId: null,
    workQueue: [],
    workTargetRemaining: null,
    activityProgressMs: 0,
    lastUpdatedAt: now,
    skills: [],
    inventory: ['torn-manuscript', 'worn-hammer'],
    itemCounts: {},
    activityMasteryXp: {},
    pinnedTaskIds: ['chronicle-first-word'],
    lightMilestones: [],
    language,
    started: false,
    comicSeen: false,
    ghostEncountered: false,
    ghostIdentityRevealed: false,
    deskRepaired: false,
    scriptoriumRepaired: false,
    ignoranceRevealed: false,
    prologueComplete: false,
    offlineExplained: false,
    tutorialStep: 'comic',
    tutorialSkipped: false,
    lastReward: null,
    dailyNeedId: null,
    dailyNeedStep: 0,
    dailyEncroachment: 0,
    dailyNeedGeneratedOn: null,
    lastDailyResolvedOn: null,
    schoolRelit: false,
    civicProgress: { easternSchoolDeciphered: false, primersCopied: 0, primersDelivered: 0 },
    dailyDutyProgress: { learn: 0, make: 0, serve: 0 },
  };
}

export function getActivity(id: string | null) { return activities.find((activity) => activity.id === id) ?? null; }

export function activityAvailable(state: GameState, activity: Activity) {
  return disciplineUnlocked(state, activity.discipline)
    && levelForXp(state.xp[activity.discipline]) >= activity.minLevel
    && (!activity.requiresSkills || activity.requiresSkills.every((id) => hasSkill(state, id)))
    && (!activity.requiresIdentity || state.ghostIdentityRevealed)
    && (!activity.requiresScriptorium || state.scriptoriumRepaired)
    && (!activity.requiresSchool || state.schoolRelit)
    && (!activity.requiresDiscipline || levelForXp(state.xp[activity.requiresDiscipline.discipline]) >= activity.requiresDiscipline.level)
    && (activity.dailyStep === undefined || (state.dailyNeedId !== null && state.dailyNeedStep === activity.dailyStep))
    && (activity.knowledgeCost === undefined || state.knowledge + Number.EPSILON >= activity.knowledgeCost)
    && (!activity.requiresItem || getItemCount(state, activity.requiresItem) > 0);
}

function roundResource(value: number) { return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000; }

export function knowledgeMultiplier(state: GameState, discipline: Discipline) {
  return state.deskRepaired && discipline === 'language' ? 1.1 : 1;
}

export type AdvanceSummary = {
  elapsedMs: number;
  appliedElapsedMs: number;
  cappedMs: number;
  knowledge: number;
  xp: number;
  masteryXp: number;
  timber: number;
  stone: number;
  items: Record<string, number>;
  completions: number;
  activityId: string | null;
  completedActivityIds: string[];
  activityRepetitions: Record<string, number>;
  darknessCleared: number;
  blockedActivityId: string | null;
};

function syncActiveActivity(state: GameState) {
  state.activeActivityId = state.workQueue[0]?.activityId ?? null;
}

function removeItem(state: GameState, id: string) {
  const count = getItemCount(state, id);
  if (count <= 0) return;
  if (count > 1) state.itemCounts[id] = count - 1;
  else {
    delete state.itemCounts[id];
    const index = state.inventory.indexOf(id);
    if (index >= 0) state.inventory.splice(index, 1);
  }
}

function addItem(state: GameState, id: string, quantity = 1) {
  if (quantity <= 0) return;
  const current = state.itemCounts[id] ?? 0;
  state.itemCounts[id] = current + quantity;
  if (!state.inventory.includes(id)) state.inventory.push(id);
}

function updateDailyDuty(state: GameState, purpose: TaskPurpose, amount: number, summary: AdvanceSummary, now: number) {
  if (!state.schoolRelit || state.dailyNeedGeneratedOn !== localDateKey(now) || amount <= 0) return;
  const target = DAILY_DUTY_TARGETS[purpose];
  const before = state.dailyDutyProgress[purpose];
  state.dailyDutyProgress[purpose] = Math.min(target, roundResource(before + amount));
  if (before < target && state.dailyDutyProgress[purpose] >= target) {
    state.dailyEncroachment = Math.max(0, state.dailyEncroachment - 1);
    summary.darknessCleared += 1;
  }
  if ((Object.keys(DAILY_DUTY_TARGETS) as TaskPurpose[]).every((key) => state.dailyDutyProgress[key] >= DAILY_DUTY_TARGETS[key])) {
    state.lastDailyResolvedOn = localDateKey(now);
    state.dailyEncroachment = 0;
  }
}

function completeActivity(state: GameState, activity: Activity, now: number, summary: AdvanceSummary) {
  const firstDiscovery = state.tutorialStep === 'first-reward' && activity.id === 'trace-letters';
  const masteryLevel = activityMasteryLevel(state, activity.id);
  const masteryTier = Math.floor((masteryLevel - 1) / 20);
  const knowledge = roundResource(activity.knowledge * knowledgeMultiplier(state, activity.discipline) * (1 + masteryTier * 0.05) + (firstDiscovery ? 7 : 0));
  const xp = activity.xp + (firstDiscovery ? 4 : 0);
  const timber = activity.timber ? activity.timber + masteryTier : 0;
  const stone = activity.stone ? activity.stone + masteryTier : 0;
  const itemQuantity = activity.rewardsItem ? 1 + Math.floor((masteryLevel - 1) / 25) : 0;

  if (activity.knowledgeCost) state.knowledge = roundResource(state.knowledge - activity.knowledgeCost);
  if (activity.consumesItem) removeItem(state, activity.consumesItem);
  state.knowledge = roundResource(state.knowledge + knowledge);
  state.xp[activity.discipline] += xp;
  state.materials.timber += timber;
  state.materials.stone += stone;
  state.activityMasteryXp[activity.id] = (state.activityMasteryXp[activity.id] ?? 0) + 1;
  if (activity.rewardsItem) addItem(state, activity.rewardsItem, itemQuantity);

  if (activity.id === 'decipher-primer' && state.dailyNeedId === 'eastern-school' && state.dailyNeedStep === 0) {
    state.civicProgress.easternSchoolDeciphered = true;
    state.dailyNeedStep = 1;
  } else if (activity.id === 'copy-primer' && state.dailyNeedId === 'eastern-school' && state.dailyNeedStep === 1) {
    state.civicProgress.primersCopied = Math.min(EASTERN_SCHOOL_TARGET, state.civicProgress.primersCopied + itemQuantity);
    if (state.civicProgress.primersCopied >= EASTERN_SCHOOL_TARGET) state.dailyNeedStep = 2;
  } else if (activity.id === 'deliver-primer' && state.dailyNeedId === 'eastern-school' && state.dailyNeedStep === 2) {
    state.civicProgress.primersDelivered = Math.min(EASTERN_SCHOOL_TARGET, state.civicProgress.primersDelivered + 1);
    if (state.civicProgress.primersDelivered >= EASTERN_SCHOOL_TARGET) {
      state.dailyNeedId = null;
      state.dailyNeedStep = 3;
      state.schoolRelit = true;
      addLightMilestone(state, 'eastern-school');
      state.dailyDutyProgress = { ...DAILY_DUTY_TARGETS };
      state.dailyNeedGeneratedOn = localDateKey(now);
      state.lastDailyResolvedOn = localDateKey(now);
      state.dailyEncroachment = 0;
    }
  }

  updateDailyDuty(state, activity.purpose, activity.purpose === 'learn' ? Math.max(0, knowledge) : 1, summary, now);

  state.lastReward = { activityId: activity.id, knowledge, xp, masteryXp: 1, timber, stone, repetitions: 1, at: now };
  summary.knowledge = roundResource(summary.knowledge + knowledge - (activity.knowledgeCost ?? 0));
  summary.xp += xp;
  summary.masteryXp += 1;
  summary.timber += timber;
  summary.stone += stone;
  if (activity.rewardsItem) summary.items[activity.rewardsItem] = (summary.items[activity.rewardsItem] ?? 0) + itemQuantity;
  summary.completions += 1;
  if (!summary.completedActivityIds.includes(activity.id)) summary.completedActivityIds.push(activity.id);
  summary.activityRepetitions[activity.id] = (summary.activityRepetitions[activity.id] ?? 0) + 1;
  if (firstDiscovery) state.tutorialStep = 'first-insight';
}

export function advanceGame(input: GameState, now = Date.now(), capMs = OFFLINE_CAP_MS) {
  const state = structuredClone(input);
  beginDailyDuties(state, now);
  if (state.workQueue.length === 0 && state.activeActivityId) state.workQueue.push({ activityId: state.activeActivityId });
  state.workQueue = state.workQueue.slice(0, 1);
  syncActiveActivity(state);
  const elapsedMs = Math.max(0, now - state.lastUpdatedAt);
  const appliedElapsedMs = Math.min(elapsedMs, Math.max(0, capMs));
  const firstActivity = getActivity(state.activeActivityId);
  const summary: AdvanceSummary = {
    elapsedMs, appliedElapsedMs, cappedMs: elapsedMs - appliedElapsedMs,
    knowledge: 0, xp: 0, masteryXp: 0, timber: 0, stone: 0, items: {}, completions: 0, activityId: firstActivity?.id ?? null,
    completedActivityIds: [], activityRepetitions: {}, darknessCleared: 0, blockedActivityId: null,
  };

  let remainingMs = appliedElapsedMs;
  while (state.activeActivityId) {
    const activity = getActivity(state.workQueue[0].activityId);
    if (!activity) {
      state.workQueue = [];
      state.activityProgressMs = 0;
      syncActiveActivity(state);
      break;
    }
    if (!activityAvailable(state, activity)) {
      summary.blockedActivityId = activity.id;
      state.workQueue = [];
      state.activityProgressMs = 0;
      syncActiveActivity(state);
      break;
    }
    const durationMs = activityDurationMs(state, activity);
    const neededMs = durationMs - state.activityProgressMs;
    if (remainingMs < neededMs) {
      state.activityProgressMs += remainingMs;
      remainingMs = 0;
      break;
    }
    remainingMs -= neededMs;
    state.activityProgressMs = 0;
    completeActivity(state, activity, now, summary);
    if (state.workTargetRemaining !== null) state.workTargetRemaining = Math.max(0, state.workTargetRemaining - 1);
    if (activity.singleRun || state.workTargetRemaining === 0 || !activityAvailable(state, activity)) {
      state.workQueue = [];
      state.workTargetRemaining = null;
      syncActiveActivity(state);
    }
    if (remainingMs <= 0) break;
  }

  state.lastUpdatedAt = now;
  return { state, summary };
}

export function activityTiming(state: GameState, now = Date.now()) {
  const activity = getActivity(state.activeActivityId);
  if (!activity) return null;
  const elapsed = Math.min(Math.max(0, now - state.lastUpdatedAt), OFFLINE_CAP_MS);
  const total = state.activityProgressMs + elapsed;
  const durationMs = activityDurationMs(state, activity);
  if (total >= durationMs) return { durationMs, elapsedMs: durationMs, remainingMs: 0, percent: 100 };
  return { durationMs, elapsedMs: total, remainingMs: durationMs - total, percent: (total / durationMs) * 100 };
}

export function startGame(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (state.started) return state;
  state.started = true;
  state.comicSeen = true;
  state.ghostEncountered = true;
  state.activeActivityId = null;
  state.workQueue = [];
  state.workTargetRemaining = null;
  state.activityProgressMs = 0;
  state.lastUpdatedAt = now;
  state.tutorialStep = 'inspect-manuscript';
  return state;
}

export function inspectManuscript(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (!state.started || state.tutorialStep !== 'inspect-manuscript') return state;
  state.activeActivityId = 'trace-letters';
  state.workQueue = [{ activityId: 'trace-letters' }];
  state.workTargetRemaining = null;
  state.activityProgressMs = 0;
  state.lastUpdatedAt = now;
  state.tutorialStep = 'first-reward';
  return state;
}

export function skipTutorial(input: GameState, now = Date.now()) {
  let state = input;
  if (!state.started) state = startGame(state, now);
  const advanced = advanceGame(state, now).state;
  advanced.tutorialSkipped = true;
  advanced.tutorialStep = advanced.prologueComplete ? 'complete' : 'guided';
  if (!advanced.activeActivityId && !advanced.prologueComplete) advanced.activeActivityId = 'trace-letters';
  if (advanced.workQueue.length === 0 && advanced.activeActivityId) advanced.workQueue = [{ activityId: advanced.activeActivityId }];
  advanced.workTargetRemaining = null;
  advanced.activityProgressMs = 0;
  advanced.lastUpdatedAt = now;
  return advanced;
}

export function selectActivity(input: GameState, id: string, now = Date.now()) {
  const { state } = advanceGame(input, now);
  const activity = getActivity(id);
  if (!activity || !activityAvailable(state, activity)) return state;
  if (state.activeActivityId === id) return state;
  state.workQueue = [{ activityId: id }];
  state.workTargetRemaining = activity.singleRun ? 1 : null;
  state.activityProgressMs = 0;
  syncActiveActivity(state);
  state.lastUpdatedAt = now;
  return state;
}

export function cancelQueuedActivity(input: GameState, index: number, now = Date.now()) {
  return index === 0 ? stopCurrentWork(input, now) : advanceGame(input, now).state;
}

export function moveQueuedActivity(input: GameState, index: number, direction: -1 | 1, now = Date.now()) {
  void index; void direction;
  return advanceGame(input, now).state;
}

export function queueDailyPlan(input: GameState, now = Date.now()) {
  return selectActivity(input, 'decipher-primer', now);
}

export function stopCurrentWork(input: GameState, now = Date.now()) {
  const state = advanceGame(input, now).state;
  state.workQueue = [];
  state.activeActivityId = null;
  state.workTargetRemaining = null;
  state.activityProgressMs = 0;
  state.lastUpdatedAt = now;
  return state;
}

export function setWorkTarget(input: GameState, target: number | null, now = Date.now()) {
  const state = advanceGame(input, now).state;
  if (!state.activeActivityId) return state;
  state.workTargetRemaining = target === null ? null : Math.max(1, Math.floor(target));
  state.lastUpdatedAt = now;
  return state;
}

export function skillRequirementsMet(state: GameState, skill: LanguageSkill) {
  return levelForXp(state.xp.language) >= skill.minLevel
    && (!skill.requiresSkills || skill.requiresSkills.every((id) => hasSkill(state, id)));
}

export function skillAvailable(state: GameState, skill: LanguageSkill) {
  return skill.kind !== 'future' && skill.cost !== null && !hasSkill(state, skill.id) && skillRequirementsMet(state, skill);
}

export function nextLanguageSkill(state: GameState) {
  return languageSkills.find((skill) => skill.kind === 'language' && !hasSkill(state, skill.id)) ?? null;
}

export function buyLanguageSkill(input: GameState, id: string, now = Date.now()) {
  const { state } = advanceGame(input, now);
  const skill = languageSkills.find((candidate) => candidate.id === id);
  if (!skill || !skillAvailable(state, skill) || skill.cost === null || state.knowledge + Number.EPSILON < skill.cost) return state;
  state.knowledge = roundResource(state.knowledge - skill.cost);
  state.skills.push(skill.id);
  if (skill.id === 'first-letter') {
    if (!hasItem(state, 'first-word')) state.inventory.push('first-word');
    if (state.tutorialStep === 'first-insight') state.tutorialStep = 'guided';
  }
  if (skill.id === 'grammar' && !hasItem(state, 'restored-sentence')) state.inventory.push('restored-sentence');
  if (skill.id === 'eloquence') {
    state.ghostIdentityRevealed = true;
    if (!hasItem(state, 'al-jahiz-signature')) state.inventory.push('al-jahiz-signature');
  }
  return state;
}

export const deskRequirements = { knowledge: 30, timber: 5, stone: 4 } as const;
export const scriptoriumRequirements = { knowledge: 6_000, timber: 800, stone: 600 } as const;

export function canRepairDesk(state: GameState) {
  return state.ghostIdentityRevealed && !state.deskRepaired
    && state.knowledge + Number.EPSILON >= deskRequirements.knowledge
    && state.materials.timber >= deskRequirements.timber
    && state.materials.stone >= deskRequirements.stone;
}

export function repairKeeperDesk(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (!canRepairDesk(state)) return state;
  state.knowledge = roundResource(state.knowledge - deskRequirements.knowledge);
  state.materials.timber -= deskRequirements.timber;
  state.materials.stone -= deskRequirements.stone;
  state.deskRepaired = true;
  state.ignoranceRevealed = true;
  state.prologueComplete = true;
  state.tutorialStep = 'complete';
  state.workQueue = [{ activityId: 'study-eloquence' }];
  state.activeActivityId = 'study-eloquence';
  state.workTargetRemaining = null;
  state.activityProgressMs = 0;
  state.lastUpdatedAt = now;
  addLightMilestone(state, 'keeper-desk');
  if (!hasItem(state, 'keeper-desk')) state.inventory.push('keeper-desk');
  return state;
}

export function canRestoreScriptorium(state: GameState) {
  return state.prologueComplete && state.ghostIdentityRevealed && !state.scriptoriumRepaired
    && state.knowledge + Number.EPSILON >= scriptoriumRequirements.knowledge
    && state.materials.timber >= scriptoriumRequirements.timber
    && state.materials.stone >= scriptoriumRequirements.stone;
}

export function restoreScriptorium(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (!canRestoreScriptorium(state)) return state;
  state.knowledge = roundResource(state.knowledge - scriptoriumRequirements.knowledge);
  state.materials.timber -= scriptoriumRequirements.timber;
  state.materials.stone -= scriptoriumRequirements.stone;
  state.scriptoriumRepaired = true;
  addLightMilestone(state, 'scriptorium');
  if (!hasItem(state, 'scriptorium')) state.inventory.push('scriptorium');
  state.dailyNeedId = 'eastern-school';
  state.dailyNeedStep = 0;
  state.dailyEncroachment = 0;
  state.civicProgress = { easternSchoolDeciphered: false, primersCopied: 0, primersDelivered: 0 };
  if (!state.pinnedTaskIds.includes('civic-eastern-school') && state.pinnedTaskIds.length < PINNED_TASK_CAPACITY) state.pinnedTaskIds.push('civic-eastern-school');
  state.lastUpdatedAt = now;
  return state;
}

export type LedgerTaskStep = { label: LocalizedText; current: number; target: number };
export type LedgerTask = {
  id: string;
  category: TaskCategory;
  title: LocalizedText;
  description: LocalizedText;
  status: 'locked' | 'available' | 'complete';
  steps: LedgerTaskStep[];
};

export function ledgerTasks(state: GameState): LedgerTask[] {
  const tasks: LedgerTask[] = [
    {
      id: 'chronicle-first-word', category: 'chronicle',
      title: { en: 'The First Word', ar: 'الكلمة الأولى' },
      description: { en: 'Recover the unknown guardian’s speech and learn his name.', ar: 'استعد كلام الحارس المجهول واعرف اسمه.' },
      status: state.ghostIdentityRevealed ? 'complete' : 'available',
      steps: [
        { label: { en: 'Arabic insights understood', ar: 'معارف العربية المفهومة' }, current: Math.min(4, state.skills.filter((id) => ['first-letter', 'word-roots', 'grammar', 'eloquence'].includes(id)).length), target: 4 },
      ],
    },
    {
      id: 'restore-keeper-desk', category: 'restoration',
      title: { en: 'Restore the Keeper’s Desk', ar: 'رمّم مكتب القيّم' },
      description: { en: 'Give knowledge its first working place and light the first lamp.', ar: 'أعد للمعرفة أول موضع للعمل وأشعل أول مصباح.' },
      status: !state.ghostIdentityRevealed ? 'locked' : state.deskRepaired ? 'complete' : 'available',
      steps: [
        { label: { en: 'Knowledge', ar: 'المعرفة' }, current: state.deskRepaired ? deskRequirements.knowledge : state.knowledge, target: deskRequirements.knowledge },
        { label: { en: 'Timber', ar: 'الخشب' }, current: state.deskRepaired ? deskRequirements.timber : state.materials.timber, target: deskRequirements.timber },
        { label: { en: 'Stone', ar: 'الحجر' }, current: state.deskRepaired ? deskRequirements.stone : state.materials.stone, target: deskRequirements.stone },
      ],
    },
    {
      id: 'restore-scriptorium', category: 'restoration',
      title: { en: 'Restore the Scriptorium', ar: 'رمّم دار النسخ' },
      description: { en: 'A multi-hour project: accumulate a day’s Knowledge and recover enough material to let books travel again.', ar: 'مشروع يمتد ساعات: اجمع معرفة يوم كامل ومواد تكفي لعودة الكتب إلى السفر.' },
      status: !state.deskRepaired ? 'locked' : state.scriptoriumRepaired ? 'complete' : 'available',
      steps: [
        { label: { en: 'Knowledge', ar: 'المعرفة' }, current: state.scriptoriumRepaired ? scriptoriumRequirements.knowledge : state.knowledge, target: scriptoriumRequirements.knowledge },
        { label: { en: 'Timber', ar: 'الخشب' }, current: state.scriptoriumRepaired ? scriptoriumRequirements.timber : state.materials.timber, target: scriptoriumRequirements.timber },
        { label: { en: 'Stone', ar: 'الحجر' }, current: state.scriptoriumRepaired ? scriptoriumRequirements.stone : state.materials.stone, target: scriptoriumRequirements.stone },
      ],
    },
    {
      id: 'civic-eastern-school', category: 'civic',
      title: { en: 'Relight the Eastern School', ar: 'أعد النور إلى مدرسة الشرق' },
      description: { en: 'Decipher its damaged primer, preserve the original, and circulate twenty working copies.', ar: 'فك رموز كرّاسها التالف واحفظ الأصل ووزّع عشرين نسخة صالحة.' },
      status: !state.scriptoriumRepaired ? 'locked' : state.schoolRelit ? 'complete' : 'available',
      steps: [
        { label: { en: 'Primer deciphered', ar: 'فُكّت رموز الكرّاس' }, current: state.civicProgress.easternSchoolDeciphered ? 1 : 0, target: 1 },
        { label: { en: 'Copies made', ar: 'النسخ المصنوعة' }, current: state.civicProgress.primersCopied, target: EASTERN_SCHOOL_TARGET },
        { label: { en: 'Copies delivered', ar: 'النسخ الموصلة' }, current: state.civicProgress.primersDelivered, target: EASTERN_SCHOOL_TARGET },
      ],
    },
    {
      id: 'research-translation', category: 'research',
      title: { en: 'Open the Road to Mathematics', ar: 'افتح طريق الرياضيات' },
      description: { en: 'Practice Translation until mathematical manuscripts can be understood.', ar: 'تدرّب على الترجمة حتى تصبح المخطوطات الرياضية مفهومة.' },
      status: !state.schoolRelit ? 'locked' : levelForXp(state.xp.translation) >= 10 ? 'complete' : 'available',
      steps: [{ label: { en: 'Translation level', ar: 'مستوى الترجمة' }, current: levelForXp(state.xp.translation), target: 10 }],
    },
  ];

  if (state.schoolRelit) {
    const dailyCopy: Record<TaskPurpose, { title: LocalizedText; description: LocalizedText }> = {
      learn: { title: { en: 'Daily Study', ar: 'دراسة اليوم' }, description: { en: 'Create Knowledge through patient study.', ar: 'أنشئ المعرفة بالدراسة المتأنية.' } },
      make: { title: { en: 'Daily Craft', ar: 'صنعة اليوم' }, description: { en: 'Produce useful pages, ink, or civic components.', ar: 'أنتج أوراقاً أو حبراً أو مكونات نافعة.' } },
      serve: { title: { en: 'Daily Service', ar: 'خدمة اليوم' }, description: { en: 'Put knowledge into another person’s hands.', ar: 'ضع المعرفة في يد شخص آخر.' } },
    };
    (Object.keys(DAILY_DUTY_TARGETS) as TaskPurpose[]).forEach((purpose) => {
      tasks.push({
        id: `daily-${purpose}`, category: 'daily', ...dailyCopy[purpose],
        status: state.dailyDutyProgress[purpose] >= DAILY_DUTY_TARGETS[purpose] ? 'complete' : 'available',
        steps: [{ label: dailyCopy[purpose].title, current: state.dailyDutyProgress[purpose], target: DAILY_DUTY_TARGETS[purpose] }],
      });
    });
  }
  return tasks;
}

export function togglePinnedTask(input: GameState, taskId: string, now = Date.now()) {
  const state = advanceGame(input, now).state;
  if (!ledgerTasks(state).some((task) => task.id === taskId)) return state;
  if (state.pinnedTaskIds.includes(taskId)) state.pinnedTaskIds = state.pinnedTaskIds.filter((id) => id !== taskId);
  else if (state.pinnedTaskIds.length < PINNED_TASK_CAPACITY) state.pinnedTaskIds.push(taskId);
  return state;
}

export function setLanguage(input: GameState, language: Language, now = Date.now()) {
  const state = advanceGame(input, now).state;
  state.language = language;
  return state;
}

export function acknowledgeOffline(input: GameState, now = Date.now()) {
  const state = advanceGame(input, now).state;
  state.offlineExplained = true;
  return state;
}

export function houseStage(state: GameState) { return state.scriptoriumRepaired ? 2 : state.deskRepaired ? 1 : 0; }

export function storyProgress(state: GameState) {
  if (state.prologueComplete) return 100;
  if (state.ghostIdentityRevealed) return 76;
  if (hasSkill(state, 'grammar')) return 58;
  if (hasSkill(state, 'word-roots')) return 40;
  if (hasSkill(state, 'first-letter')) return 24;
  if (state.started) return 10;
  return 0;
}

export function objective(state: GameState, language: Language) {
  const ar = language === 'ar';
  if (!state.started) return ar ? 'ادخل المدينة التي لم يطلع عليها الفجر' : 'Enter the city where dawn never comes';
  if (state.tutorialStep === 'inspect-manuscript') return ar ? 'افحص المخطوطة التي يشير إليها الشبح' : 'Inspect the manuscript the ghost is pointing toward';
  const next = nextLanguageSkill(state);
  if (next && !state.ghostIdentityRevealed) {
    const ready = skillAvailable(state, next) && next.cost !== null && state.knowledge + Number.EPSILON >= next.cost;
    if (ready) return ar ? `افهم: ${next.name.ar}` : `Understand: ${next.name.en}`;
    return ar ? 'اعمل عند مكتب المخطوطات لاستعادة كلام الشبح' : 'Work at the Manuscript Desk to restore the ghost’s speech';
  }
  if (state.scriptoriumRepaired && state.dailyNeedId) {
    const daily = [
      ar ? 'فكّ رموز كرّاس مدرسة الشرق' : 'Decipher the eastern school’s damaged primer',
      ar ? `انسخ عشرين كرّاساً للمدرسة (${state.civicProgress.primersCopied}/${EASTERN_SCHOOL_TARGET})` : `Make twenty working copies for the school (${state.civicProgress.primersCopied}/${EASTERN_SCHOOL_TARGET})`,
      ar ? `أوصل النسخ وأعد مصباح المدرسة (${state.civicProgress.primersDelivered}/${EASTERN_SCHOOL_TARGET})` : `Deliver the copies and relight the school (${state.civicProgress.primersDelivered}/${EASTERN_SCHOOL_TARGET})`,
    ];
    return daily[state.dailyNeedStep] ?? daily[2];
  }
  if (state.schoolRelit && state.dailyEncroachment > 0) {
    const purpose = (Object.keys(DAILY_DUTY_TARGETS) as TaskPurpose[]).find((key) => state.dailyDutyProgress[key] < DAILY_DUTY_TARGETS[key]) ?? 'serve';
    const labels = { learn: { en: 'Complete today’s long study', ar: 'أكمل دراسة اليوم الطويلة' }, make: { en: 'Complete today’s useful craft', ar: 'أكمل صنعة اليوم النافعة' }, serve: { en: 'Put today’s knowledge into service', ar: 'ضع معرفة اليوم في خدمة الناس' } };
    return labels[purpose][language];
  }
  if (state.scriptoriumRepaired && state.schoolRelit) return ar ? 'اختر ما سيتدرّب عليه الباحث حتى عودتك' : 'Choose what the researcher will practice until you return';
  if (state.deskRepaired) return ar ? 'رمّم دار النسخ لتبدأ المعرفة بالانتقال' : 'Restore the Scriptorium so knowledge can begin to travel';
  if (state.materials.timber < deskRequirements.timber || state.materials.stone < deskRequirements.stone) {
    return ar ? 'استخرج الخشب والحجر لمكتب القيّم' : 'Recover timber and stone for the Keeper’s Desk';
  }
  if (state.knowledge < deskRequirements.knowledge) return ar ? 'اجمع المعرفة لإتمام الترميم' : 'Gather Knowledge to complete the restoration';
  return ar ? 'رمّم مكتب القيّم وأشعل أول مصباح' : 'Restore the Keeper’s Desk and light the first lamp';
}

export function narrativePurpose(state: GameState, language: Language) {
  const ar = language === 'ar';
  if (!state.started) return ar ? 'أعد النور إلى بغداد' : 'Bring light back to Baghdad';
  if (!state.ghostIdentityRevealed) return ar ? 'افهم حارس الدار المجهول' : 'Understand the unknown guardian of the House';
  if (!state.deskRepaired) return ar ? 'أعد أول موضع للمعرفة إلى العمل' : 'Return the first place of knowledge to use';
  if (!state.scriptoriumRepaired) return ar ? 'أعد دار النسخ إلى العمل' : 'Return the Scriptorium to use';
  return ar ? 'حوّل المعرفة إلى نور يخدم المدينة' : 'Turn knowledge into light that serves the city';
}

export function recommendedDestination(state: GameState): Destination {
  if (state.tutorialStep === 'inspect-manuscript') return 'house';
  if (state.tutorialStep === 'first-reward') return 'work';
  if (state.tutorialStep === 'first-insight') return 'knowledge';
  if (!state.ghostIdentityRevealed) {
    const next = nextLanguageSkill(state);
    if (next && skillAvailable(state, next) && next.cost !== null && state.knowledge + Number.EPSILON >= next.cost) return 'knowledge';
    return 'work';
  }
  if (state.scriptoriumRepaired && state.dailyNeedId) return state.activeActivityId ? 'work' : 'house';
  if (state.schoolRelit && state.dailyEncroachment > 0) return state.activeActivityId ? 'work' : 'house';
  if (state.deskRepaired) return 'house';
  if (canRepairDesk(state)) return 'house';
  return 'work';
}

export function storyDialogue(state: GameState, language: Language) {
  const ar = language === 'ar';
  if (!state.started) return null;
  if (state.tutorialStep === 'inspect-manuscript') return {
    voice: 'researcher' as const,
    speaker: ar ? 'الباحث' : 'The researcher',
    text: ar ? 'لا أفهم كلماته، لكنه يشير إلى المخطوطة الممزقة.' : 'I cannot understand his words, but he is pointing toward the torn manuscript.',
    note: ar ? 'افحص المخطوطة لتبدأ.' : 'Inspect the manuscript to begin.', obscured: false,
  };
  if (state.tutorialStep === 'first-reward') return {
    voice: 'researcher' as const,
    speaker: ar ? 'الباحث' : 'The researcher',
    text: ar ? 'العتمة التهمت بعض الحروف. سأبدأ بتتبّع ما بقي.' : 'The Darkness has bitten letters from the page. I will begin by tracing what remains.',
    note: ar ? 'أكمل أول دورة عمل.' : 'Complete the first work cycle.', obscured: false,
  };
  if (state.tutorialStep === 'first-insight') return {
    voice: 'researcher' as const,
    speaker: ar ? 'الباحث' : 'The researcher',
    text: ar ? 'أنتج العمل معرفة. قد يعيد أول فهم كلمة من صوته.' : 'The work produced Knowledge. The first insight may restore one word of his voice.',
    note: ar ? 'افتح المعرفة وافهم «الحرف الأول».' : 'Open Knowledge and understand The First Letter.', obscured: false,
  };
  if (!hasSkill(state, 'first-letter')) return {
    voice: 'ghost' as const, speaker: ar ? '؟؟؟' : '???', text: ar ? 'ا— ــر... الـــ؟' : 'R—d… th—?',
    note: ar ? 'تبتلع العتمة معظم كلماته.' : 'The Darkness swallows most of his words.', obscured: true,
  };
  if (!hasSkill(state, 'word-roots')) return {
    voice: 'ghost' as const, speaker: ar ? '؟؟؟' : '???', text: ar ? 'اقرأ.' : 'Read.',
    note: ar ? 'كلمة واحدة نجت.' : 'One word survives.', obscured: false,
  };
  if (!hasSkill(state, 'grammar')) return {
    voice: 'ghost' as const, speaker: ar ? '؟؟؟' : '???', text: ar ? 'اقرأ المخطوطة، لا الغبار.' : 'Read the manuscript, not the dust.',
    note: ar ? 'تتصل الكلمات، لكن المتكلم ما زال مجهولاً.' : 'The words connect, but the speaker remains unknown.', obscured: false,
  };
  if (!state.ghostIdentityRevealed) return {
    voice: 'ghost' as const, speaker: ar ? 'الشبح المجهول' : 'The unknown ghost',
    text: ar ? 'جئت تطلب المعرفة؟ ممتاز. بدأت أخشى أن يكون الركام أشد فضولاً من الأحياء.' : 'You came seeking knowledge? Excellent. I was beginning to fear the rubble had more curiosity than the living.',
    note: ar ? 'جملة كاملة، ومعها سخرية خفيفة.' : 'A complete sentence—and a dry joke.', obscured: false,
  };
  if (!state.deskRepaired) return {
    voice: 'ghost' as const, speaker: ar ? 'الجاحظ' : 'Al-Jahiz',
    text: ar ? 'أبو عثمان عمرو بن بحر، وإن كنت تفضّل الاختصار: الجاحظ. والآن، هل ننقذ المكتب قبل أن يطالب الغبار بملكيته؟' : 'Abu Uthman Amr ibn Bahr—Al-Jahiz, if you prefer brevity. Now, shall we save the desk before the dust claims ownership?',
    note: ar ? 'ظهر توقيعه في هامش المخطوطة.' : 'His signature has appeared in the manuscript margin.', obscured: false,
  };
  if (!state.scriptoriumRepaired) return {
    voice: 'ghost' as const, speaker: ar ? 'الجاحظ' : 'Al-Jahiz',
    text: ar ? 'هذه ليست ليلة طويلة. إنها الجهل وقد صار له وزن. يعيش حين تبقى العقول والكتب والأفكار متباعدة. ولحسن الحظ، الكتب سيئة جداً في التزام الصمت بعد نسخها.' : 'This is no endless night. It is Ignorance given weight. It survives by keeping minds, books, and ideas apart. Fortunately, books are notoriously poor at staying quiet once copied.',
    note: ar ? 'دار النسخ هي مشروع الترميم التالي.' : 'The Scriptorium is the next restoration project.', obscured: false,
  };
  if (state.dailyNeedId) return {
    voice: 'ghost' as const, speaker: ar ? 'الجاحظ' : 'Al-Jahiz',
    text: ar ? 'مدرسة الشرق صامتة؛ أكل الجهل كلمات كرّاسها. فلنتعلّم ما ضاع، ثم نصنع نسخاً تكفي صفاً كاملاً. نسخة واحدة قد تكون صدفة؛ عشرون نسخة تبدأ مؤسسة.' : 'The eastern school is quiet; Ignorance has eaten the words from its primer. We recover what was lost, then make enough copies for a full class. One copy may be an accident; twenty begin an institution.',
    note: ar ? `صُنعت ${state.civicProgress.primersCopied} ووصلت ${state.civicProgress.primersDelivered} من ${EASTERN_SCHOOL_TARGET}.` : `${state.civicProgress.primersCopied} made and ${state.civicProgress.primersDelivered} of ${EASTERN_SCHOOL_TARGET} delivered.`, obscured: false,
  };
  return {
    voice: 'ghost' as const, speaker: ar ? 'الجاحظ' : 'Al-Jahiz',
    text: ar ? 'عاد صوت إلى المدرسة ومصباح إلى نافذتها. يبدو أن المعرفة تجيد السفر حين نعطيها نسخة جيدة.' : 'A voice has returned to the school, and a lamp to its window. Knowledge travels rather well when we give it a good copy.',
    note: ar ? 'بقي ترميم الدار عند ٩٥٪ من ظلام الحملة.' : 'The House remains secured at the 95% Campaign Darkness baseline.', obscured: false,
  };
}

/** Backward-compatible alias for tests and older callers. */
export const ghostDialogue = storyDialogue;

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function uniqueStrings(value: unknown, fallback: string[] = []) { return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string'))] : fallback; }

function stateFromRecord(value: Record<string, unknown>, now: number, sourceVersion: number = GAME_VERSION): GameState {
  const migratedFromV3 = sourceVersion === 3;
  const migratedFromQueue = sourceVersion <= 5;
  const initial = createInitialState(now, value.language === 'en' ? 'en' : 'ar');
  const xp = isRecord(value.xp) ? value.xp : {};
  const materials = isRecord(value.materials) ? value.materials : {};
  const storedItemCounts = isRecord(value.itemCounts) ? value.itemCounts : {};
  const storedMastery = isRecord(value.activityMasteryXp) ? value.activityMasteryXp : {};
  const storedCivic = isRecord(value.civicProgress) ? value.civicProgress : {};
  const storedDaily = isRecord(value.dailyDutyProgress) ? value.dailyDutyProgress : {};
  const skills = uniqueStrings(value.skills);
  const inventory = uniqueStrings(value.inventory, initial.inventory);
  const activeActivityId = typeof value.activeActivityId === 'string' && getActivity(value.activeActivityId) ? value.activeActivityId : null;
  const storedQueue = Array.isArray(value.workQueue)
    ? value.workQueue.flatMap((entry) => isRecord(entry) && typeof entry.activityId === 'string' && getActivity(entry.activityId) ? [{ activityId: entry.activityId }] : []).slice(0, 1)
    : [];
  const workQueue = storedQueue.length > 0 ? storedQueue : activeActivityId ? [{ activityId: activeActivityId }] : [];
  const deskRepaired = Boolean(value.deskRepaired);
  const scriptoriumRepaired = Boolean(value.scriptoriumRepaired);
  const prologueComplete = Boolean(value.prologueComplete);
  const storedStep = typeof value.tutorialStep === 'string' && tutorialSteps.has(value.tutorialStep as TutorialStep)
    ? value.tutorialStep as TutorialStep : null;
  const lightMilestones = migratedFromV3
    ? (deskRepaired ? ['keeper-desk'] : [])
    : uniqueStrings(value.lightMilestones).filter((id) => lightMilestoneWeights[id] !== undefined);
  if (scriptoriumRepaired && !lightMilestones.includes('scriptorium')) lightMilestones.push('scriptorium');
  const schoolRelit = Boolean(value.schoolRelit);
  if (schoolRelit && !lightMilestones.includes('eastern-school')) lightMilestones.push('eastern-school');
  const storedNeedStep = typeof value.dailyNeedStep === 'number' ? Math.min(3, Math.max(0, Math.floor(value.dailyNeedStep))) : 0;
  const dailyNeedId = !schoolRelit && scriptoriumRepaired ? 'eastern-school' as const : null;
  const dailyNeedStep = dailyNeedId ? storedNeedStep : 3;
  const legacyCopied = inventory.includes('primer-copy') ? 1 : 0;
  const dailyEncroachment = schoolRelit && typeof value.dailyEncroachment === 'number' ? Math.min(3, Math.max(0, Math.floor(value.dailyEncroachment))) : 0;

  const state: GameState = {
    ...initial,
    knowledge: typeof value.knowledge === 'number' && Number.isFinite(value.knowledge) ? Math.max(0, value.knowledge) : 0,
    materials: {
      timber: typeof materials.timber === 'number' ? Math.max(0, Math.floor(materials.timber)) : 0,
      stone: typeof materials.stone === 'number' ? Math.max(0, Math.floor(materials.stone)) : 0,
    },
    xp: {
      language: typeof xp.language === 'number' ? Math.max(0, xp.language) : 0,
      scribing: typeof xp.scribing === 'number' ? Math.max(0, xp.scribing) : 0,
      gathering: typeof xp.gathering === 'number' ? Math.max(0, xp.gathering) : migratedFromQueue && typeof xp.architecture === 'number' ? Math.max(0, xp.architecture) : 0,
      translation: typeof xp.translation === 'number' ? Math.max(0, xp.translation) : 0,
      mathematics: typeof xp.mathematics === 'number' ? Math.max(0, xp.mathematics) : 0,
      architecture: !migratedFromQueue && typeof xp.architecture === 'number' ? Math.max(0, xp.architecture) : 0,
    },
    activeActivityId: workQueue[0]?.activityId ?? null,
    workQueue,
    workTargetRemaining: !migratedFromQueue && typeof value.workTargetRemaining === 'number' ? Math.max(1, Math.floor(value.workTargetRemaining)) : null,
    activityProgressMs: typeof value.activityProgressMs === 'number' ? Math.max(0, value.activityProgressMs) : 0,
    lastUpdatedAt: typeof value.lastUpdatedAt === 'number' && Number.isFinite(value.lastUpdatedAt) ? value.lastUpdatedAt : now,
    skills,
    inventory,
    itemCounts: Object.fromEntries(Object.entries(storedItemCounts).flatMap(([id, count]) => typeof count === 'number' && Number.isFinite(count) && count > 0 ? [[id, Math.floor(count)]] : [])),
    activityMasteryXp: Object.fromEntries(Object.entries(storedMastery).flatMap(([id, amount]) => getActivity(id) && typeof amount === 'number' && Number.isFinite(amount) && amount >= 0 ? [[id, amount]] : [])),
    pinnedTaskIds: uniqueStrings(value.pinnedTaskIds, initial.pinnedTaskIds).slice(0, PINNED_TASK_CAPACITY),
    lightMilestones,
    language: value.language === 'en' ? 'en' : 'ar',
    started: Boolean(value.started),
    comicSeen: Boolean(value.comicSeen),
    ghostEncountered: Boolean(value.ghostEncountered),
    ghostIdentityRevealed: Boolean(value.ghostIdentityRevealed) || skills.includes('eloquence'),
    deskRepaired,
    scriptoriumRepaired,
    ignoranceRevealed: Boolean(value.ignoranceRevealed),
    prologueComplete,
    offlineExplained: Boolean(value.offlineExplained),
    tutorialStep: migratedFromV3 ? (prologueComplete ? 'complete' : Boolean(value.started) ? 'guided' : 'comic') : (storedStep ?? initial.tutorialStep),
    tutorialSkipped: migratedFromV3 ? Boolean(value.started) : Boolean(value.tutorialSkipped),
    lastReward: isRecord(value.lastReward)
      && typeof value.lastReward.activityId === 'string'
      && typeof value.lastReward.knowledge === 'number'
      && typeof value.lastReward.xp === 'number'
      && typeof value.lastReward.timber === 'number'
      && typeof value.lastReward.stone === 'number'
      && typeof value.lastReward.repetitions === 'number'
      && typeof value.lastReward.at === 'number'
      ? { ...value.lastReward, masteryXp: typeof value.lastReward.masteryXp === 'number' ? value.lastReward.masteryXp : 0 } as RewardEvent : null,
    dailyNeedId,
    dailyNeedStep,
    dailyEncroachment,
    dailyNeedGeneratedOn: typeof value.dailyNeedGeneratedOn === 'string' ? value.dailyNeedGeneratedOn : null,
    lastDailyResolvedOn: typeof value.lastDailyResolvedOn === 'string' ? value.lastDailyResolvedOn : null,
    schoolRelit,
    civicProgress: {
      easternSchoolDeciphered: schoolRelit || Boolean(storedCivic.easternSchoolDeciphered) || storedNeedStep >= 1,
      primersCopied: schoolRelit ? EASTERN_SCHOOL_TARGET : typeof storedCivic.primersCopied === 'number' ? Math.min(EASTERN_SCHOOL_TARGET, Math.max(0, Math.floor(storedCivic.primersCopied))) : storedNeedStep >= 2 ? legacyCopied : 0,
      primersDelivered: schoolRelit ? EASTERN_SCHOOL_TARGET : typeof storedCivic.primersDelivered === 'number' ? Math.min(EASTERN_SCHOOL_TARGET, Math.max(0, Math.floor(storedCivic.primersDelivered))) : 0,
    },
    dailyDutyProgress: {
      learn: typeof storedDaily.learn === 'number' ? Math.min(DAILY_DUTY_TARGETS.learn, Math.max(0, storedDaily.learn)) : 0,
      make: typeof storedDaily.make === 'number' ? Math.min(DAILY_DUTY_TARGETS.make, Math.max(0, storedDaily.make)) : 0,
      serve: typeof storedDaily.serve === 'number' ? Math.min(DAILY_DUTY_TARGETS.serve, Math.max(0, storedDaily.serve)) : 0,
    },
  };
  if (legacyCopied > 0 && !state.itemCounts['primer-copy']) state.itemCounts['primer-copy'] = legacyCopied;
  beginDailyDuties(state, now);
  return state;
}

function sanitizeState(value: unknown, now: number): GameState | null {
  if (!isRecord(value) || value.version !== GAME_VERSION) return null;
  return stateFromRecord(value, now, GAME_VERSION);
}

function migrateEarlierState(value: unknown, now: number): GameState | null {
  if (!isRecord(value)) return null;
  if (value.version === 5 || value.version === 4 || value.version === 3) return stateFromRecord(value, now, value.version);
  if (value.version === 1 || value.version === 2) return createInitialState(now, value.language === 'en' ? 'en' : 'ar');
  return null;
}

export function serializeGame(state: GameState) { return JSON.stringify(state); }

export function loadGame(raw: string | null, now = Date.now()) {
  if (!raw) return { state: createInitialState(now), summary: null as AdvanceSummary | null, migrated: false, fromVersion: null as number | null, isNew: true };
  try {
    const parsed: unknown = JSON.parse(raw);
    const current = sanitizeState(parsed, now);
    const earlier = current ? null : migrateEarlierState(parsed, now);
    const loaded = current ?? earlier;
    if (!loaded) return { state: createInitialState(now), summary: null, migrated: false, fromVersion: null, isNew: true };
    const advanced = advanceGame(loaded, now);
    const fromVersion = earlier && isRecord(parsed) && typeof parsed.version === 'number' ? parsed.version : null;
    return { state: advanced.state, summary: advanced.summary, migrated: Boolean(earlier), fromVersion, isNew: false };
  } catch {
    return { state: createInitialState(now), summary: null, migrated: false, fromVersion: null, isNew: true };
  }
}
