import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  LEGACY_SAVE_KEY,
  SAVE_KEY,
  V2_SAVE_KEY,
  acknowledgeOffline,
  activities,
  activityAvailable,
  activityTiming,
  advanceGame,
  buyLanguageSkill,
  canRepairDesk,
  createInitialState,
  deskRequirements,
  getActivity,
  ghostDialogue,
  hasItem,
  hasSkill,
  houseStage,
  knowledgeMultiplier,
  languageSkills,
  levelProgress,
  loadGame,
  objective,
  repairKeeperDesk,
  selectActivity,
  serializeGame,
  setLanguage,
  skillAvailable,
  skillRequirementsMet,
  startGame,
  storyProgress,
  type Activity,
  type AdvanceSummary,
  type GameState,
  type Language,
  type LanguageSkill,
} from './game';

type Tab = 'house' | 'study' | 'skills' | 'inventory' | 'journal';

const ui = {
  en: {
    house: 'House', study: 'Study', skills: 'Language', inventory: 'Inventory', journal: 'Journal',
    knowledge: 'Knowledge', timber: 'Timber', stone: 'Stone', objective: 'Current thread',
    level: 'Level', remaining: 'remaining', active: 'Active', select: 'Begin', locked: 'Locked',
  },
  ar: {
    house: 'الدار', study: 'الدراسة', skills: 'اللغة', inventory: 'المقتنيات', journal: 'السجل',
    knowledge: 'المعرفة', timber: 'الخشب', stone: 'الحجر', objective: 'المسار الحالي',
    level: 'المستوى', remaining: 'متبقية', active: 'جارٍ', select: 'ابدأ', locked: 'مغلق',
  },
};

const inventoryCopy: Record<string, { title: Record<Language, string>; note: Record<Language, string>; icon: string }> = {
  'torn-manuscript': {
    title: { en: 'Torn Manuscript', ar: 'المخطوطة الممزقة' },
    note: { en: 'The last readable trace in the ruined House.', ar: 'آخر أثر مقروء في الدار المهدّمة.' },
    icon: '▤',
  },
  'worn-hammer': {
    title: { en: 'Worn Hammer', ar: 'المطرقة البالية' },
    note: { en: 'A work tool waiting for a purpose.', ar: 'أداة عمل تنتظر غايتها.' },
    icon: '⚒',
  },
  'first-word': {
    title: { en: 'The First Word', ar: 'الكلمة الأولى' },
    note: { en: '“Read.” One word recovered from the Shadow.', ar: '«اقرأ.» كلمة واحدة انتُزعت من الظل.' },
    icon: 'ا',
  },
  'restored-sentence': {
    title: { en: 'A Restored Sentence', ar: 'جملة مستعادة' },
    note: { en: 'The ghost can speak—and apparently complain.', ar: 'يستطيع الشبح الكلام، ويبدو أنه يستطيع التذمر أيضاً.' },
    icon: '۞',
  },
  'al-jahiz-signature': {
    title: { en: 'Al-Jahiz’s Signature', ar: 'توقيع الجاحظ' },
    note: { en: 'Amr ibn Bahr. The unknown ghost has a name.', ar: 'عمرو بن بحر. صار للشبح المجهول اسم.' },
    icon: 'ج',
  },
  'keeper-desk': {
    title: { en: 'The Keeper’s Desk', ar: 'مكتب القيّم' },
    note: { en: 'The first place in the House returned to use.', ar: 'أول موضع في الدار يعود إلى العمل.' },
    icon: '⌂',
  },
};

function readInitialSave() {
  const current = localStorage.getItem(SAVE_KEY);
  const v2 = current ? null : localStorage.getItem(V2_SAVE_KEY);
  const legacy = current || v2 ? null : localStorage.getItem(LEGACY_SAVE_KEY);
  return loadGame(current ?? v2 ?? legacy, Date.now());
}

