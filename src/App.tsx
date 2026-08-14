import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  LEGACY_SAVE_KEY,
  SAVE_KEY,
  V2_SAVE_KEY,
  V3_SAVE_KEY,
  acknowledgeOffline,
  activities,
  activityAvailable,
  activityTiming,
  advanceGame,
  buyLanguageSkill,
  canRepairDesk,
  createInitialState,
  darknessPercent,
  deskRequirements,
  getActivity,
  hasSkill,
  houseStage,
  inspectManuscript,
  knowledgeMultiplier,
  languageSkills,
  levelProgress,
  loadGame,
  narrativePurpose,
  nextLanguageSkill,
  objective,
  recommendedDestination,
  repairKeeperDesk,
  selectActivity,
  serializeGame,
  setLanguage,
  skillAvailable,
  skillRequirementsMet,
  skipTutorial,
  startGame,
  storyDialogue,
  type Activity,
  type AdvanceSummary,
  type Destination,
  type GameState,
  type Language,
  type LanguageSkill,
} from './game';

type Tab = 'house' | 'work' | 'knowledge';

const ui = {
  en: {
    house: 'House', work: 'Work', knowledgeTab: 'Knowledge', knowledge: 'Knowledge', timber: 'Timber', stone: 'Stone',
    purpose: 'Purpose', next: 'Next action', level: 'Level', remaining: 'remaining', active: 'Active', select: 'Begin',
  },
  ar: {
    house: 'الدار', work: 'العمل', knowledgeTab: 'المعرفة', knowledge: 'المعرفة', timber: 'الخشب', stone: 'الحجر',
    purpose: 'الغاية', next: 'الخطوة التالية', level: 'المستوى', remaining: 'متبقية', active: 'جارٍ', select: 'ابدأ',
  },
};

const inventoryCopy: Record<string, { title: Record<Language, string>; note: Record<Language, string>; icon: string }> = {
  'torn-manuscript': { title: { en: 'Torn Manuscript', ar: 'المخطوطة الممزقة' }, note: { en: 'The last readable trace in the ruined House.', ar: 'آخر أثر مقروء في الدار المهدّمة.' }, icon: '▤' },
  'worn-hammer': { title: { en: 'Worn Hammer', ar: 'المطرقة البالية' }, note: { en: 'A work tool waiting for a purpose.', ar: 'أداة عمل تنتظر غايتها.' }, icon: '⚒' },
  'first-word': { title: { en: 'The First Word', ar: 'الكلمة الأولى' }, note: { en: '“Read.” One word recovered from the Darkness.', ar: '«اقرأ.» كلمة واحدة انتُزعت من العتمة.' }, icon: 'ا' },
  'restored-sentence': { title: { en: 'A Restored Sentence', ar: 'جملة مستعادة' }, note: { en: 'The ghost can speak—and apparently complain.', ar: 'يستطيع الشبح الكلام، ويبدو أنه يستطيع التذمر أيضاً.' }, icon: '۞' },
  'al-jahiz-signature': { title: { en: 'Al-Jahiz’s Signature', ar: 'توقيع الجاحظ' }, note: { en: 'Amr ibn Bahr. The unknown ghost has a name.', ar: 'عمرو بن بحر. صار للشبح المجهول اسم.' }, icon: 'ج' },
  'keeper-desk': { title: { en: 'The Keeper’s Desk', ar: 'مكتب القيّم' }, note: { en: 'The first working place—and the city’s first returned light.', ar: 'أول موضع يعود إلى العمل، وأول نور يعود إلى المدينة.' }, icon: '⌂' },
};

const navIcons: Record<Tab, string> = { house: '⌂', work: '▤', knowledge: 'ا' };

function readInitialSave() {
  const current = localStorage.getItem(SAVE_KEY);
  const v3 = current ? null : localStorage.getItem(V3_SAVE_KEY);
  const v2 = current || v3 ? null : localStorage.getItem(V2_SAVE_KEY);
  const legacy = current || v3 || v2 ? null : localStorage.getItem(LEGACY_SAVE_KEY);
  return loadGame(current ?? v3 ?? v2 ?? legacy, Date.now());
}

function formatResource(value: number) { return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1); }
function formatDuration(milliseconds: number) { return `${Math.round(milliseconds / 1_000)}s`; }

