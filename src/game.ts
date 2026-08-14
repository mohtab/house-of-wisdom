export type Discipline = 'language' | 'translation' | 'mathematics' | 'architecture';
export type Language = 'en' | 'ar';
export type LocalizedText = Record<Language, string>;
export type Material = 'timber' | 'stone';
export type TutorialStep = 'comic' | 'inspect-manuscript' | 'first-reward' | 'first-insight' | 'guided' | 'complete';
export type Destination = 'house' | 'work' | 'knowledge' | 'satchel' | 'memories';

export const GAME_VERSION = 4 as const;
export const SAVE_KEY = 'house-of-wisdom-v031';
export const V3_SAVE_KEY = 'house-of-wisdom-v03';
export const V2_SAVE_KEY = 'house-of-wisdom-v02';
export const LEGACY_SAVE_KEY = 'house-of-wisdom-v01';
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1_000;

export const lightMilestoneWeights: Record<string, number> = {
  'keeper-desk': 1,
};

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
  lightMilestones: string[];
  language: Language;
  started: boolean;
  comicSeen: boolean;
  ghostEncountered: boolean;
  ghostIdentityRevealed: boolean;
  deskRepaired: boolean;
  ignoranceRevealed: boolean;
  prologueComplete: boolean;
  offlineExplained: boolean;
  tutorialStep: TutorialStep;
  tutorialSkipped: boolean;
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
    id: 'trace-letters', kind: 'study', discipline: 'language',
    name: { en: 'Trace the Broken Letters', ar: 'تتبّع الحروف المكسورة' },
    description: { en: 'Compare the surviving marks in the torn manuscript.', ar: 'قارن العلامات الباقية في المخطوطة الممزقة.' },
    durationMs: 6_000, knowledge: 1, xp: 4, minLevel: 1,
  },
  {
    id: 'restore-word', kind: 'study', discipline: 'language',
    name: { en: 'Restore a Missing Word', ar: 'استعد كلمة مفقودة' },
    description: { en: 'Use roots and context to recover one complete word.', ar: 'استخدم الجذور والسياق لاستعادة كلمة كاملة.' },
    durationMs: 9_000, knowledge: 2, xp: 6, minLevel: 2, requiresSkills: ['first-letter'],
  },
  {
    id: 'copy-phrase', kind: 'study', discipline: 'language',
    name: { en: 'Rebuild a Broken Phrase', ar: 'أعد بناء عبارة مكسورة' },
    description: { en: 'Join words into a sentence the ghost can recognize.', ar: 'صِل الكلمات في جملة يستطيع الشبح تمييزها.' },
    durationMs: 13_000, knowledge: 4, xp: 8, minLevel: 3, requiresSkills: ['word-roots'],
  },
  {
    id: 'study-eloquence', kind: 'study', discipline: 'language',
    name: { en: 'Listen for Meaning', ar: 'أنصت إلى المعنى' },
    description: { en: 'Recover tone, intent, and the humour hidden between words.', ar: 'استعد النبرة والقصد والفكاهة المختبئة بين الكلمات.' },
    durationMs: 17_000, knowledge: 6, xp: 10, minLevel: 4, requiresSkills: ['grammar'],
  },
  {
    id: 'salvage-timber', kind: 'salvage', discipline: 'architecture',
    name: { en: 'Recover Fallen Timber', ar: 'استخرج الخشب الساقط' },
    description: { en: 'Sort sound beams from splintered remains.', ar: 'افرز العوارض السليمة من البقايا المتكسرة.' },
    durationMs: 8_000, knowledge: 0.2, xp: 2, timber: 1, minLevel: 1,
    requiresSkills: ['eloquence'], requiresIdentity: true,
  },
  {
    id: 'sort-stone', kind: 'salvage', discipline: 'architecture',
    name: { en: 'Sort Usable Stone', ar: 'افرز الحجارة الصالحة' },
    description: { en: 'Find blocks strong enough to brace the Keeper’s Desk.', ar: 'اعثر على حجارة تصلح لتثبيت مكتب القيّم.' },
    durationMs: 10_000, knowledge: 0.2, xp: 2, stone: 1, minLevel: 1,
    requiresSkills: ['eloquence'], requiresIdentity: true,
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
const tutorialSteps = new Set<TutorialStep>(['comic', 'inspect-manuscript', 'first-reward', 'first-insight', 'guided', 'complete']);

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

export function hasSkill(state: GameState, id: string) { return state.skills.includes(id); }
export function hasItem(state: GameState, id: string) { return state.inventory.includes(id); }

export function darknessPercent(state: GameState) {
  const restored = state.lightMilestones.reduce((total, id) => total + (lightMilestoneWeights[id] ?? 0), 0);
  return Math.max(0, Math.round((100 - restored) * 10) / 10);
}

function addLightMilestone(state: GameState, id: string) {
  if (lightMilestoneWeights[id] !== undefined && !state.lightMilestones.includes(id)) state.lightMilestones.push(id);
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
    lightMilestones: [],
    language,
    started: false,
    comicSeen: false,
    ghostEncountered: false,
    ghostIdentityRevealed: false,
    deskRepaired: false,
    ignoranceRevealed: false,
    prologueComplete: false,
    offlineExplained: false,
    tutorialStep: 'comic',
    tutorialSkipped: false,
    lastReward: null,
  };
}