function formatResource(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function formatDuration(milliseconds: number) {
  return `${Math.round(milliseconds / 1_000)}s`;
}

function useVisualClock(active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let lastFrame = 0;
    const draw = (timestamp: number) => {
      if (timestamp - lastFrame >= 32) {
        lastFrame = timestamp;
        setNow(Date.now());
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [active]);
  return now;
}

export default function App() {
  const [boot] = useState(readInitialSave);
  const [state, setState] = useState(boot.state);
  const [tab, setTab] = useState<Tab>('house');
  const [offline, setOffline] = useState<AdvanceSummary | null>(
    boot.summary && boot.summary.completions > 0 && boot.summary.elapsedMs >= 15_000 ? boot.summary : null,
  );
  const [migrationNotice, setMigrationNotice] = useState(boot.migrated);
  const [restorationNotice, setRestorationNotice] = useState(false);
  const visualNow = useVisualClock(Boolean(state.activeActivityId));
  const lang = state.language;
  const t = ui[lang];
  const stage = houseStage(state);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.title = lang === 'ar' ? 'بيت الحكمة — الكلمة الأولى' : 'House of Wisdom — The First Word';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, serializeGame(state));
    if (boot.migrated) {
      localStorage.removeItem(V2_SAVE_KEY);
      localStorage.removeItem(LEGACY_SAVE_KEY);
    }
  }, [boot.migrated, state]);

  useEffect(() => {
    const timing = activityTiming(state, Date.now());
    if (!timing) return;
    const timer = window.setTimeout(() => {
      setState((current) => advanceGame(current, Date.now()).state);
    }, Math.max(16, timing.remainingMs + 12));
    return () => window.clearTimeout(timer);
  }, [state.activeActivityId, state.activityProgressMs, state.lastUpdatedAt]);

  useEffect(() => {
    const reconcileClock = () => setState((current) => advanceGame(current, Date.now()).state);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') reconcileClock();
    };
    window.addEventListener('focus', reconcileClock);
    window.addEventListener('pageshow', reconcileClock);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', reconcileClock);
      window.removeEventListener('pageshow', reconcileClock);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const tabs = useMemo(() => {
    const available: Tab[] = ['house'];
    if (state.started) available.push('study');
    if (state.started && (state.knowledge >= 4 || state.skills.length > 0)) available.push('skills');
    if (state.started) available.push('inventory');
    if (state.ghostIdentityRevealed || state.prologueComplete) available.push('journal');
    return available;
  }, [state.ghostIdentityRevealed, state.knowledge, state.prologueComplete, state.skills.length, state.started]);

  useEffect(() => {
    if (!tabs.includes(tab)) setTab('house');
  }, [tab, tabs]);

  const changeLanguage = () => {
    setState((current) => setLanguage(current, current.language === 'ar' ? 'en' : 'ar', Date.now()));
  };

  const begin = () => {
    setState((current) => startGame(current, Date.now()));
    setTab('house');
  };

  const buySkill = (skill: LanguageSkill) => {
    setState((current) => buyLanguageSkill(current, skill.id, Date.now()));
    if (skill.id === 'eloquence') setTab('house');
  };

  const repairDesk = () => {
    if (!canRepairDesk(state)) return;
    setState((current) => repairKeeperDesk(current, Date.now()));
    setRestorationNotice(true);
    setTab('house');
  };

  const closeRestoration = (openJournal = false) => {
    setState((current) => acknowledgeOffline(current, Date.now()));
    setRestorationNotice(false);
    if (openJournal) setTab('journal');
  };

  const resetSession = () => {
    const message = lang === 'ar'
      ? 'هل تريد بدء رحلة جديدة؟ سيُحذف التقدم المحفوظ على هذا الجهاز.'
      : 'Begin a new journey? This removes progress saved on this device.';
    if (!window.confirm(message)) return;
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(V2_SAVE_KEY);
    localStorage.removeItem(LEGACY_SAVE_KEY);
    setState(createInitialState(Date.now(), lang));
    setTab('house');
    setOffline(null);
  };

  return (
    <div className={`app stage-${stage} ${state.ignoranceRevealed ? 'ignorance-named' : ''}`}>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setTab('house')} aria-label={t.house}>
          <span className="brand-glyph" aria-hidden="true">⌂</span>
          <span><small>بيت الحكمة</small><strong>House of Wisdom</strong></span>
        </button>
        <div className="resource-strip" aria-label={lang === 'ar' ? 'موارد الدار' : 'House resources'}>
          <ResourceChip icon="✦" value={state.knowledge} label={t.knowledge} />
          <ResourceChip icon="▰" value={state.materials.timber} label={t.timber} />
          <ResourceChip icon="◆" value={state.materials.stone} label={t.stone} />
        </div>
        <button className="language-button" type="button" onClick={changeLanguage}>{lang === 'ar' ? 'English' : 'العربية'}</button>
      </header>

      {state.started && (
        <div className="objective-strip">
          <span><small>{t.objective}</small><strong>{objective(state, lang)}</strong></span>
          <div className="story-meter" aria-label={`${storyProgress(state)}%`}><i style={{ width: `${storyProgress(state)}%` }} /></div>
          {state.activeActivityId && <MiniActivity state={state} lang={lang} now={visualNow} onOpen={() => setTab('study')} />}
        </div>
      )}

      <main>
        {tab === 'house' && (
          <House
            state={state}
            lang={lang}
            now={visualNow}
            onBegin={begin}
            onStudy={() => setTab('study')}
            onSkills={() => setTab('skills')}
            onInventory={() => setTab('inventory')}
            onRepair={repairDesk}
          />
        )}
        {tab === 'study' && (
          <Study
            state={state}
            lang={lang}
            now={visualNow}
            onSelect={(id) => setState((current) => selectActivity(current, id, Date.now()))}
          />
        )}
        {tab === 'skills' && <LanguageTree state={state} lang={lang} onBuy={buySkill} />}
        {tab === 'inventory' && <Inventory state={state} lang={lang} onRepair={repairDesk} />}
        {tab === 'journal' && <Journal state={state} lang={lang} />}
      </main>

      {tabs.length > 1 && (
        <nav className="navigation" aria-label={lang === 'ar' ? 'أقسام الدار' : 'House sections'}>
          {tabs.map((item) => (
            <button key={item} type="button" className={tab === item ? 'selected' : ''} onClick={() => setTab(item)}>
              <span className="nav-icon" aria-hidden="true">{navIcons[item]}</span>
              <span>{t[item]}</span>
            </button>
          ))}
        </nav>
      )}

      <footer className="footer">
        <span>{lang === 'ar' ? 'الكلمة الأولى · الإصدار ٠٫٣' : 'The First Word · v0.3'}</span>
        <button type="button" onClick={resetSession}>{lang === 'ar' ? 'رحلة جديدة' : 'New journey'}</button>
      </footer>

      {offline && (
        <Modal onClose={() => setOffline(null)}>
          <div className="modal-seal" aria-hidden="true">⌛</div>
          <p className="eyebrow">{lang === 'ar' ? 'سجل العودة' : 'Return ledger'}</p>
          <h2>{lang === 'ar' ? 'واصل الباحث عمله' : 'The researcher kept working'}</h2>
          <p>{lang === 'ar' ? 'حُسب التقدم من الوقت المسجّل، لا من مرات تحديث الشاشة.' : 'Progress was calculated from recorded time, not screen refreshes.'}</p>
          <div className="offline-rewards">
            <ResourceChip icon="✦" value={offline.knowledge} label={t.knowledge} prefix="+" />
            {offline.timber > 0 && <ResourceChip icon="▰" value={offline.timber} label={t.timber} prefix="+" />}
            {offline.stone > 0 && <ResourceChip icon="◆" value={offline.stone} label={t.stone} prefix="+" />}
          </div>
          {offline.cappedMs > 0 && <p className="quiet">{lang === 'ar' ? 'بلغ الغياب الحد الأقصى: ٨ ساعات.' : 'Away-time reached the 8-hour cap.'}</p>}
          <button className="primary-button" type="button" onClick={() => setOffline(null)}>{lang === 'ar' ? 'عد إلى الدار' : 'Return to the House'}</button>
        </Modal>
      )}

      {migrationNotice && (
        <Modal onClose={() => setMigrationNotice(false)}>
          <div className="modal-seal" aria-hidden="true">▤</div>
          <p className="eyebrow">{lang === 'ar' ? 'فصل جديد' : 'A new chapter'}</p>
          <h2>{lang === 'ar' ? 'أُعيدت كتابة البداية' : 'The opening has been rewritten'}</h2>
          <p>{lang === 'ar'
            ? 'عُثر على حفظ من الإصدار السابق. تغيّرت القصة والاقتصاد جذرياً، لذلك تبدأ «الكلمة الأولى» من جديد مع الاحتفاظ باختيار اللغة.'
            : 'A previous-version save was found. The story and economy have changed substantially, so The First Word begins fresh while preserving your language choice.'}</p>
          <button className="primary-button" type="button" onClick={() => setMigrationNotice(false)}>{lang === 'ar' ? 'ابدأ الفصل' : 'Begin the chapter'}</button>
        </Modal>
      )}

      {restorationNotice && (
        <Modal onClose={() => closeRestoration()}>
          <p className="eyebrow">{lang === 'ar' ? 'عاد أول نور' : 'The first light returns'}</p>
          <img className="restoration-preview" src="/assets/v03/house-desk-restored.png" alt="" />
          <h2>{lang === 'ar' ? 'عاد مكتب القيّم إلى العمل' : 'The Keeper’s Desk lives again'}</h2>
          <p>{lang === 'ar'
            ? 'اشتعل المصباح، وأجابت ثلاثة نوافذ في الحي. لكن العتمة في الزاوية تحركت. أعطى الجاحظ لها اسماً: الجهل.'
            : 'The lamp answers, and three windows in the district answer it. But the darkness in the corner moves. Al-Jahiz gives it a name: Ignorance.'}</p>
          <blockquote>{lang === 'ar'
            ? '«هذه ليست ظلال الليل؛ إنها الجهل، وقد تعلّم كيف يمحو ما لا يستطيع مجادلته.»'
            : '“That is not night—it is Ignorance, and it has learned to erase what it cannot argue with.”'}</blockquote>
          <button className="primary-button" type="button" onClick={() => closeRestoration(true)}>{lang === 'ar' ? 'افتح السجل' : 'Open the journal'}</button>
        </Modal>
      )}
    </div>
  );
}