function useVisualClock(active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let lastFrame = 0;
    const draw = (timestamp: number) => {
      if (timestamp - lastFrame >= 32) { lastFrame = timestamp; setNow(Date.now()); }
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
  const [satchelOpen, setSatchelOpen] = useState(false);
  const [comicReplay, setComicReplay] = useState(false);
  const [memoriesExpanded, setMemoriesExpanded] = useState(boot.state.prologueComplete);
  const [offline, setOffline] = useState<AdvanceSummary | null>(
    boot.summary && boot.summary.completions > 0 && boot.summary.elapsedMs >= 15_000 ? boot.summary : null,
  );
  const [migrationNotice, setMigrationNotice] = useState(boot.migrated);
  const [restorationNotice, setRestorationNotice] = useState(false);
  const visualNow = useVisualClock(Boolean(state.activeActivityId));
  const lang = state.language;
  const t = ui[lang];
  const stage = houseStage(state);
  const recommendation = recommendedDestination(state);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.title = lang === 'ar' ? 'بيت الحكمة — الكلمة الأولى' : 'House of Wisdom — The First Word';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, serializeGame(state));
    if (boot.migrated) {
      localStorage.removeItem(V3_SAVE_KEY);
      localStorage.removeItem(V2_SAVE_KEY);
      localStorage.removeItem(LEGACY_SAVE_KEY);
    }
  }, [boot.migrated, state]);

  useEffect(() => {
    const timing = activityTiming(state, Date.now());
    if (!timing) return;
    const timer = window.setTimeout(() => setState((current) => advanceGame(current, Date.now()).state), Math.max(16, timing.remainingMs + 12));
    return () => window.clearTimeout(timer);
  }, [state.activeActivityId, state.activityProgressMs, state.lastUpdatedAt]);

  useEffect(() => {
    const reconcileClock = () => setState((current) => advanceGame(current, Date.now()).state);
    const onVisibility = () => { if (document.visibilityState === 'visible') reconcileClock(); };
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
    if (state.started && state.tutorialStep !== 'inspect-manuscript') available.push('work');
    if (state.started && (state.knowledge >= 1 || state.skills.length > 0)) available.push('knowledge');
    return available;
  }, [state.knowledge, state.skills.length, state.started, state.tutorialStep]);

  useEffect(() => { if (!tabs.includes(tab)) setTab('house'); }, [tab, tabs]);

  const changeLanguage = () => setState((current) => setLanguage(current, current.language === 'ar' ? 'en' : 'ar', Date.now()));
  const begin = () => { setState((current) => startGame(current, Date.now())); setTab('house'); };
  const inspect = () => { setState((current) => inspectManuscript(current, Date.now())); setTab('work'); };

  const buySkill = (skill: LanguageSkill) => {
    setState((current) => buyLanguageSkill(current, skill.id, Date.now()));
    setTab('house');
  };

  const repairDesk = () => {
    if (!canRepairDesk(state)) return;
    setSatchelOpen(false);
    setState((current) => repairKeeperDesk(current, Date.now()));
    setRestorationNotice(true);
    setTab('house');
  };

  const openMemories = () => {
    setTab('house');
    setMemoriesExpanded(true);
    requestAnimationFrame(() => document.getElementById('house-memories')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const followGuide = () => {
    const destination = recommendedDestination(state);
    if (state.tutorialStep === 'inspect-manuscript') { inspect(); return; }
    if (destination === 'house') {
      setTab('house');
      requestAnimationFrame(() => document.getElementById('restoration-project')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    } else if (destination === 'work') setTab('work');
    else if (destination === 'knowledge') setTab('knowledge');
    else if (destination === 'satchel') setSatchelOpen(true);
    else openMemories();
  };

  const skipGuidance = () => { setState((current) => skipTutorial(current, Date.now())); setTab('work'); };

  const resetSession = () => {
    const message = lang === 'ar' ? 'هل تريد بدء رحلة جديدة؟ سيُحذف التقدم المحفوظ على هذا الجهاز.' : 'Begin a new journey? This removes progress saved on this device.';
    if (!window.confirm(message)) return;
    [SAVE_KEY, V3_SAVE_KEY, V2_SAVE_KEY, LEGACY_SAVE_KEY].forEach((key) => localStorage.removeItem(key));
    setState(createInitialState(Date.now(), lang));
    setTab('house');
    setSatchelOpen(false);
    setMemoriesExpanded(false);
    setOffline(null);
  };

  const closeRestoration = (showMemories = false) => {
    setState((current) => acknowledgeOffline(current, Date.now()));
    setRestorationNotice(false);
    if (showMemories) openMemories();
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
        <div className="topbar-actions">
          {state.started && <button className={`satchel-button ${recommendation === 'satchel' ? 'guided-target' : ''}`} type="button" onClick={() => setSatchelOpen(true)}><span aria-hidden="true">◫</span>{lang === 'ar' ? 'الحقيبة' : 'Satchel'}</button>}
          <button className="language-button" type="button" onClick={changeLanguage}>{lang === 'ar' ? 'English' : 'العربية'}</button>
        </div>
      </header>

      {state.started && (
        <div className="chapter-strip">
          <DarknessMeter state={state} lang={lang} />
          <div className="objective-copy">
            <span><small>{t.purpose}</small><strong>{narrativePurpose(state, lang)}</strong></span>
            <span><small>{t.next}</small><strong>{objective(state, lang)}</strong></span>
          </div>
          {state.activeActivityId && <MiniActivity state={state} lang={lang} now={visualNow} onOpen={() => setTab('work')} />}
        </div>
      )}

      <main>
        {tab === 'house' && (
          <House
            state={state} lang={lang} now={visualNow} recommendation={recommendation}
            memoriesExpanded={memoriesExpanded} onToggleMemories={() => setMemoriesExpanded((current) => !current)}
            onBegin={begin} onGuide={followGuide} onSkipGuidance={skipGuidance}
            onWork={() => setTab('work')} onKnowledge={() => setTab('knowledge')}
            onSatchel={() => setSatchelOpen(true)} onRepair={repairDesk}
          />
        )}
        {tab === 'work' && <Work state={state} lang={lang} now={visualNow} onSelect={(id) => setState((current) => selectActivity(current, id, Date.now()))} />}
        {tab === 'knowledge' && <Knowledge state={state} lang={lang} onBuy={buySkill} />}
      </main>

      {tabs.length > 1 && (
        <nav className="navigation" aria-label={lang === 'ar' ? 'أقسام الدار' : 'House sections'}>
          {tabs.map((item) => {
            const destination: Destination = item;
            const label = item === 'knowledge' ? t.knowledgeTab : t[item];
            return <button key={item} type="button" className={`${tab === item ? 'selected' : ''} ${recommendation === destination ? 'guided-target' : ''}`} onClick={() => setTab(item)}><span className="nav-icon" aria-hidden="true">{navIcons[item]}</span><span>{label}</span></button>;
          })}
        </nav>
      )}

      <footer className="footer">
        <span>{lang === 'ar' ? 'الكلمة الأولى · الإصدار ٠٫٣٫١' : 'The First Word · v0.3.1'}</span>
        {state.started && <button type="button" onClick={() => setComicReplay(true)}>{lang === 'ar' ? 'أعد المقدمة' : 'Replay opening'}</button>}
        <button type="button" onClick={resetSession}>{lang === 'ar' ? 'رحلة جديدة' : 'New journey'}</button>
      </footer>

      {satchelOpen && <SatchelDrawer state={state} lang={lang} onClose={() => setSatchelOpen(false)} onRepair={repairDesk} />}

      {comicReplay && <Modal onClose={() => setComicReplay(false)} wide><ComicPanels lang={lang} /><button className="primary-button" type="button" onClick={() => setComicReplay(false)}>{lang === 'ar' ? 'عد إلى الدار' : 'Return to the House'}</button></Modal>}

      {offline && (
        <Modal onClose={() => setOffline(null)}>
          <div className="modal-seal" aria-hidden="true">⌛</div><p className="eyebrow">{lang === 'ar' ? 'سجل العودة' : 'Return ledger'}</p>
          <h2>{lang === 'ar' ? 'واصل الباحث عمله' : 'The researcher kept working'}</h2>
          <p>{lang === 'ar' ? 'حُسب التقدم من الوقت المسجّل، لا من مرات تحديث الشاشة.' : 'Progress was calculated from recorded time, not screen refreshes.'}</p>
          <div className="offline-rewards"><ResourceChip icon="✦" value={offline.knowledge} label={t.knowledge} prefix="+" />{offline.timber > 0 && <ResourceChip icon="▰" value={offline.timber} label={t.timber} prefix="+" />}{offline.stone > 0 && <ResourceChip icon="◆" value={offline.stone} label={t.stone} prefix="+" />}</div>
          {offline.cappedMs > 0 && <p className="quiet">{lang === 'ar' ? 'بلغ الغياب الحد الأقصى: ٨ ساعات.' : 'Away-time reached the 8-hour cap.'}</p>}
          <button className="primary-button" type="button" onClick={() => setOffline(null)}>{lang === 'ar' ? 'عد إلى الدار' : 'Return to the House'}</button>
        </Modal>
      )}

      {migrationNotice && (
        <Modal onClose={() => setMigrationNotice(false)}>
          <div className="modal-seal" aria-hidden="true">✦</div><p className="eyebrow">{lang === 'ar' ? 'طريق أوضح' : 'A clearer path'}</p>
          <h2>{lang === 'ar' ? 'العتمة صارت لها غاية' : 'The Darkness now has a purpose'}</h2>
          <p>{boot.fromVersion === 3
            ? (lang === 'ar' ? 'حُفظ تقدمك السابق. أضيفت رواية أوضح وإرشاد اختياري ومقياس لظلام بغداد. يمكنك إعادة المقدمة من أسفل الدار.' : 'Your previous progress is preserved. The House now has clearer narration, optional guidance, and a city Darkness meter. You can replay the opening from the footer.')
            : (lang === 'ar' ? 'تغيّرت القصة والاقتصاد جذرياً، لذلك تبدأ «الكلمة الأولى» من جديد مع الاحتفاظ باللغة.' : 'The story and economy changed substantially, so The First Word begins fresh while preserving your language choice.')}</p>
          <button className="primary-button" type="button" onClick={() => setMigrationNotice(false)}>{lang === 'ar' ? 'واصل الرحلة' : 'Continue the journey'}</button>
        </Modal>
      )}

      {restorationNotice && (
        <Modal onClose={() => closeRestoration()}>
          <p className="eyebrow">{lang === 'ar' ? 'أُشعل أول مصباح' : 'The first lamp is lit'}</p>
          <img className="restoration-preview" src="/assets/v03/house-desk-restored-long-darkness.png" alt="" />
          <h2>{lang === 'ar' ? 'تراجع ظلام بغداد إلى ٩٩٪' : 'Baghdad’s Darkness falls to 99%'}</h2>
          <p>{lang === 'ar' ? 'أجاب مصباح بعيد نور مكتب القيّم. كشف الجاحظ أن العتمة ليست ليلاً: إنها الجهل، وتضعف كلما انتقلت المعرفة بين الناس.' : 'One distant lamp answers the Keeper’s Desk. Al-Jahiz reveals that the Darkness is not night: it is Ignorance, and it weakens whenever knowledge moves between people.'}</p>
          <blockquote>{lang === 'ar' ? '«ولحسن الحظ، الكتب سيئة جداً في التزام الصمت بعد نسخها.»' : '“Fortunately, books are notoriously poor at staying quiet once copied.”'}</blockquote>
          <button className="primary-button" type="button" onClick={() => closeRestoration(true)}>{lang === 'ar' ? 'شاهد ما تتذكره الدار' : 'See what the House remembers'}</button>
        </Modal>
      )}
    </div>
  );
}

function ResourceChip({ icon, value, label, prefix = '' }: { icon: string; value: number; label: string; prefix?: string }) {
  return <span className="resource-chip"><i aria-hidden="true">{icon}</i><bdi>{prefix}{formatResource(value)}</bdi><small>{label}</small></span>;
}

function DarknessMeter({ state, lang }: { state: GameState; lang: Language }) {
  const darkness = darknessPercent(state);
  const light = 100 - darkness;
  return (
    <section className="darkness-meter" aria-label={`${darkness}% ${lang === 'ar' ? 'ظلام' : 'Darkness'}`}>
      <span className="darkness-seal" aria-hidden="true">◐</span>
      <div><small>{state.ignoranceRevealed ? (lang === 'ar' ? 'قبضة الجهل' : 'Ignorance’s hold') : (lang === 'ar' ? 'ظلام بغداد' : 'Darkness over Baghdad')}</small><strong><bdi>{darkness}%</bdi></strong></div>
      <span className="darkness-track"><i style={{ width: `${light}%` }} /></span>
    </section>
  );
}

function MiniActivity({ state, lang, now, onOpen }: { state: GameState; lang: Language; now: number; onOpen: () => void }) {
  const activity = getActivity(state.activeActivityId);
  const timing = activityTiming(state, now);
  if (!activity || !timing) return null;
  return <button className="mini-activity" type="button" onClick={onOpen}><span><strong>{activity.name[lang]}</strong><small><bdi>{Math.ceil(timing.remainingMs / 1_000)}s</bdi></small></span><i><b style={{ width: `${timing.percent}%` }} /></i></button>;
}

function House({ state, lang, now, recommendation, memoriesExpanded, onToggleMemories, onBegin, onGuide, onSkipGuidance, onWork, onKnowledge, onSatchel, onRepair }: {
  state: GameState; lang: Language; now: number; recommendation: Destination; memoriesExpanded: boolean;
  onToggleMemories: () => void; onBegin: () => void; onGuide: () => void; onSkipGuidance: () => void;
  onWork: () => void; onKnowledge: () => void; onSatchel: () => void; onRepair: () => void;
}) {
  if (!state.started) return <OpeningComic lang={lang} onBegin={onBegin} />;
  return (
    <section className="house-screen screen-section">
      <div className="section-heading compact-heading"><div><p className="eyebrow">{lang === 'ar' ? 'الفصل الأول' : 'Chapter One'}</p><h1>{lang === 'ar' ? 'الكلمة الأولى' : 'The First Word'}</h1></div><p>{lang === 'ar' ? 'لا يطلع الفجر على بغداد. أعد المعنى، وانشر المعرفة، وأعد النور.' : 'Dawn no longer comes to Baghdad. Restore meaning, circulate knowledge, and bring back the light.'}</p></div>
      <HouseScene state={state} lang={lang} recommendation={recommendation} onGuide={onGuide} />
      {!state.tutorialSkipped && state.tutorialStep !== 'complete' && <button className="skip-guidance" type="button" onClick={onSkipGuidance}>{lang === 'ar' ? 'تخطَّ الإرشاد' : 'Skip guidance'}</button>}
      <div className="house-actions">
        <article className="action-panel current-work">
          <p className="eyebrow">{lang === 'ar' ? 'العمل الجاري' : 'Current work'}</p>
          {state.activeActivityId ? <ActivityTimer state={state} activity={getActivity(state.activeActivityId)} lang={lang} now={now} /> : <p>{lang === 'ar' ? 'يشير الشبح إلى المخطوطة. ابدأ من هناك.' : 'The ghost is pointing toward the manuscript. Begin there.'}</p>}
          <button className="secondary-button" type="button" onClick={state.tutorialStep === 'inspect-manuscript' ? onGuide : onWork}>{state.tutorialStep === 'inspect-manuscript' ? (lang === 'ar' ? 'افحص المخطوطة' : 'Inspect the manuscript') : (lang === 'ar' ? 'افتح العمل' : 'Open Work')}</button>
        </article>
        {!state.ghostIdentityRevealed ? (
          <article className="action-panel manuscript-callout">
            <span className="panel-icon" aria-hidden="true">▤</span><div><p className="eyebrow">{lang === 'ar' ? 'المخطوطة الممزقة' : 'The torn manuscript'}</p><h2>{objective(state, lang)}</h2><p>{lang === 'ar' ? 'كل فهم جديد يعيد جزءاً من صوت الحارس المجهول.' : 'Each insight restores another part of the unknown guardian’s voice.'}</p></div>
            <button className="primary-button" type="button" onClick={recommendation === 'knowledge' ? onKnowledge : onWork}>{recommendation === 'knowledge' ? (lang === 'ar' ? 'افتح المعرفة' : 'Open Knowledge') : (lang === 'ar' ? 'واصل العمل' : 'Continue the work')}</button>
          </article>
        ) : <DeskRecipe state={state} lang={lang} onRepair={onRepair} onSatchel={onSatchel} repairable={canRepairDesk(state)} />}
      </div>
      <HouseMemories state={state} lang={lang} expanded={memoriesExpanded} onToggle={onToggleMemories} />
    </section>
  );
}

function OpeningComic({ lang, onBegin }: { lang: Language; onBegin: () => void }) {
  return (
    <section className="opening-screen">
      <div className="opening-copy"><p className="eyebrow">{lang === 'ar' ? 'مدينة بلا فجر' : 'A city without dawn'}</p><h1>{lang === 'ar' ? 'ظلام يغطي بغداد.' : 'Darkness covers Baghdad.'}</h1><p>{lang === 'ar' ? 'جاء باحث مجهول يطلب المعرفة، فوجد مدينة لم يطلع عليها الفجر وداراً أُسكتت كتبها وأصواتها.' : 'A nameless researcher came seeking knowledge and found a city where dawn never comes—and a House whose books and voices had been silenced.'}</p></div>
      <ComicPanels lang={lang} />
      <div className="quest-promise"><span aria-hidden="true">✦</span><div><small>{lang === 'ar' ? 'مهمتك' : 'Your quest'}</small><strong>{lang === 'ar' ? 'أعد النور إلى بغداد' : 'Bring light back to Baghdad'}</strong></div></div>
      <button className="primary-button opening-button" type="button" onClick={onBegin}>{lang === 'ar' ? 'ادخل الدار' : 'Enter the House'}</button>
    </section>
  );
}

function ComicPanels({ lang }: { lang: Language }) {
  const panels = lang === 'ar' ? [
    'لم يطلع الفجر على بغداد منذ زمن أطول من ذاكرة أهلها.',
    'ابتلعت العتمة المصابيح، ثم الكتب والأصوات والروابط بين الأفكار.',
    'بقي حارس واحد، لكن العتمة كسرت كلماته.',
    'المخطوطة تعيد المعنى. المطرقة تعيد موضعه. ومنهما يبدأ النور.',
  ] : [
    'No dawn has come to Baghdad for longer than its people can remember.',
    'The Darkness swallowed its lamps, then its books, voices, and the paths between ideas.',
    'One guardian remained—but the Darkness had broken his words.',
    'The manuscript restores meaning. The hammer restores its home. Light begins with both.',
  ];
  return (
    <div className="comic-book" aria-label={lang === 'ar' ? 'أربع لوحات تروي بداية الرحلة' : 'Four panels telling the beginning of the quest'}>
      {panels.map((caption, index) => <figure className={`comic-panel comic-panel-${index + 1}`} key={caption}><div className="comic-art" aria-hidden="true" /><figcaption><bdi>{caption}</bdi></figcaption>{index === 2 && <blockquote>{lang === 'ar' ? 'ا— ــر... الـــ؟' : 'R—d… th—?'}</blockquote>}<span>{String(index + 1).padStart(2, '0')}</span></figure>)}
    </div>
  );
}

function guideButtonLabel(state: GameState, lang: Language, destination: Destination) {
  const ar = lang === 'ar';
  if (state.tutorialStep === 'inspect-manuscript') return ar ? 'افحص المخطوطة' : 'Inspect the manuscript';
  if (state.tutorialStep === 'first-reward') return ar ? 'شاهد العمل' : 'Watch the work';
  if (destination === 'knowledge') return ar ? 'افتح المعرفة' : 'Open Knowledge';
  if (destination === 'work') return state.ghostIdentityRevealed ? (ar ? 'اجمع مواد الترميم' : 'Recover restoration materials') : (ar ? 'اعمل عند مكتب المخطوطات' : 'Work at the Manuscript Desk');
  if (destination === 'memories') return ar ? 'شاهد ما تتذكره الدار' : 'See what the House remembers';
  return ar ? 'راجع مشروع الترميم' : 'Review the restoration project';
}

function HouseScene({ state, lang, recommendation, onGuide }: { state: GameState; lang: Language; recommendation: Destination; onGuide: () => void }) {
  const dialogue = storyDialogue(state, lang);
  const salvage = state.activeActivityId === 'salvage-timber' || state.activeActivityId === 'sort-stone';
  const background = state.deskRepaired ? '/assets/v03/house-desk-restored-long-darkness.png' : '/assets/v03/house-ruin-long-darkness.png';
  return (
    <div className={`room-frame ${state.deskRepaired ? 'desk-restored' : 'room-ruin'} ${salvage ? 'researcher-salvaging' : ''}`}>
      <img className="room-background" src={background} alt={lang === 'ar' ? 'قاعة مهدمة تحت ظلام بغداد الدائم' : 'A ruined hall beneath Baghdad’s permanent Darkness'} />
      <div className="pixel-vignette" aria-hidden="true" />
      {!state.deskRepaired && <div className="ignorance-haze" aria-hidden="true"><i /><i /><i /><span>ا</span><span>؟</span><span>م</span></div>}
      {state.deskRepaired && <div className="named-shadow" aria-hidden="true"><i /><span>{lang === 'ar' ? 'الجهل' : 'IGNORANCE'}</span></div>}
      <img className="researcher-sprite" src="/assets/v03/researcher.png" alt={lang === 'ar' ? 'الباحث' : 'The researcher'} />
      <img className={`ghost-sprite ${state.ghostIdentityRevealed ? 'identity-revealed' : ''}`} src="/assets/v03/al-jahiz-ghost.png" alt={state.ghostIdentityRevealed ? (lang === 'ar' ? 'الجاحظ' : 'Al-Jahiz') : (lang === 'ar' ? 'شبح مجهول' : 'An unknown ghost')} />
      {dialogue && (
        <div className={`dialogue-panel speech-bubble ${dialogue.obscured ? 'obscured' : ''} voice-${dialogue.voice}`}>
          <div className="dialogue-speaker"><span>{dialogue.voice === 'researcher' ? '✦' : state.ghostIdentityRevealed ? 'ج' : '؟'}</span><div><small>{dialogue.voice === 'researcher' ? (lang === 'ar' ? 'أفكار' : 'Thought') : (lang === 'ar' ? 'المتحدث' : 'Speaker')}</small><strong>{dialogue.speaker}</strong></div></div>
          <blockquote>{dialogue.text}</blockquote><p>{dialogue.note}</p>
          <button className="bubble-action" type="button" onClick={onGuide}>{guideButtonLabel(state, lang, recommendation)}<span aria-hidden="true">←</span></button>
        </div>
      )}
      <span className="stage-label">{state.deskRepaired ? (lang === 'ar' ? 'المرحلة ١ · أول مصباح' : 'Stage 1 · The first lamp') : (lang === 'ar' ? 'المرحلة ٠ · ظلام بنسبة ١٠٠٪' : 'Stage 0 · 100% Darkness')}</span>
    </div>
  );
}

function DeskRecipe({ state, lang, onRepair, onSatchel, repairable }: { state: GameState; lang: Language; onRepair: () => void; onSatchel?: () => void; repairable: boolean }) {
  if (state.deskRepaired) return <article id="restoration-project" className="action-panel repaired-panel"><span className="panel-icon" aria-hidden="true">✦</span><div><p className="eyebrow">{lang === 'ar' ? 'اكتمل الترميم الأول' : 'First restoration complete'}</p><h2>{lang === 'ar' ? 'أُشعل أول مصباح' : 'The first lamp is lit'}</h2><p>{lang === 'ar' ? 'أصبح للمعرفة موضع، وتراجع ظلام بغداد إلى ٩٩٪.' : 'Knowledge has a working place, and Baghdad’s Darkness has fallen to 99%.'}</p></div></article>;
  return (
    <article id="restoration-project" className="action-panel desk-recipe">
      <div><p className="eyebrow">{lang === 'ar' ? 'مشروع الترميم الأول' : 'First restoration project'}</p><h2>{lang === 'ar' ? 'مكتب القيّم' : 'The Keeper’s Desk'}</h2><p>{lang === 'ar' ? 'قال الجاحظ إن المكتب كان قلب القاعة. أصلحه ليعمل أول مصباح من جديد.' : 'Al-Jahiz says the desk was the hall’s heart. Repair it so the first lamp can work again.'}</p></div>
      <div className="requirements"><Requirement icon="✦" current={state.knowledge} required={deskRequirements.knowledge} label={ui[lang].knowledge} /><Requirement icon="▰" current={state.materials.timber} required={deskRequirements.timber} label={ui[lang].timber} /><Requirement icon="◆" current={state.materials.stone} required={deskRequirements.stone} label={ui[lang].stone} /></div>
      <div className="panel-buttons"><button className="primary-button" type="button" disabled={!repairable} onClick={onRepair}>{repairable ? (lang === 'ar' ? 'رمّم المكتب' : 'Repair the desk') : (lang === 'ar' ? 'اجمع المتطلبات' : 'Gather requirements')}</button>{onSatchel && <button className="text-button" type="button" onClick={onSatchel}>{lang === 'ar' ? 'افتح الحقيبة' : 'Open Satchel'}</button>}</div>
    </article>
  );
}

function Requirement({ icon, current, required, label }: { icon: string; current: number; required: number; label: string }) {
  const complete = current + Number.EPSILON >= required;
  return <span className={complete ? 'complete' : ''}><i aria-hidden="true">{complete ? '✓' : icon}</i><bdi>{formatResource(Math.min(current, required))}/{required}</bdi><small>{label}</small></span>;
}

function Work({ state, lang, now, onSelect }: { state: GameState; lang: Language; now: number; onSelect: (id: string) => void }) {
  const study = activities.filter((activity) => activity.kind === 'study');
  const salvage = activities.filter((activity) => activity.kind === 'salvage');
  return (
    <section className="work-screen screen-section">
      <div className="section-heading"><div><p className="eyebrow">{lang === 'ar' ? 'اقرأ · افهم · اصنع' : 'Read · understand · make'}</p><h1>{lang === 'ar' ? 'العمل' : 'Work'}</h1></div><p>{lang === 'ar' ? 'كل محطة تحول الفهم إلى عمل. يستمر النشاط المختار تلقائياً حتى تختار غيره.' : 'Each station turns understanding into action. Your selected activity repeats until you choose another.'}</p></div>
      <div className="active-work-card"><p className="eyebrow">{lang === 'ar' ? 'العمل الجاري' : 'Current work'}</p><ActivityTimer state={state} activity={getActivity(state.activeActivityId)} lang={lang} now={now} large /></div>
      <ActivityGroup title={lang === 'ar' ? 'مكتب المخطوطات' : 'Manuscript Desk'} note={lang === 'ar' ? 'استعد صوت الحارس طبقة بعد طبقة.' : 'Restore the guardian’s voice one layer at a time.'} activities={study} state={state} lang={lang} onSelect={onSelect} />
      <ActivityGroup title={lang === 'ar' ? 'زاوية الإنقاذ' : 'Salvage Corner'} note={state.ghostIdentityRevealed ? (lang === 'ar' ? 'استخرج ما يحتاجه مكتب القيّم.' : 'Recover what the Keeper’s Desk requires.') : (lang === 'ar' ? 'اكشف هوية الحارس لفتح أعمال الإنقاذ.' : 'Reveal the guardian’s identity to unlock salvage work.')} activities={salvage} state={state} lang={lang} onSelect={onSelect} />
    </section>
  );
}

function ActivityGroup({ title, note, activities: group, state, lang, onSelect }: { title: string; note: string; activities: Activity[]; state: GameState; lang: Language; onSelect: (id: string) => void }) {
  return <section className="activity-group"><header><h2>{title}</h2><p>{note}</p></header><div className="activity-grid">{group.map((activity) => <ActivityCard key={activity.id} activity={activity} state={state} lang={lang} selected={state.activeActivityId === activity.id} onSelect={() => onSelect(activity.id)} />)}</div></section>;
}

function ActivityTimer({ state, activity, lang, now, large = false }: { state: GameState; activity: Activity | null; lang: Language; now: number; large?: boolean }) {
  if (!activity) return <p>{lang === 'ar' ? 'لا يوجد عمل جارٍ.' : 'No work is running.'}</p>;
  const timing = activityTiming(state, now);
  if (!timing) return null;
  const firstDiscovery = state.tutorialStep === 'first-reward' && activity.id === 'trace-letters';
  const knowledgeReward = activity.knowledge * knowledgeMultiplier(state, activity.discipline) + (firstDiscovery ? 7 : 0);
  const xpReward = activity.xp + (firstDiscovery ? 4 : 0);
  return <div className={`activity-timer ${large ? 'large' : ''}`}><div><strong>{activity.name[lang]}</strong><span><bdi>{formatDuration(activity.durationMs)}</bdi> · <bdi>{Math.max(0, Math.ceil(timing.remainingMs / 1_000))}s</bdi> {ui[lang].remaining}</span></div><div className="timer-track"><i style={{ width: `${timing.percent}%` }} /></div><div className="timer-rewards"><span><bdi>+{formatResource(knowledgeReward)}</bdi> ✦</span><span><bdi>+{xpReward}</bdi> XP</span>{firstDiscovery && <span>{lang === 'ar' ? 'مكافأة الاكتشاف الأول' : 'First discovery bonus'}</span>}{activity.timber ? <span><bdi>+{activity.timber}</bdi> ▰</span> : null}{activity.stone ? <span><bdi>+{activity.stone}</bdi> ◆</span> : null}</div></div>;
}

function ActivityCard({ activity, state, lang, selected, onSelect }: { activity: Activity; state: GameState; lang: Language; selected: boolean; onSelect: () => void }) {
  const available = activityAvailable(state, activity);
  const reason = !available ? activity.requiresIdentity && !state.ghostIdentityRevealed ? (lang === 'ar' ? 'اكشف هوية الحارس' : 'Reveal the guardian') : (lang === 'ar' ? `المستوى ${activity.minLevel}` : `Level ${activity.minLevel}`) : '';
  return <button className={`activity-card ${selected ? 'selected' : ''} ${available ? '' : 'locked'}`} type="button" disabled={!available || selected} onClick={onSelect}><span className="activity-icon" aria-hidden="true">{activity.kind === 'study' ? 'ا' : activity.timber ? '▰' : '◆'}</span><span className="activity-copy"><strong>{activity.name[lang]}</strong><small>{activity.description[lang]}</small></span><span className="activity-meta"><bdi>{formatDuration(activity.durationMs)}</bdi><small><bdi>+{formatResource(activity.knowledge)}</bdi> ✦ · <bdi>+{activity.xp}</bdi> XP</small></span><span className="activity-state">{selected ? ui[lang].active : available ? ui[lang].select : reason}</span></button>;
}

function Knowledge({ state, lang, onBuy }: { state: GameState; lang: Language; onBuy: (skill: LanguageSkill) => void }) {
  const progress = levelProgress(state.xp.language);
  return (
    <section className="knowledge-screen screen-section">
      <div className="section-heading"><div><p className="eyebrow">{lang === 'ar' ? 'ما تفهمه يغيّر ما تستطيع فعله' : 'Understanding changes what you can do'}</p><h1>{lang === 'ar' ? 'المعرفة' : 'Knowledge'}</h1></div><p>{lang === 'ar' ? 'اللغة هي الطريق الأول. كل فهم جديد يعيد حواراً أو ذاكرة أو طريقاً إلى علم آخر.' : 'Language is the first path. Each insight restores dialogue, memory, or a route into another discipline.'}</p></div>
      <div className="discipline-ledger"><span className="discipline-glyph" aria-hidden="true">ا</span><div><small>{lang === 'ar' ? 'اللغة والأدب' : 'Language & Literature'}</small><strong><bdi>{progress.currentLevel}</bdi></strong></div><div className="xp-meter"><span><i style={{ width: `${progress.percent}%` }} /></span><small><bdi>{progress.currentXp}</bdi> / <bdi>{progress.requiredXp ?? '—'}</bdi> XP</small></div></div>
      <div className="language-tree">{languageSkills.map((skill, index) => <div className="tree-segment" key={skill.id}>{index > 0 && index < 4 && <div className={`tree-connector ${hasSkill(state, languageSkills[index - 1].id) ? 'complete' : ''}`}><i /><span>◆</span><i /></div>}{index === 4 && <div className="future-split"><span>{lang === 'ar' ? 'يتفرع الطريق' : 'The path divides'}</span></div>}<SkillCard skill={skill} state={state} lang={lang} onBuy={() => onBuy(skill)} /></div>)}</div>
    </section>
  );
}

function SkillCard({ skill, state, lang, onBuy }: { skill: LanguageSkill; state: GameState; lang: Language; onBuy: () => void }) {
  const complete = hasSkill(state, skill.id);
  const requirements = skillRequirementsMet(state, skill);
  const available = skillAvailable(state, skill);
  const affordable = skill.cost !== null && state.knowledge + Number.EPSILON >= skill.cost;
  const guided = nextLanguageSkill(state)?.id === skill.id;
  const status = complete ? 'complete' : skill.kind === 'future' ? 'future' : requirements ? 'available' : 'locked';
  return <article className={`skill-node ${status} ${guided ? 'guided-node' : ''}`}><div className="skill-seal" aria-hidden="true">{complete ? '✓' : skill.kind === 'future' ? '◇' : 'ا'}</div><div className="skill-copy"><p className="eyebrow">{skill.eyebrow[lang]}</p><h2>{skill.name[lang]}</h2><p>{skill.description[lang]}</p></div><div className="skill-action">{complete ? <span className="complete-label">{lang === 'ar' ? 'مفهوم' : 'Understood'}</span> : skill.kind === 'future' ? <span className="future-label">{lang === 'ar' ? 'بعد الكلمة الأولى' : 'After The First Word'}</span> : available ? <button type="button" disabled={!affordable} onClick={onBuy}><span>{affordable ? (lang === 'ar' ? 'افهم' : 'Understand') : (lang === 'ar' ? 'اجمع المعرفة' : 'Gather Knowledge')}</span><bdi>{skill.cost} ✦</bdi></button> : <span className="locked-label">{lang === 'ar' ? `يتطلب المستوى ${skill.minLevel} والمسار السابق` : `Requires level ${skill.minLevel} and the previous insight`}</span>}</div></article>;
}

function HouseMemories({ state, lang, expanded, onToggle }: { state: GameState; lang: Language; expanded: boolean; onToggle: () => void }) {
  const entries = [
    { open: true, number: '01', title: { en: 'The City without Dawn', ar: 'المدينة بلا فجر' }, text: { en: 'Baghdad is covered by a Darkness that never lifts. The ruined House may be the first place from which light can return.', ar: 'يغطي بغداد ظلام لا ينقشع. قد تكون الدار المهدّمة أول موضع يعود منه النور.' } },
    { open: state.ghostIdentityRevealed, number: '02', title: { en: 'A Name in the Margin', ar: 'اسم في الهامش' }, text: { en: 'The guardian is Al-Jahiz: writer, observer, and apparently an enemy of dignified silence.', ar: 'الحارس هو الجاحظ: كاتب ومراقب، ويبدو أنه عدو للصمت الوقور.' } },
    { open: state.prologueComplete, number: '03', title: { en: 'Ignorance Given Weight', ar: 'الجهل وقد صار له وزن' }, text: { en: 'The Darkness is Ignorance made physical. It separates minds, books, and ideas; circulating knowledge pushes it back.', ar: 'العتمة هي الجهل وقد صار مادياً. يفصل العقول والكتب والأفكار، ونشر المعرفة يدفعه إلى الوراء.' } },
  ];
  return (
    <section id="house-memories" className="memories-section">
      <button className="memories-heading" type="button" onClick={onToggle} aria-expanded={expanded}><span><small>{lang === 'ar' ? 'سجل القصة' : 'Story record'}</small><strong>{lang === 'ar' ? 'ما تتذكره الدار' : 'What the House Remembers'}</strong></span><b aria-hidden="true">{expanded ? '−' : '+'}</b></button>
      {expanded && <div className="journal-list">{entries.map((entry) => <article key={entry.number} className={entry.open ? 'open' : 'sealed'}><span>{entry.number}</span><div><p className="eyebrow">{entry.open ? (lang === 'ar' ? 'مستعاد' : 'Recovered') : (lang === 'ar' ? 'ممحو' : 'Erased')}</p><h2>{entry.open ? entry.title[lang] : '••••••••'}</h2><p>{entry.open ? entry.text[lang] : (lang === 'ar' ? 'أعد المزيد من ذاكرة الدار.' : 'Restore more of the House’s memory.')}</p></div></article>)}</div>}
      {expanded && state.prologueComplete && <article className="chapter-end"><p className="eyebrow">{lang === 'ar' ? 'نهاية المقدمة' : 'End of the prologue'}</p><h2>{lang === 'ar' ? 'لم تُهجر الدار. لقد أُسكتت.' : 'The House was not abandoned. It was silenced.'}</h2><p>{lang === 'ar' ? 'عاد مصباح واحد. لاستعادة المدينة، يجب أن تنتقل المعرفة من يد إلى يد.' : 'One lamp has returned. To restore the city, knowledge must move from hand to hand.'}</p><DarknessMeter state={state} lang={lang} /></article>}
    </section>
  );
}

function SatchelDrawer({ state, lang, onClose, onRepair }: { state: GameState; lang: Language; onClose: () => void; onRepair: () => void }) {
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="satchel-drawer" role="dialog" aria-modal="true" aria-label={lang === 'ar' ? 'الحقيبة' : 'Satchel'}><header><div><p className="eyebrow">{lang === 'ar' ? 'ما حملته وما أنقذته' : 'What you carried and recovered'}</p><h1>{lang === 'ar' ? 'الحقيبة' : 'Satchel'}</h1></div><button type="button" onClick={onClose} aria-label={lang === 'ar' ? 'أغلق' : 'Close'}>×</button></header><div className="inventory-grid">{state.inventory.map((id) => { const copy = inventoryCopy[id] ?? { title: { en: id, ar: id }, note: { en: '', ar: '' }, icon: '◇' }; return <article className="inventory-item" key={id}><span aria-hidden="true">{copy.icon}</span><small>{copy.note[lang]}</small><h2>{copy.title[lang]}</h2></article>; })}</div><section className="material-ledger"><h2>{lang === 'ar' ? 'المواد المستخرجة' : 'Recovered materials'}</h2><div><ResourceChip icon="▰" value={state.materials.timber} label={ui[lang].timber} /><ResourceChip icon="◆" value={state.materials.stone} label={ui[lang].stone} /></div></section>{state.ghostIdentityRevealed && <DeskRecipe state={state} lang={lang} onRepair={onRepair} repairable={canRepairDesk(state)} />}</aside></div>;
}

function Modal({ children, onClose, wide = false }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className={`modal-card ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true">{children}</div></div>;
}
