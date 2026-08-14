export type Discipline = 'language' | 'translation' | 'mathematics' | 'architecture';
export type Language = 'en' | 'ar';
export type LocalizedText = Record<Language, string>;
export type Material = 'timber' | 'stone';

export const GAME_VERSION = 3 as const;
export const SAVE_KEY = 'house-of-wisdom-v03';
export const V2_SAVE_KEY = 'house-of-wisdom-v02';
export const LEGACY_SAVE_KEY = 'house-of-wisdom-v01';
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1_000;

export type RewardEvent = {
  activityId: string;
  knowledge: number;
  xp: number;
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
  activityProgressMs: number;
  lastUpdatedAt: number;
  skills: string[];
  inventory: string[];
  language: Language;
  started: boolean;
  comicSeen: boolean;
  ghostEncountered: boolean;
  ghostIdentityRevealed: boolean;
  deskRepaired: boolean;
  ignoranceRevealed: boolean;
  prologueComplete: boolean;
  offlineExplained: boolean;
  lastReward: RewardEvent | null;
};

export type Activity = {
  id: string;
  kind: 'study' | 'salvage';
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
};

export const activities: Activity[] = [
  {
    id: 'trace-letters',
    kind: 'study',
    discipline: 'language',
    name: { en: 'Trace the Broken Letters', ar: 'تتبّع الحروف المكسورة' },
    description: {
      en: 'Compare the surviving marks in the torn manuscript.',
      ar: 'قارن العلامات الباقية في المخطوطة الممزقة.',
    },
    durationMs: 6_000,
    knowledge: 1,
    xp: 4,
    minLevel: 1,
  },
  {
    id: 'restore-word',
    kind: 'study',
    discipline: 'language',
    name: { en: 'Restore a Missing Word', ar: 'استعد كلمة مفقودة' },
    description: {
      en: 'Use roots and context to recover one complete word.',
      ar: 'استخدم الجذور والسياق لاستعادة كلمة كاملة.',
    },
    durationMs: 9_000,
    knowledge: 2,
    xp: 6,
    minLevel: 2,
    requiresSkills: ['first-letter'],
  },
  {
    id: 'copy-phrase',
    kind: 'study',
    discipline: 'language',
    name: { en: 'Rebuild a Broken Phrase', ar: 'أعد بناء عبارة مكسورة' },
    description: {
      en: 'Join words into a sentence the ghost can recognize.',
      ar: 'صِل الكلمات في جملة يستطيع الشبح تمييزها.',
    },
    durationMs: 13_000,
    knowledge: 4,
    xp: 8,
    minLevel: 3,
    requiresSkills: ['word-roots'],
  },
  {
    id: 'study-eloquence',
    kind: 'study',
    discipline: 'language',
    name: { en: 'Listen for Meaning', ar: 'أنصت إلى المعنى' },
    description: {
      en: 'Recover tone, intent, and the humour hidden between words.',
      ar: 'استعد النبرة والقصد والفكاهة المختبئة بين الكلمات.',
    },
    durationMs: 17_000,
    knowledge: 6,
    xp: 10,
    minLevel: 4,
    requiresSkills: ['grammar'],
  },
  {
    id: 'salvage-timber',
    kind: 'salvage',
    discipline: 'architecture',
    name: { en: 'Recover Fallen Timber', ar: 'استخرج الخشب الساقط' },
    description: {
      en: 'Sort sound beams from splintered remains.',
      ar: 'افرز العوارض السليمة من البقايا المتكسرة.',
    },
    durationMs: 8_000,
    knowledge: 0.2,
    xp: 2,
    timber: 1,
    minLevel: 1,
    requiresSkills: ['eloquence'],
    requiresIdentity: true,
  },
  {
    id: 'sort-stone',
    kind: 'salvage',
    discipline: 'architecture',
    name: { en: 'Sort Usable Stone', ar: 'افرز الحجارة الصالحة' },
    description: {
      en: 'Find blocks strong enough to brace the Keeper’s Desk.',
      ar: 'اعثر على حجارة تصلح لتثبيت مكتب القيّم.',
    },
    durationMs: 10_000,
    knowledge: 0.2,
    xp: 2,
    stone: 1,
    minLevel: 1,
    requiresSkills: ['eloquence'],
    requiresIdentity: true,
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
    id: 'first-letter',
    cost: 8,
    kind: 'language',
    eyebrow: { en: 'Script', ar: 'الخط' },
    name: { en: 'The First Letter', ar: 'الحرف الأول' },
    description: {
      en: 'Separate one surviving letter from the Shadow’s noise. The ghost’s first word becomes clear.',
      ar: 'ميّز حرفاً باقياً من ضجيج الظل. تتضح أول كلمة يقولها الشبح.',
    },
    minLevel: 2,
  },
  {
    id: 'word-roots',
    cost: 20,
    kind: 'language',
    eyebrow: { en: 'Spelling & roots', ar: 'الإملاء والجذور' },
    name: { en: 'Roots beneath the Dust', ar: 'جذور تحت الغبار' },
    description: {
      en: 'Recognize how related words preserve meaning even when their letters are damaged.',
      ar: 'تعرّف كيف تحفظ الكلمات المترابطة معناها حتى حين تتلف حروفها.',
    },
    minLevel: 3,
    requiresSkills: ['first-letter'],
  },
  {
    id: 'grammar',
    cost: 35,
    kind: 'language',
    eyebrow: { en: 'Grammar', ar: 'النحو' },
    name: { en: 'Grammar Restores Meaning', ar: 'النحو يعيد المعنى' },
    description: {
      en: 'Reconnect subject, action, and intent. The ghost can finally speak a complete sentence.',
      ar: 'أعد وصل الفاعل والفعل والقصد. يستطيع الشبح أخيراً قول جملة كاملة.',
    },
    minLevel: 4,
    requiresSkills: ['word-roots'],
  },
  {
    id: 'eloquence',
    cost: 55,
    kind: 'language',
    eyebrow: { en: 'Rhetoric', ar: 'البلاغة' },
    name: { en: 'The Voice behind the Words', ar: 'الصوت خلف الكلمات' },
    description: {
      en: 'Recover tone, personality, and the signature hidden in the manuscript. The ghost’s identity is revealed.',
      ar: 'استعد النبرة والشخصية والتوقيع المخفي في المخطوطة. تنكشف هوية الشبح.',
    },
    minLevel: 5,
    requiresSkills: ['grammar'],
  },
  {
    id: 'poetry',
    cost: null,
    kind: 'future',
    eyebrow: { en: 'Future branch', ar: 'فرع قادم' },
    name: { en: 'Poetry & Metre', ar: 'الشعر والوزن' },
    description: {
      en: 'Language remembered through rhythm, image, and public memory.',
      ar: 'لغة تحفظها الأوزان والصور وذاكرة الناس.',
    },
    minLevel: 1,
    requiresSkills: ['eloquence'],
  },
  {
    id: 'translation',
    cost: null,
    kind: 'future',
    eyebrow: { en: 'Future branch', ar: 'فرع قادم' },
    name: { en: 'Translation', ar: 'الترجمة' },
    description: {
      en: 'Carry ideas between Arabic, Greek, Syriac, Persian, and other scholarly traditions.',
      ar: 'انقل الأفكار بين العربية واليونانية والسريانية والفارسية وغيرها من التقاليد العلمية.',
    },
    minLevel: 1,
    requiresSkills: ['eloquence'],
  },
];