const navIcons: Record<Tab, string> = { house: '⌂', study: '▤', skills: 'ا', inventory: '◫', journal: '✦' };

function ResourceChip({ icon, value, label, prefix = '' }: { icon: string; value: number; label: string; prefix?: string }) {
  return <span className="resource-chip"><i aria-hidden="true">{icon}</i><bdi>{prefix}{formatResource(value)}</bdi><small>{label}</small></span>;
}

function MiniActivity({ state, lang, now, onOpen }: { state: GameState; lang: Language; now: number; onOpen: () => void }) {
  const activity = getActivity(state.activeActivityId);
  const timing = activityTiming(state, now);
  if (!activity || !timing) return null;
  return (
    <button className="mini-activity" type="button" onClick={onOpen}>
      <span><strong>{activity.name[lang]}</strong><small><bdi>{Math.ceil(timing.remainingMs / 1_000)}s</bdi></small></span>
      <i><b style={{ width: `${timing.percent}%` }} /></i>
    </button>
  );
}

function House({ state, lang, now, onBegin, onStudy, onSkills, onInventory, onRepair }: {
  state: GameState;
  lang: Language;
  now: number;
  onBegin: () => void;
  onStudy: () => void;
  onSkills: () => void;
  onInventory: () => void;
  onRepair: () => void;
}) {
  if (!state.started) return <OpeningComic lang={lang} onBegin={onBegin} />;
  const repairable = canRepairDesk(state);
  return (
    <section className="house-screen screen-section">
      <div className="section-heading compact-heading">
        <div><p className="eyebrow">{lang === 'ar' ? 'الفصل الأول' : 'Chapter One'}</p><h1>{lang === 'ar' ? 'الكلمة الأولى' : 'The First Word'}</h1></div>
        <p>{lang === 'ar' ? 'استعد المعنى، ثم أعد بناء المكان الذي كان يحفظه.' : 'Restore meaning, then rebuild the place that preserved it.'}</p>
      </div>
      <HouseScene state={state} lang={lang} />
      <div className="house-actions">
        <article className="action-panel current-work">
          <p className="eyebrow">{lang === 'ar' ? 'العمل الجاري' : 'Current work'}</p>
          <ActivityTimer state={state} activity={getActivity(state.activeActivityId)} lang={lang} now={now} />
          <button className="secondary-button" type="button" onClick={onStudy}>{lang === 'ar' ? 'غيّر العمل' : 'Change activity'}</button>
        </article>
        {!state.ghostIdentityRevealed ? (
          <article className="action-panel manuscript-callout">
            <span className="panel-icon" aria-hidden="true">▤</span>
            <div><p className="eyebrow">{lang === 'ar' ? 'المخطوطة الممزقة' : 'The torn manuscript'}</p><h2>{objective(state, lang)}</h2><p>{lang === 'ar' ? 'تفتح كل طبقة من اللغة جزءاً جديداً من كلام الشبح.' : 'Each layer of language restores another part of the ghost’s speech.'}</p></div>
            <button className="primary-button" type="button" onClick={onSkills}>{lang === 'ar' ? 'افتح شجرة اللغة' : 'Open Language tree'}</button>
          </article>
        ) : (
          <DeskRecipe state={state} lang={lang} onRepair={onRepair} onInventory={onInventory} repairable={repairable} />
        )}
      </div>
    </section>
  );
}