export function getActivity(id: string | null) { return activities.find((activity) => activity.id === id) ?? null; }

export function activityAvailable(state: GameState, activity: Activity) {
  return levelForXp(state.xp[activity.discipline]) >= activity.minLevel
    && (!activity.requiresSkills || activity.requiresSkills.every((id) => hasSkill(state, id)))
    && (!activity.requiresIdentity || state.ghostIdentityRevealed);
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
    elapsedMs, appliedElapsedMs, cappedMs: elapsedMs - appliedElapsedMs,
    knowledge: 0, xp: 0, timber: 0, stone: 0, completions: 0, activityId: activity?.id ?? null,
  };

  if (activity && activityAvailable(state, activity)) {
    const totalProgress = state.activityProgressMs + appliedElapsedMs;
    const repetitions = Math.floor(totalProgress / activity.durationMs);
    state.activityProgressMs = totalProgress % activity.durationMs;
    if (repetitions > 0) {
      const firstDiscovery = state.tutorialStep === 'first-reward' && activity.id === 'trace-letters';
      const knowledge = roundResource(repetitions * activity.knowledge * knowledgeMultiplier(state, activity.discipline) + (firstDiscovery ? 7 : 0));
      const xp = repetitions * activity.xp + (firstDiscovery ? 4 : 0);
      const timber = repetitions * (activity.timber ?? 0);
      const stone = repetitions * (activity.stone ?? 0);
      state.knowledge = roundResource(state.knowledge + knowledge);
      state.xp[activity.discipline] += xp;
      state.materials.timber += timber;
      state.materials.stone += stone;
      state.lastReward = { activityId: activity.id, knowledge, xp, timber, stone, repetitions, at: now };
      Object.assign(summary, { knowledge, xp, timber, stone, completions: repetitions });
      if (state.tutorialStep === 'first-reward') state.tutorialStep = 'first-insight';
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
  if (total >= activity.durationMs) return { durationMs: activity.durationMs, elapsedMs: activity.durationMs, remainingMs: 0, percent: 100 };
  return { durationMs: activity.durationMs, elapsedMs: total, remainingMs: activity.durationMs - total, percent: (total / activity.durationMs) * 100 };
}

export function startGame(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (state.started) return state;
  state.started = true;
  state.comicSeen = true;
  state.ghostEncountered = true;
  state.activeActivityId = null;
  state.activityProgressMs = 0;
  state.lastUpdatedAt = now;
  state.tutorialStep = 'inspect-manuscript';
  return state;
}

export function inspectManuscript(input: GameState, now = Date.now()) {
  const { state } = advanceGame(input, now);
  if (!state.started || state.tutorialStep !== 'inspect-manuscript') return state;
  state.activeActivityId = 'trace-letters';
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
  advanced.activityProgressMs = 0;
  advanced.lastUpdatedAt = now;
  return advanced;
}

export function selectActivity(input: GameState, id: string, now = Date.now()) {
  const { state } = advanceGame(input, now);
  const activity = getActivity(id);
  if (!activity || !activityAvailable(state, activity) || state.activeActivityId === id) return state;
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
  state.activeActivityId = 'study-eloquence';
  state.activityProgressMs = 0;
  state.lastUpdatedAt = now;
  addLightMilestone(state, 'keeper-desk');
  if (!hasItem(state, 'keeper-desk')) state.inventory.push('keeper-desk');
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

export function houseStage(state: GameState) { return state.deskRepaired ? 1 : 0; }

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
  if (state.deskRepaired) return ar ? 'تعلّم كيف تنقل المعرفة النور إلى بغداد' : 'Learn how circulating knowledge can relight Baghdad';
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
  return ar ? 'انشر المعرفة لتدفع الجهل عن المدينة' : 'Circulate knowledge to push Ignorance from the city';
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
  if (state.deskRepaired) return 'memories';
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
  return {
    voice: 'ghost' as const, speaker: ar ? 'الجاحظ' : 'Al-Jahiz',
    text: ar ? 'هذه ليست ليلة طويلة. إنها الجهل وقد صار له وزن. يعيش حين تبقى العقول والكتب والأفكار متباعدة. ولحسن الحظ، الكتب سيئة جداً في التزام الصمت بعد نسخها.' : 'This is no endless night. It is Ignorance given weight. It survives by keeping minds, books, and ideas apart. Fortunately, books are notoriously poor at staying quiet once copied.',
    note: ar ? 'أجاب مصباح بعيد. تراجع ظلام بغداد إلى ٩٩٪.' : 'One distant lamp answers. Baghdad’s Darkness falls to 99%.', obscured: false,
  };
}

/** Backward-compatible alias for tests and older callers. */
export const ghostDialogue = storyDialogue;

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function uniqueStrings(value: unknown, fallback: string[] = []) { return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string'))] : fallback; }

function stateFromRecord(value: Record<string, unknown>, now: number, migratedFromV3 = false): GameState {
  const initial = createInitialState(now, value.language === 'en' ? 'en' : 'ar');
  const xp = isRecord(value.xp) ? value.xp : {};
  const materials = isRecord(value.materials) ? value.materials : {};
  const skills = uniqueStrings(value.skills);
  const inventory = uniqueStrings(value.inventory, initial.inventory);
  const activeActivityId = typeof value.activeActivityId === 'string' && getActivity(value.activeActivityId) ? value.activeActivityId : null;
  const deskRepaired = Boolean(value.deskRepaired);
  const prologueComplete = Boolean(value.prologueComplete);
  const storedStep = typeof value.tutorialStep === 'string' && tutorialSteps.has(value.tutorialStep as TutorialStep)
    ? value.tutorialStep as TutorialStep : null;
  const lightMilestones = migratedFromV3
    ? (deskRepaired ? ['keeper-desk'] : [])
    : uniqueStrings(value.lightMilestones).filter((id) => lightMilestoneWeights[id] !== undefined);

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
    lightMilestones,
    language: value.language === 'en' ? 'en' : 'ar',
    started: Boolean(value.started),
    comicSeen: Boolean(value.comicSeen),
    ghostEncountered: Boolean(value.ghostEncountered),
    ghostIdentityRevealed: Boolean(value.ghostIdentityRevealed) || skills.includes('eloquence'),
    deskRepaired,
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
      ? value.lastReward as RewardEvent : null,
  };
}

function sanitizeState(value: unknown, now: number): GameState | null {
  if (!isRecord(value) || value.version !== GAME_VERSION) return null;
  return stateFromRecord(value, now);
}

function migrateEarlierState(value: unknown, now: number): GameState | null {
  if (!isRecord(value)) return null;
  if (value.version === 3) return stateFromRecord(value, now, true);
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