const levelThresholds = [0, 8, 28, 60, 105, 170, 260, 380, 530, 720, 950];

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

export function hasSkill(state: GameState, id: string) {
  return state.skills.includes(id);
}

export function hasItem(state: GameState, id: string) {
  return state.inventory.includes(id);
}

export function createInitialState(now = Date.now(), language: Language = 'ar'): GameState {
  return {
    version: GAME_VERSION,
    knowledge: 0,
    materials: { timber: 0, stone: 0 },
    xp: { language: 0, translation: 0, mathematics: 0, architecture: 0 },
    activeActivityId: null,
    activityProgressMs: 0,
    lastUpdatedAt: now,
    skills: [],
    inventory: ['torn-manuscript', 'worn-hammer'],
    language,
    started: false,
    comicSeen: false,
    ghostEncountered: false,
    ghostIdentityRevealed: false,
    deskRepaired: false,
    ignoranceRevealed: false,
    prologueComplete: false,
    offlineExplained: false,
    lastReward: null,
  };
}

export function getActivity(id: string | null) {
  return activities.find((activity) => activity.id === id) ?? null;
}

export function activityAvailable(state: GameState, activity: Activity) {
  return levelForXp(state.xp[activity.discipline]) >= activity.minLevel
    && (!activity.requiresSkills || activity.requiresSkills.every((id) => hasSkill(state, id)))
    && (!activity.requiresIdentity || state.ghostIdentityRevealed);
}