function OpeningComic({ lang, onBegin }: { lang: Language; onBegin: () => void }) {
  return (
    <section className="opening-screen">
      <div className="opening-copy">
        <p className="eyebrow">{lang === 'ar' ? 'حكاية ترميم وغموض' : 'A restoration mystery'}</p>
        <h1>{lang === 'ar' ? 'بيت الحكمة صامت.' : 'The House of Wisdom is silent.'}</h1>
        <p>{lang === 'ar'
          ? 'وصل باحث مجهول يطلب المعرفة، فلم يجد سوى دار مهدّمة، ومخطوطة ممزقة، ومطرقة بالية، وشبح لا تُفهم كلماته.'
          : 'A nameless researcher came seeking knowledge and found only a ruined House, a torn manuscript, a worn hammer, and a ghost whose words could not be understood.'}</p>
      </div>
      <figure className="comic-frame">
        <img src="/assets/v03/opening-comic.png" alt={lang === 'ar' ? 'أربع لوحات تروي وصول الباحث ولقاء الشبح' : 'Four panels showing the researcher arriving and meeting the ghost'} />
        <figcaption>{lang === 'ar' ? 'المخطوطة تعيد المعنى. المطرقة تعيد الدار.' : 'The manuscript restores meaning. The hammer restores the House.'}</figcaption>
      </figure>
      <div className="founding-tools">
        <span><b aria-hidden="true">▤</b><strong>{lang === 'ar' ? 'المخطوطة' : 'The manuscript'}</strong><small>{lang === 'ar' ? 'افهم ما فُقد' : 'Understand what was lost'}</small></span>
        <span><b aria-hidden="true">⚒</b><strong>{lang === 'ar' ? 'المطرقة' : 'The hammer'}</strong><small>{lang === 'ar' ? 'أعد بناء ما تهدّم' : 'Rebuild what was broken'}</small></span>
      </div>
      <button className="primary-button opening-button" type="button" onClick={onBegin}>{lang === 'ar' ? 'ادخل الدار' : 'Enter the House'}</button>
    </section>
  );
}

function HouseScene({ state, lang }: { state: GameState; lang: Language }) {
  const dialogue = ghostDialogue(state, lang);
  const salvage = state.activeActivityId === 'salvage-timber' || state.activeActivityId === 'sort-stone';
  return (
    <div className={`room-frame ${state.deskRepaired ? 'desk-restored' : 'room-ruin'} ${salvage ? 'researcher-salvaging' : ''}`}>
      <img className="room-background" src={state.deskRepaired ? '/assets/v03/house-desk-restored.png' : '/assets/v03/house-ruin.png'} alt={lang === 'ar' ? 'قاعة مهدمة في بيت الحكمة' : 'A ruined hall inside the House of Wisdom'} />
      <div className="pixel-vignette" aria-hidden="true" />
      {!state.deskRepaired && <div className="ignorance-haze" aria-hidden="true"><i /><i /><i /><span>ا</span><span>؟</span><span>م</span></div>}
      {state.deskRepaired && <div className="named-shadow" aria-hidden="true"><i /><span>{lang === 'ar' ? 'الجهل' : 'IGNORANCE'}</span></div>}
      <img className="researcher-sprite" src="/assets/v03/researcher.png" alt={lang === 'ar' ? 'الباحث' : 'The researcher'} />
      <img className={`ghost-sprite ${state.ghostIdentityRevealed ? 'identity-revealed' : ''}`} src="/assets/v03/al-jahiz-ghost.png" alt={state.ghostIdentityRevealed ? (lang === 'ar' ? 'الجاحظ' : 'Al-Jahiz') : (lang === 'ar' ? 'شبح مجهول' : 'An unknown ghost')} />
      {dialogue && (
        <div className={`dialogue-panel ${dialogue.obscured ? 'obscured' : ''}`}>
          <div className="dialogue-speaker"><span>{state.ghostIdentityRevealed ? 'ج' : '؟'}</span><div><small>{lang === 'ar' ? 'المتحدث' : 'Speaker'}</small><strong>{dialogue.speaker}</strong></div></div>
          <blockquote>{dialogue.text}</blockquote>
          <p>{dialogue.note}</p>
        </div>
      )}
      <span className="stage-label">{state.deskRepaired ? (lang === 'ar' ? 'المرحلة ١ · أول نور' : 'Stage 1 · First light') : (lang === 'ar' ? 'المرحلة ٠ · الدار المهجورة' : 'Stage 0 · The abandoned House')}</span>
    </div>
  );
}

function DeskRecipe({ state, lang, onRepair, onInventory, repairable }: { state: GameState; lang: Language; onRepair: () => void; onInventory?: () => void; repairable: boolean }) {
  if (state.deskRepaired) {
    return (
      <article className="action-panel repaired-panel">
        <span className="panel-icon" aria-hidden="true">✦</span>
        <div><p className="eyebrow">{lang === 'ar' ? 'اكتمل الترميم الأول' : 'First restoration complete'}</p><h2>{lang === 'ar' ? 'عاد مكتب القيّم' : 'The Keeper’s Desk returns'}</h2><p>{lang === 'ar' ? 'أصبح للمعرفة موضع، وللجهل اسم.' : 'Knowledge has a place—and Ignorance has a name.'}</p></div>
      </article>
    );
  }
  return (
    <article className="action-panel desk-recipe">
      <div><p className="eyebrow">{lang === 'ar' ? 'مشروع الترميم الأول' : 'First restoration project'}</p><h2>{lang === 'ar' ? 'مكتب القيّم' : 'The Keeper’s Desk'}</h2><p>{lang === 'ar' ? 'قال الجاحظ إن المكتب كان قلب القاعة. أصلحه لتثبيت أول نور.' : 'Al-Jahiz says the desk was the hall’s heart. Repair it to anchor the first light.'}</p></div>
      <div className="requirements">
        <Requirement icon="✦" current={state.knowledge} required={deskRequirements.knowledge} label={ui[lang].knowledge} />
        <Requirement icon="▰" current={state.materials.timber} required={deskRequirements.timber} label={ui[lang].timber} />
        <Requirement icon="◆" current={state.materials.stone} required={deskRequirements.stone} label={ui[lang].stone} />
      </div>
      <div className="panel-buttons">
        <button className="primary-button" type="button" disabled={!repairable} onClick={onRepair}>{repairable ? (lang === 'ar' ? 'رمّم المكتب' : 'Repair the desk') : (lang === 'ar' ? 'اجمع المتطلبات' : 'Gather requirements')}</button>
        {onInventory && <button className="text-button" type="button" onClick={onInventory}>{lang === 'ar' ? 'افتح المقتنيات' : 'Open inventory'}</button>}
      </div>
    </article>
  );
}