function roundResource(value: number) {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

export function knowledgeMultiplier(state: GameState, discipline: Discipline) {
  let multiplier = 1;
  if (state.deskRepaired && discipline === 'language') multiplier += 0.1;
  return multiplier;
}

export type AdvanceSummary = {
  elapsedMs: number;
  appliedElapsedMs: number;
  cappedMs: number;
  knowledge: number;
  xp: number;
  timber: number;
  stone: number;
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
    timber: 0,
    stone: 0,
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
      const timber = repetitions * (activity.timber ?? 0);
      const stone = repetitions * (activity.stone ?? 0);
      state.knowledge = roundResource(state.knowledge + knowledge);
      state.xp[activity.discipline] += xp;
      state.materials.timber += timber;
      state.materials.stone += stone;
      state.lastReward = { activityId: activity.id, knowledge, xp, timber, stone, repetitions, at: now };
      Object.assign(summary, { knowledge, xp, timber, stone, completions: repetitions });
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
  state.comicSeen = true;
  state.ghostEncountered = true;
  state.activeActivityId = 'trace-letters';
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

export function skillRequirementsMet(state: GameState, skill: LanguageSkill) {
  return levelForXp(state.xp.language) >= skill.minLevel
    && (!skill.requiresSkills || skill.requiresSkills.every((id) => hasSkill(state, id)));
}

export function skillAvailable(state: GameState, skill: LanguageSkill) {
  return skill.kind !== 'future'
    && skill.cost !== null
    && !hasSkill(state, skill.id)
    && skillRequirementsMet(state, skill);
}

export function buyLanguageSkill(input: GameState, id: string, now = Date.now()) {
  const { state } = advanceGame(input, now);
  const skill = languageSkills.find((candidate) => candidate.id === id);
  if (!skill || !skillAvailable(state, skill) || skill.cost === null || state.knowledge + Number.EPSILON < skill.cost) return state;

  state.knowledge = roundResource(state.knowledge - skill.cost);
  state.skills.push(skill.id);
  if (skill.id === 'first-letter' && !hasItem(state, 'first-word')) state.inventory.push('first-word');
  if (skill.id === 'grammar' && !hasItem(state, 'restored-sentence')) state.inventory.push('restored-sentence');
  if (skill.id === 'eloquence') {
    state.ghostIdentityRevealed = true;
    if (!hasItem(state, 'al-jahiz-signature')) state.inventory.push('al-jahiz-signature');
  }
  return state;
}

export const deskRequirements = { knowledge: 30, timber: 5, stone: 4 } as const;

export function canRepairDesk(state: GameState) {
  return state.ghostIdentityRevealed
    && !state.deskRepaired
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
  state.activeActivityId = 'study-eloquence';
  state.activityProgressMs = 0;
  state.lastUpdatedAt = now;
  if (!hasItem(state, 'keeper-desk')) state.inventory.push('keeper-desk');
  return state;
}

export function setLanguage(input: GameState, language: Language, now = Date.now()) {
  const { state } = advanceGame(input, now);
  state.language = language;
  return state;
}

export function acknowledgeOffline(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  state.offlineExplained = true;
  return state;
}

export function houseStage(state: GameState) {
  return state.deskRepaired ? 1 : 0;
}

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
  if (!state.started) return ar ? 'ادخل بيت الحكمة المهجور' : 'Enter the abandoned House of Wisdom';
  if (!hasSkill(state, 'first-letter')) return ar ? 'استعد الحرف الأول' : 'Recover the first letter';
  if (!hasSkill(state, 'word-roots')) return ar ? 'اعثر على الجذور تحت الغبار' : 'Find the roots beneath the dust';
  if (!hasSkill(state, 'grammar')) return ar ? 'أعد المعنى إلى كلام الشبح' : 'Restore meaning to the ghost’s speech';
  if (!state.ghostIdentityRevealed) return ar ? 'اكشف الصوت خلف الكلمات' : 'Reveal the voice behind the words';
  if (state.deskRepaired) return ar ? 'اكتشف لماذا أُسكتت الدار' : 'Discover why the House was silenced';
  if (state.materials.timber < deskRequirements.timber || state.materials.stone < deskRequirements.stone) {
    return ar ? 'اجمع الخشب والحجر لمكتب القيّم' : 'Gather timber and stone for the Keeper’s Desk';
  }
  if (state.knowledge < deskRequirements.knowledge) return ar ? 'اجمع المعرفة لإتمام الترميم' : 'Gather Knowledge to complete the restoration';
  if (!state.deskRepaired) return ar ? 'رمّم مكتب القيّم' : 'Restore the Keeper’s Desk';
  return ar ? 'اكتشف لماذا أُسكتت الدار' : 'Discover why the House was silenced';
}

export function ghostDialogue(state: GameState, language: Language) {
  const ar = language === 'ar';
  if (!state.started) return null;
  if (!hasSkill(state, 'first-letter')) {
    return {
      speaker: ar ? '؟؟؟' : '???',
      text: ar ? 'ا— ــر... الـــ؟' : 'R—d… th—?',
      note: ar ? 'تبتلع العتمة معظم كلماته.' : 'The darkness swallows most of his words.',
      obscured: true,
    };
  }
  if (!hasSkill(state, 'word-roots')) {
    return {
      speaker: ar ? '؟؟؟' : '???',
      text: ar ? 'اقرأ.' : 'Read.',
      note: ar ? 'كلمة واحدة نجت.' : 'One word survives.',
      obscured: false,
    };
  }
  if (!hasSkill(state, 'grammar')) {
    return {
      speaker: ar ? '؟؟؟' : '???',
      text: ar ? 'اقرأ المخطوطة، لا الغبار.' : 'Read the manuscript, not the dust.',
      note: ar ? 'تتصل الكلمات، لكن المتكلم ما زال مجهولاً.' : 'The words connect, but the speaker remains unknown.',
      obscured: false,
    };
  }
  if (!state.ghostIdentityRevealed) {
    return {
      speaker: ar ? 'الشبح المجهول' : 'The unknown ghost',
      text: ar
        ? 'جئت تطلب المعرفة؟ ممتاز. بدأت أخشى أن يكون الركام أشد فضولاً من الأحياء.'
        : 'You came seeking knowledge? Excellent. I was beginning to fear the rubble had more curiosity than the living.',
      note: ar ? 'جملة كاملة، ومعها سخرية خفيفة.' : 'A complete sentence—and a dry joke.',
      obscured: false,
    };
  }
  if (!state.deskRepaired) {
    return {
      speaker: ar ? 'الجاحظ' : 'Al-Jahiz',
      text: ar
        ? 'أبو عثمان عمرو بن بحر، وإن كنت تفضّل الاختصار: الجاحظ. الآن، هل ننقذ المكتب قبل أن يطالب الغبار بملكيته؟'
        : 'Abu Uthman Amr ibn Bahr—Al-Jahiz, if you prefer brevity. Now, shall we save the desk before the dust claims ownership?',
      note: ar ? 'ظهر توقيعه في هامش المخطوطة.' : 'His signature has appeared in the manuscript margin.',
      obscured: false,
    };
  }
  return {
    speaker: ar ? 'الجاحظ' : 'Al-Jahiz',
    text: ar
      ? 'أحسنت. والآن انظر إلى العتمة. هذه ليست ظلال الليل؛ إنها الجهل، وقد تعلّم كيف يمحو ما لا يستطيع مجادلته.'
      : 'Well done. Now look at the darkness. That is not night—it is Ignorance, and it has learned to erase what it cannot argue with.',
    note: ar ? 'اشتعلت ثلاثة مصابيح في الحي.' : 'Three lights answer in the surrounding district.',
    obscured: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeState(value: unknown, now: number): GameState | null {
  if (!isRecord(value) || value.version !== GAME_VERSION) return null;
  const initial = createInitialState(now, value.language === 'en' ? 'en' : 'ar');
  const xp = isRecord(value.xp) ? value.xp : {};
  const materials = isRecord(value.materials) ? value.materials : {};
  const skills = Array.isArray(value.skills) ? [...new Set(value.skills.filter((item): item is string => typeof item === 'string'))] : [];
  const inventory = Array.isArray(value.inventory) ? [...new Set(value.inventory.filter((item): item is string => typeof item === 'string'))] : initial.inventory;
  const activeActivityId = typeof value.activeActivityId === 'string' && getActivity(value.activeActivityId) ? value.activeActivityId : null;

  return {
    ...initial,
    knowledge: typeof value.knowledge === 'number' && Number.isFinite(value.knowledge) ? Math.max(0, value.knowledge) : 0,
    materials: {
      timber: typeof materials.timber === 'number' ? Math.max(0, Math.floor(materials.timber)) : 0,
      stone: typeof materials.stone === 'number' ? Math.max(0, Math.floor(materials.stone)) : 0,
    },
    xp: {
      language: typeof xp.language === 'number' ? Math.max(0, xp.language) : 0,
      translation: typeof xp.translation === 'number' ? Math.max(0, xp.translation) : 0,
      mathematics: typeof xp.mathematics === 'number' ? Math.max(0, xp.mathematics) : 0,
      architecture: typeof xp.architecture === 'number' ? Math.max(0, xp.architecture) : 0,
    },
    activeActivityId,
    activityProgressMs: typeof value.activityProgressMs === 'number' ? Math.max(0, value.activityProgressMs) : 0,
    lastUpdatedAt: typeof value.lastUpdatedAt === 'number' && Number.isFinite(value.lastUpdatedAt) ? value.lastUpdatedAt : now,
    skills,
    inventory,
    language: value.language === 'en' ? 'en' : 'ar',
    started: Boolean(value.started),
    comicSeen: Boolean(value.comicSeen),
    ghostEncountered: Boolean(value.ghostEncountered),
    ghostIdentityRevealed: Boolean(value.ghostIdentityRevealed) || skills.includes('eloquence'),
    deskRepaired: Boolean(value.deskRepaired),
    ignoranceRevealed: Boolean(value.ignoranceRevealed),
    prologueComplete: Boolean(value.prologueComplete),
    offlineExplained: Boolean(value.offlineExplained),
    lastReward: isRecord(value.lastReward)
      && typeof value.lastReward.activityId === 'string'
      && typeof value.lastReward.knowledge === 'number'
      && typeof value.lastReward.xp === 'number'
      && typeof value.lastReward.timber === 'number'
      && typeof value.lastReward.stone === 'number'
      && typeof value.lastReward.repetitions === 'number'
      && typeof value.lastReward.at === 'number'
      ? value.lastReward as RewardEvent
      : null,
  };
}

function migrateEarlierState(value: unknown, now: number): GameState | null {
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) return null;
  return createInitialState(now, value.language === 'en' ? 'en' : 'ar');
}

export function serializeGame(state: GameState) {
  return JSON.stringify(state);
}

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