function Requirement({ icon, current, required, label }: { icon: string; current: number; required: number; label: string }) {
  const complete = current + Number.EPSILON >= required;
  return <span className={complete ? 'complete' : ''}><i aria-hidden="true">{complete ? '✓' : icon}</i><bdi>{formatResource(Math.min(current, required))}/{required}</bdi><small>{label}</small></span>;
}

function Study({ state, lang, now, onSelect }: { state: GameState; lang: Language; now: number; onSelect: (id: string) => void }) {
  const study = activities.filter((activity) => activity.kind === 'study');
  const salvage = activities.filter((activity) => activity.kind === 'salvage');
  return (
    <section className="study-screen screen-section">
      <div className="section-heading">
        <div><p className="eyebrow">{lang === 'ar' ? 'اقرأ · افهم · طبّق' : 'Read · understand · apply'}</p><h1>{lang === 'ar' ? 'الدراسة والعمل' : 'Study & Work'}</h1></div>
        <p>{lang === 'ar' ? 'اختر نشاطاً واحداً. يستمر تلقائياً حتى تختار غيره، ويُحسب الوقت الحقيقي حتى حين تغادر.' : 'Choose one activity. It repeats until replaced, using real elapsed time even when you leave.'}</p>
      </div>
      <div className="active-work-card">
        <p className="eyebrow">{lang === 'ar' ? 'النشاط الجاري' : 'Active activity'}</p>
        <ActivityTimer state={state} activity={getActivity(state.activeActivityId)} lang={lang} now={now} large />
      </div>
      <ActivityGroup title={lang === 'ar' ? 'اللغة والأدب' : 'Language & Literature'} note={lang === 'ar' ? 'استعد كلام الجاحظ طبقة بعد طبقة.' : 'Restore Al-Jahiz’s speech one layer at a time.'} activities={study} state={state} lang={lang} onSelect={onSelect} />
      <ActivityGroup title={lang === 'ar' ? 'الإنقاذ والترميم' : 'Salvage & Restoration'} note={state.ghostIdentityRevealed ? (lang === 'ar' ? 'اجمع ما يحتاجه مكتب القيّم.' : 'Recover what the Keeper’s Desk requires.') : (lang === 'ar' ? 'اكشف هوية الشبح لفتح أعمال الإنقاذ.' : 'Reveal the ghost’s identity to unlock salvage work.')} activities={salvage} state={state} lang={lang} onSelect={onSelect} />
    </section>
  );
}

function ActivityGroup({ title, note, activities: group, state, lang, onSelect }: { title: string; note: string; activities: Activity[]; state: GameState; lang: Language; onSelect: (id: string) => void }) {
  return (
    <section className="activity-group">
      <header><h2>{title}</h2><p>{note}</p></header>
      <div className="activity-grid">
        {group.map((activity) => <ActivityCard key={activity.id} activity={activity} state={state} lang={lang} selected={state.activeActivityId === activity.id} onSelect={() => onSelect(activity.id)} />)}
      </div>
    </section>
  );
}

function ActivityTimer({ state, activity, lang, now, large = false }: { state: GameState; activity: Activity | null; lang: Language; now: number; large?: boolean }) {
  if (!activity) return <p>{lang === 'ar' ? 'لا يوجد نشاط جارٍ.' : 'No activity is running.'}</p>;
  const timing = activityTiming(state, now);
  if (!timing) return null;
  return (
    <div className={`activity-timer ${large ? 'large' : ''}`}>
      <div><strong>{activity.name[lang]}</strong><span><bdi>{formatDuration(activity.durationMs)}</bdi> · <bdi>{Math.max(0, Math.ceil(timing.remainingMs / 1_000))}s</bdi> {ui[lang].remaining}</span></div>
      <div className="timer-track"><i style={{ width: `${timing.percent}%` }} /></div>
      <div className="timer-rewards"><span><bdi>+{formatResource(activity.knowledge * knowledgeMultiplier(state, activity.discipline))}</bdi> ✦</span><span><bdi>+{activity.xp}</bdi> XP</span>{activity.timber ? <span><bdi>+{activity.timber}</bdi> ▰</span> : null}{activity.stone ? <span><bdi>+{activity.stone}</bdi> ◆</span> : null}</div>
    </div>
  );
}

function ActivityCard({ activity, state, lang, selected, onSelect }: { activity: Activity; state: GameState; lang: Language; selected: boolean; onSelect: () => void }) {
  const available = activityAvailable(state, activity);
  const reason = !available
    ? activity.requiresIdentity && !state.ghostIdentityRevealed
      ? (lang === 'ar' ? 'اكشف هوية الشبح' : 'Reveal the ghost')
      : (lang === 'ar' ? `المستوى ${activity.minLevel}` : `Level ${activity.minLevel}`)
    : '';
  return (
    <button className={`activity-card ${selected ? 'selected' : ''} ${available ? '' : 'locked'}`} type="button" disabled={!available || selected} onClick={onSelect}>
      <span className="activity-icon" aria-hidden="true">{activity.kind === 'study' ? 'ا' : activity.timber ? '▰' : '◆'}</span>
      <span className="activity-copy"><strong>{activity.name[lang]}</strong><small>{activity.description[lang]}</small></span>
      <span className="activity-meta"><bdi>{formatDuration(activity.durationMs)}</bdi><small><bdi>+{formatResource(activity.knowledge)}</bdi> ✦ · <bdi>+{activity.xp}</bdi> XP</small></span>
      <span className="activity-state">{selected ? ui[lang].active : available ? ui[lang].select : reason}</span>
    </button>
  );
}

function LanguageTree({ state, lang, onBuy }: { state: GameState; lang: Language; onBuy: (skill: LanguageSkill) => void }) {
  const progress = levelProgress(state.xp.language);
  return (
    <section className="skills-screen screen-section">
      <div className="section-heading">
        <div><p className="eyebrow">{lang === 'ar' ? 'شجرة المهارة الأولى' : 'The first skill tree'}</p><h1>{lang === 'ar' ? 'اللغة والأدب' : 'Language & Literature'}</h1></div>
        <p>{lang === 'ar' ? 'ليست الكلمات اختباراً مدرسياً. كل فهم جديد يعيد حواراً أو ذكرى أو طريقاً إلى علم آخر.' : 'Words are not a classroom quiz. Each insight restores dialogue, memory, or a path into another discipline.'}</p>
      </div>
      <div className="discipline-ledger">
        <span className="discipline-glyph" aria-hidden="true">ا</span>
        <div><small>{ui[lang].level}</small><strong><bdi>{progress.currentLevel}</bdi></strong></div>
        <div className="xp-meter"><span><i style={{ width: `${progress.percent}%` }} /></span><small><bdi>{progress.currentXp}</bdi> / <bdi>{progress.requiredXp ?? '—'}</bdi> XP</small></div>
      </div>
      <div className="language-tree">
        {languageSkills.map((skill, index) => (
          <div className="tree-segment" key={skill.id}>
            {index > 0 && index < 4 && <div className={`tree-connector ${hasSkill(state, languageSkills[index - 1].id) ? 'complete' : ''}`}><i /><span>◆</span><i /></div>}
            {index === 4 && <div className="future-split"><span>{lang === 'ar' ? 'يتفرع الطريق' : 'The path divides'}</span></div>}
            <SkillCard skill={skill} state={state} lang={lang} onBuy={() => onBuy(skill)} />
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillCard({ skill, state, lang, onBuy }: { skill: LanguageSkill; state: GameState; lang: Language; onBuy: () => void }) {
  const complete = hasSkill(state, skill.id);
  const requirements = skillRequirementsMet(state, skill);
  const available = skillAvailable(state, skill);
  const affordable = skill.cost !== null && state.knowledge + Number.EPSILON >= skill.cost;
  const status = complete ? 'complete' : skill.kind === 'future' ? 'future' : requirements ? 'available' : 'locked';
  return (
    <article className={`skill-node ${status}`}>
      <div className="skill-seal" aria-hidden="true">{complete ? '✓' : skill.kind === 'future' ? '◇' : 'ا'}</div>
      <div className="skill-copy"><p className="eyebrow">{skill.eyebrow[lang]}</p><h2>{skill.name[lang]}</h2><p>{skill.description[lang]}</p></div>
      <div className="skill-action">
        {complete ? <span className="complete-label">{lang === 'ar' ? 'مفهوم' : 'Understood'}</span>
          : skill.kind === 'future' ? <span className="future-label">{lang === 'ar' ? 'بعد الكلمة الأولى' : 'After The First Word'}</span>
            : available ? <button type="button" disabled={!affordable} onClick={onBuy}><span>{affordable ? (lang === 'ar' ? 'افهم' : 'Understand') : (lang === 'ar' ? 'اجمع المعرفة' : 'Gather Knowledge')}</span><bdi>{skill.cost} ✦</bdi></button>
              : <span className="locked-label">{lang === 'ar' ? `يتطلب المستوى ${skill.minLevel} والمسار السابق` : `Requires level ${skill.minLevel} and the previous insight`}</span>}
      </div>
    </article>
  );
}

function Inventory({ state, lang, onRepair }: { state: GameState; lang: Language; onRepair: () => void }) {
  return (
    <section className="inventory-screen screen-section">
      <div className="section-heading">
        <div><p className="eyebrow">{lang === 'ar' ? 'ما حملته وما أنقذته' : 'What you carried and recovered'}</p><h1>{lang === 'ar' ? 'المقتنيات والمواد' : 'Inventory & Materials'}</h1></div>
        <p>{lang === 'ar' ? 'كل شيء هنا يخدم فهماً أو ترميماً. لا توجد غنائم بلا معنى.' : 'Everything here serves understanding or restoration. Nothing is collected without purpose.'}</p>
      </div>
      <div className="inventory-grid">
        {state.inventory.map((id) => {
          const copy = inventoryCopy[id] ?? { title: { en: id, ar: id }, note: { en: '', ar: '' }, icon: '◇' };
          return <article className="inventory-item" key={id}><span aria-hidden="true">{copy.icon}</span><small>{copy.note[lang]}</small><h2>{copy.title[lang]}</h2></article>;
        })}
      </div>
      <section className="material-ledger">
        <h2>{lang === 'ar' ? 'المواد المستخرجة' : 'Recovered materials'}</h2>
        <div><ResourceChip icon="▰" value={state.materials.timber} label={ui[lang].timber} /><ResourceChip icon="◆" value={state.materials.stone} label={ui[lang].stone} /></div>
      </section>
      {state.ghostIdentityRevealed && <DeskRecipe state={state} lang={lang} onRepair={onRepair} repairable={canRepairDesk(state)} />}
    </section>
  );
}

function Journal({ state, lang }: { state: GameState; lang: Language }) {
  const entries = [
    {
      open: true,
      number: '01',
      title: { en: 'The Abandoned House', ar: 'الدار المهجورة' },
      text: { en: 'A torn manuscript and a worn hammer survived in the ruined hall.', ar: 'نجت مخطوطة ممزقة ومطرقة بالية في القاعة المهدّمة.' },
    },
    {
      open: state.ghostIdentityRevealed,
      number: '02',
      title: { en: 'A Name in the Margin', ar: 'اسم في الهامش' },
      text: { en: 'The ghost is Al-Jahiz: writer, observer, and apparently an enemy of dignified silence.', ar: 'الشبح هو الجاحظ: كاتب ومراقب، ويبدو أنه عدو للصمت الوقور.' },
    },
    {
      open: state.prologueComplete,
      number: '03',
      title: { en: 'The First Shadow', ar: 'الظل الأول' },
      text: { en: 'The House was not merely abandoned. Ignorance is actively erasing its connections, words, and memory.', ar: 'لم تُهجر الدار فحسب. الجهل يمحو روابطها وكلماتها وذاكرتها عمداً.' },
    },
  ];
  return (
    <section className="journal-screen screen-section">
      <div className="section-heading">
        <div><p className="eyebrow">{lang === 'ar' ? 'ذاكرة الدار' : 'The House remembers'}</p><h1>{lang === 'ar' ? 'سجل الكلمة الأولى' : 'Journal of The First Word'}</h1></div>
        <p>{lang === 'ar' ? 'تُحفظ هنا الحقائق التي استعدتها، لا الشائعات التي سمعتها.' : 'This records what you have recovered—not every rumour you hear.'}</p>
      </div>
      <div className="journal-list">
        {entries.map((entry) => <article key={entry.number} className={entry.open ? 'open' : 'sealed'}><span>{entry.number}</span><div><p className="eyebrow">{entry.open ? (lang === 'ar' ? 'مستعاد' : 'Recovered') : (lang === 'ar' ? 'ممحى' : 'Erased')}</p><h2>{entry.open ? entry.title[lang] : '••••••••'}</h2><p>{entry.open ? entry.text[lang] : (lang === 'ar' ? 'أعد المزيد من ذاكرة الدار.' : 'Restore more of the House’s memory.')}</p></div></article>)}
      </div>
      {state.prologueComplete && (
        <article className="chapter-end">
          <p className="eyebrow">{lang === 'ar' ? 'نهاية المقدمة' : 'End of the prologue'}</p>
          <h2>{lang === 'ar' ? 'لم تُهجر الدار. لقد أُسكتت.' : 'The House was not abandoned. It was silenced.'}</h2>
          <p>{lang === 'ar' ? 'عاد أول نور، لكن الجهل ليس الظل الوحيد في المدينة.' : 'The first light has returned, but Ignorance is not the city’s only Shadow.'}</p>
        </article>
      )}
    </section>
  );
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-card" role="dialog" aria-modal="true">{children}</div></div>;
}
