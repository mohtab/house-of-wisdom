import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  LEGACY_SAVE_KEY,
  SAVE_KEY,
  acknowledgeOffline,
  activities,
  activityAvailable,
  activityTiming,
  advanceGame,
  beginKindi,
  buyResearch,
  chooseKindiPlaintext,
  chooseKindiSubstitution,
  chooseKindiSymbol,
  compareKindiFrequency,
  createInitialState,
  getActivity,
  hasResearch,
  houseStage,
  knowledgeMultiplier,
  levelForXp,
  levelProgress,
  loadGame,
  objective,
  researchAvailable,
  researchNodes,
  researchRequirementsMet,
  selectActivity,
  serializeGame,
  setLanguage,
  startGame,
  type Activity,
  type AdvanceSummary,
  type Discipline,
  type GameState,
  type Language,
  type ResearchNode,
} from './game';

type Tab = 'house' | 'study' | 'research' | 'library';

const ui = {
  en: {
    house: 'House', study: 'Study', research: 'Research', library: 'Library', knowledge: 'Knowledge',
    objective: 'Current thread', total: 'Total time', remaining: 'remaining', level: 'Level', reward: 'Each completion',
  },
  ar: {
    house: 'الدار', study: 'الدراسة', research: 'البحث', library: 'المكتبة', knowledge: 'المعرفة',
    objective: 'المسار الحالي', total: 'المدة', remaining: 'متبقية', level: 'المستوى', reward: 'مكافأة كل دورة',
  },
};

const manuscriptCopy: Record<string, { title: Record<Language, string>; note: Record<Language, string> }> = {
  'damaged-folio': {
    title: { en: 'Damaged Mathematical Folio', ar: 'صحيفة رياضية تالفة' },
    note: { en: 'The House’s single surviving work', ar: 'آخر ما بقي من كتب الدار' },
  },
  'mathematical-folio': {
    title: { en: 'Numerals in the Margins', ar: 'أرقام في الهوامش' },
    note: { en: 'Translation opens a path to Mathematics', ar: 'فتحت الترجمة طريقاً إلى الرياضيات' },
  },
  'preserved-folio': {
    title: { en: 'The Preserved Folio', ar: 'الصحيفة المحفوظة' },
    note: { en: 'The translators received first priority', ar: 'حصل المترجمون على الأولوية الأولى' },
  },
  'pattern-notes': {
    title: { en: 'Notes on Repeated Forms', ar: 'ملاحظات حول الأشكال المتكررة' },
    note: { en: 'The mathematicians received first priority', ar: 'حصل الرياضيون على الأولوية الأولى' },
  },
  'method-of-analysis': {
    title: { en: 'Al-Kindi: Method of Analysis', ar: 'الكندي: منهج التحليل' },
    note: { en: 'Permanent: +10% Knowledge from every discipline', ar: 'دائم: ١٠٪ معرفة إضافية من كل علم' },
  },
};

function readInitialSave() {
  const current = localStorage.getItem(SAVE_KEY);
  const legacy = current ? null : localStorage.getItem(LEGACY_SAVE_KEY);
  return loadGame(current ?? legacy, Date.now());
}

function formatKnowledge(value: number) {
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
  const [discipline, setDiscipline] = useState<Discipline>('translation');
  const [offline, setOffline] = useState<AdvanceSummary | null>(
    boot.summary && boot.summary.completions > 0 && boot.summary.elapsedMs >= 15_000 ? boot.summary : null,
  );
  const [restoration, setRestoration] = useState<'desk' | 'scriptorium' | null>(null);
  const visualNow = useVisualClock(Boolean(state.activeActivityId));
  const lang = state.language;
  const t = ui[lang];
  const stage = houseStage(state);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.title = lang === 'ar' ? 'بيت الحكمة — البداية' : 'House of Wisdom — Begin Again';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, serializeGame(state));
    if (boot.migrated) localStorage.removeItem(LEGACY_SAVE_KEY);
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
    const result: Tab[] = ['house'];
    if (state.started) result.push('study');
    if (state.knowledge >= 8 || state.research.length > 0) result.push('research');
    if (hasResearch(state, 'mathematics')) result.push('library');
    return result;
  }, [state.knowledge, state.research.length, state.started]);

  useEffect(() => {
    if (!tabs.includes(tab)) setTab('house');
  }, [tab, tabs]);

  const changeLanguage = () => {
    setState((current) => setLanguage(current, current.language === 'en' ? 'ar' : 'en', Date.now()));
  };

  const start = () => {
    setState((current) => startGame(current, Date.now()));
    setTab('study');
  };

  const purchase = (node: ResearchNode) => {
    if (!researchAvailable(state, node) || node.cost === null || state.knowledge < node.cost) return;
    setState((current) => buyResearch(current, node.id, Date.now()));
    if (node.id === 'mathematics') setDiscipline('mathematics');
    if (node.id === 'desk' || node.id === 'scriptorium') {
      setRestoration(node.id);
      setTab('house');
    }
  };

  const closeRestoration = () => {
    if (restoration === 'scriptorium') setState((current) => acknowledgeOffline(current, Date.now()));
    setRestoration(null);
  };

  const resetSession = () => {
    const message = lang === 'ar' ? 'هل تريد بدء جلسة جديدة؟ سيُحذف التقدم المحفوظ على هذا الجهاز.' : 'Begin a new session? This removes the progress saved on this device.';
    if (!window.confirm(message)) return;
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEGACY_SAVE_KEY);
    setState(createInitialState(Date.now(), lang));
    setTab('house');
    setDiscipline('translation');
    setOffline(null);
  };

  return (
    <div className={`app stage-theme-${stage}`}>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setTab('house')} aria-label={t.house}>
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span><small>بيت الحكمة</small><strong>House of Wisdom</strong></span>
        </button>
        <div className="header-actions">
          <button className="language-button" type="button" onClick={changeLanguage}>{lang === 'en' ? 'العربية' : 'English'}</button>
          <div className="knowledge-pill" aria-label={`${formatKnowledge(state.knowledge)} ${t.knowledge}`}>
            <span aria-hidden="true">✦</span>
            <bdi>{formatKnowledge(state.knowledge)}</bdi>
            <small>{t.knowledge}</small>
          </div>
        </div>
      </header>

      {state.started && (
        <div className="objective-strip">
          <span><small>{t.objective}</small><strong>{objective(state, lang)}</strong></span>
          {state.activeActivityId && <MiniActivity state={state} lang={lang} now={visualNow} onOpen={() => setTab('study')} />}
        </div>
      )}

      <main>
        {tab === 'house' && (
          <House
            state={state}
            lang={lang}
            now={visualNow}
            onStart={start}
            onStudy={() => setTab('study')}
            onResearch={() => setTab('research')}
          />
        )}
        {tab === 'study' && (
          <Study
            state={state}
            lang={lang}
            now={visualNow}
            discipline={discipline}
            onDiscipline={setDiscipline}
            onSelect={(id) => setState((current) => selectActivity(current, id, Date.now()))}
          />
        )}
        {tab === 'research' && <Research state={state} lang={lang} onBuy={purchase} />}
        {tab === 'library' && (
          <Library
            state={state}
            lang={lang}
            onBegin={() => setState((current) => beginKindi(current, Date.now()))}
            onSymbol={(symbol) => setState((current) => chooseKindiSymbol(current, symbol, Date.now()))}
            onCompare={() => setState((current) => compareKindiFrequency(current, Date.now()))}
            onSubstitution={(letter) => setState((current) => chooseKindiSubstitution(current, letter, Date.now()))}
            onPlaintext={(answer) => setState((current) => chooseKindiPlaintext(current, answer, Date.now()))}
          />
        )}
      </main>

      {tabs.length > 1 && (
        <nav className="navigation" aria-label={lang === 'ar' ? 'أقسام الدار' : 'House sections'}>
          {tabs.map((item) => (
            <button key={item} type="button" className={tab === item ? 'selected' : ''} onClick={() => setTab(item)}>
              <NavIcon tab={item} />
              <span>{t[item]}</span>
            </button>
          ))}
        </nav>
      )}

      <footer className="footer">
        <span>{lang === 'ar' ? 'البداية · الإصدار ٠٫٢' : 'The Beginning · v0.2'}</span>
        <button type="button" onClick={resetSession}>{lang === 'ar' ? 'جلسة جديدة' : 'New session'}</button>
      </footer>

      {offline && (
        <Modal onClose={() => setOffline(null)}>
          <div className="offline-seal" aria-hidden="true">⌛</div>
          <p className="eyebrow">{lang === 'ar' ? 'سجلّ العودة' : 'Return ledger'}</p>
          <h2>{lang === 'ar' ? 'واصلت الدار عملها' : 'The House kept working'}</h2>
          <p>{lang === 'ar' ? 'حُسب العمل بالوقت المسجّل، لا بعدد مرات تحديث الشاشة.' : 'Your work was calculated from recorded time, not from screen refreshes.'}</p>
          <div className="offline-rewards">
            <span><bdi>+{formatKnowledge(offline.knowledge)}</bdi><small>{t.knowledge}</small></span>
            <span><bdi>+{offline.xp}</bdi><small>XP</small></span>
            <span><bdi>{Math.round(offline.appliedElapsedMs / 60_000)}m</bdi><small>{lang === 'ar' ? 'محسوبة' : 'counted'}</small></span>
          </div>
          {offline.cappedMs > 0 && <p className="quiet">{lang === 'ar' ? 'بلغت مدة الغياب الحد الأقصى: ٨ ساعات.' : 'Away-time reached the 8-hour cap.'}</p>}
          <button className="primary-button" type="button" onClick={() => setOffline(null)}>{lang === 'ar' ? 'عد إلى الدار' : 'Return to the House'}</button>
        </Modal>
      )}

      {restoration && (
        <Modal onClose={closeRestoration}>
          <p className="eyebrow">{lang === 'ar' ? 'تغيّرت الدار' : 'The House changes'}</p>
          <HouseScene stage={restoration === 'desk' ? 1 : 3} compact />
          <h2>{restoration === 'desk'
            ? (lang === 'ar' ? 'عاد مكتب القيّم إلى الحياة' : 'The Keeper’s Desk lives again')
            : (lang === 'ar' ? 'فُتحت دار النسخ من جديد' : 'The Scriptorium reopens')}</h2>
          <p>{restoration === 'desk'
            ? (lang === 'ar' ? 'صار للمخطوطة موضع، وللحبر غاية.' : 'The manuscript has a place. The ink has a purpose.')
            : (lang === 'ar' ? 'سيستمر العمل حتى حين تغادر. عند عودتك تُحسب حتى ٨ ساعات من التقدم.' : 'Work now continues when you leave. On your return, up to 8 hours of progress is recorded.')}</p>
          <button className="primary-button" type="button" onClick={closeRestoration}>{lang === 'ar' ? 'تابع' : 'Continue'}</button>
        </Modal>
      )}
    </div>
  );
}

function NavIcon({ tab }: { tab: Tab }) {
  const paths: Record<Tab, ReactNode> = {
    house: <><path d="M4 11 12 4l8 7" /><path d="M6.5 10v9h11v-9M10 19v-5h4v5" /></>,
    study: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z" /><path d="M8 7h7M8 11h6M8 15h4" /></>,
    research: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6" /></>,
    library: <><path d="M4 19h16M6 17V7M10 17V5M14 17V8M18 17V4" /><path d="M5 7h2M9 5h2M13 8h2M17 4h2" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[tab]}</svg>;
}

function MiniActivity({ state, lang, now, onOpen }: { state: GameState; lang: Language; now: number; onOpen: () => void }) {
  const activity = getActivity(state.activeActivityId);
  const timing = activityTiming(state, now);
  if (!activity || !timing) return null;
  return (
    <button className="mini-activity" type="button" onClick={onOpen}>
      <span><i style={{ width: `${timing.percent}%` }} /></span>
      <small>{activity.name[lang]}</small>
      <bdi>{(timing.remainingMs / 1_000).toFixed(1)}s</bdi>
    </button>
  );
}

function House({ state, lang, now, onStart, onStudy, onResearch }: {
  state: GameState; lang: Language; now: number; onStart: () => void; onStudy: () => void; onResearch: () => void;
}) {
  const stage = houseStage(state);
  const stageNames = {
    en: ['Neglected room', 'Restored desk', 'Improving library', 'Restored Scriptorium'],
    ar: ['قاعة مهملة', 'مكتب مُرمّم', 'مكتبة تتحسّن', 'دار نسخ مُرمّمة'],
  };
  const canResearch = state.knowledge >= 8 || state.research.length > 0;
  return (
    <section className="house-screen">
      <HouseScene stage={stage} />
      {!state.started ? (
        <div className="opening-copy">
          <p className="eyebrow">{lang === 'ar' ? 'بغداد · بداية جديدة' : 'Baghdad · A beginning'}</p>
          <h1>{lang === 'ar' ? 'أنت القيّم الجديد على بيت الحكمة.' : 'You are the new Keeper of the House of Wisdom.'}</h1>
          <div className="opening-lines">
            <p>{lang === 'ar' ? 'كان العلماء يقطعون القارات ليحملوا المعرفة إلى هنا.' : 'Once, scholars crossed continents to bring knowledge here.'}</p>
            <p>{lang === 'ar' ? 'أما اليوم، فالرفوف شبه خالية.' : 'The shelves are almost empty.'}</p>
            <p>{lang === 'ar' ? 'لم يبقَ سوى مخطوطة واحدة.' : 'Only one manuscript remains.'}</p>
          </div>
          <div className="first-manuscript">
            <span className="folio-glyph" aria-hidden="true">⌑</span>
            <span><small>{lang === 'ar' ? 'المخطوطة الوحيدة' : 'The only manuscript'}</small><strong>{manuscriptCopy['damaged-folio'].title[lang]}</strong></span>
          </div>
          <button className="primary-button begin-button" type="button" onClick={onStart}>{lang === 'ar' ? 'ابدأ من جديد' : 'Begin again'}<span aria-hidden="true">→</span></button>
        </div>
      ) : (
        <div className="house-copy">
          <div>
            <p className="eyebrow">{lang === 'ar' ? `المرحلة ${stage + 1} من 4` : `Stage ${stage + 1} of 4`}</p>
            <h1>{stageNames[lang][stage]}</h1>
            <p>{stage === 0
              ? (lang === 'ar' ? 'أول سطر يتّضح. اجمع ما يكفي من المعرفة لتمنح العمل مكاناً يليق به.' : 'The first line is becoming clear. Gather enough Knowledge to give the work a proper place.')
              : stage === 1
                ? (lang === 'ar' ? 'عاد الحبر إلى المكتب، والأرقام في الهوامش تنتظر من يفهمها.' : 'Ink has returned to the desk. Numerals in the margins wait to be understood.')
                : stage === 2
                  ? (lang === 'ar' ? 'تمتلئ الرفوف ببطء، ويلتقي المترجمون بالرياضيين حول سؤال واحد.' : 'The shelves fill slowly. Translators and mathematicians now share one question.')
                  : (lang === 'ar' ? 'تعمل دار النسخ من جديد. هذه ليست نهاية الدار، بل أول صباح حقيقي لها.' : 'The Scriptorium works again. This is not the House’s end, but its first true morning.')}</p>
          </div>
          <div className="house-actions">
            <button className="primary-button" type="button" onClick={onStudy}>{lang === 'ar' ? 'اذهب إلى الدراسة' : 'Go to Study'}</button>
            {canResearch && !hasResearch(state, 'scriptorium') && <button className="secondary-button" type="button" onClick={onResearch}>{lang === 'ar' ? 'افتح مسار البحث' : 'Open Research'}</button>}
          </div>
          {state.activeActivityId && <HouseActivity state={state} lang={lang} now={now} />}
          {stage === 3 && (
            <div className="offline-note">
              <span aria-hidden="true">⌛</span>
              <div><strong>{lang === 'ar' ? 'العمل لا يتوقف عند إغلاق الكتاب' : 'The work continues when the book closes'}</strong><p>{lang === 'ar' ? 'يستخدم الحفظ المحلي التوقيت المسجّل لحساب ما يصل إلى ٨ ساعات عند عودتك.' : 'Your local save uses recorded timestamps to calculate up to 8 hours when you return.'}</p></div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function HouseActivity({ state, lang, now }: { state: GameState; lang: Language; now: number }) {
  const activity = getActivity(state.activeActivityId);
  const timing = activityTiming(state, now);
  if (!activity || !timing) return null;
  return (
    <div className="house-activity">
      <span className={`discipline-sigil ${activity.discipline}`} aria-hidden="true"><i>{activity.discipline === 'translation' ? 'أ' : '∴'}</i></span>
      <div><small>{lang === 'ar' ? 'يجري الآن' : 'Now studying'}</small><strong>{activity.name[lang]}</strong></div>
      <div className="house-activity-progress" dir="ltr"><i style={{ width: `${timing.percent}%` }} /></div>
      <bdi>{(timing.remainingMs / 1_000).toFixed(1)}s</bdi>
    </div>
  );
}

function HouseScene({ stage, compact = false }: { stage: number; compact?: boolean }) {
  return (
    <div className={`house-scene house-stage-${stage} ${compact ? 'compact' : ''}`}>
      <svg viewBox="0 0 1200 620" role="img" aria-label={`House restoration stage ${stage + 1}`}>
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#17333a" /><stop offset="1" stopColor="#21434a" /></linearGradient>
          <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#071820" /><stop offset="1" stopColor="#315765" /></linearGradient>
          <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1c76d" /><stop offset="1" stopColor="#b86e32" /></linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <pattern id="tiles" width="64" height="32" patternUnits="userSpaceOnUse"><path d="M0 16h64M32 0v32M0 0l32 16L64 0M0 32l32-16 32 16" fill="none" stroke="currentColor" strokeOpacity=".14" /></pattern>
        </defs>
        <rect width="1200" height="620" fill="url(#wall)" />
        <rect y="430" width="1200" height="190" fill="#162a2e" />
        <rect y="430" width="1200" height="190" fill="url(#tiles)" className="floor-tiles" />
        <path d="M390 430V230c0-116 94-210 210-210s210 94 210 210v200" fill="none" stroke="#081b20" strokeWidth="58" />
        <path d="M425 430V233c0-97 78-175 175-175s175 78 175 175v197" fill="url(#night)" stroke="#567178" strokeWidth="5" />
        <g className="stars" fill="#f4d999"><circle cx="520" cy="145" r="4" /><circle cx="670" cy="110" r="3" /><circle cx="715" cy="190" r="4" /><path d="m585 92 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" /></g>
        <g className="architecture" fill="none" stroke="#5a7778" strokeWidth="5"><path d="M94 86h210v344H94zM896 86h210v344H896z" /><path d="M114 114h170M916 114h170" /><path d="M78 430h242M880 430h242" /></g>
        <g className="neglect" fill="none" stroke="#0d2429" strokeWidth="8" strokeLinecap="round"><path d="m181 35-24 68 32 36-42 61" /><path d="m1040 31 15 70-38 42 31 63" /><path d="m358 360-45 27 31 43" /><path d="m839 350 42 34-26 46" /></g>
        <g className="dust" fill="#90a1a0"><circle cx="146" cy="460" r="5" /><circle cx="250" cy="505" r="3" /><circle cx="948" cy="474" r="5" /><circle cx="1080" cy="530" r="3" /></g>
        <g className="shelves" stroke="#6b442d" strokeWidth="12" fill="none"><path d="M112 140h175v268H112zM913 140h175v268H913z" /><path d="M112 230h175M112 318h175M913 230h175M913 318h175" /></g>
        <g className="books" stroke="#e2c28a" strokeWidth="15"><path d="M130 215v-48M153 215v-59M181 215v-42M216 215v-63M240 215v-50" /><path d="M933 304v-47M960 304v-60M988 304v-44M1020 304v-67M1050 304v-51" /><path d="M132 392v-45M158 392v-58M190 392v-41M932 392v-52M960 392v-46M991 392v-61" /></g>
        <g className="desk-scene">
          <path className="desk-top" d="M365 438h470l-30 58H395Z" fill="#6b4029" stroke="#2e211b" strokeWidth="8" />
          <path d="M421 488h36l-20 115h-35ZM744 488h36l20 115h-35Z" fill="#4d3024" />
          <path className="desk-damage" d="m580 438 28 28 34-28" fill="none" stroke="#221a17" strokeWidth="10" />
          <g className="folio" transform="translate(525 398) rotate(-3)"><path d="M0 0h152v82H0z" fill="#e9dcb5" stroke="#9f7747" strokeWidth="5" /><path d="M19 19h112M19 36h98M19 53h105" stroke="#7d5c3d" strokeWidth="4" /><path d="m111 12 18 18-18 18-18-18Z" fill="none" stroke="#b7853e" strokeWidth="3" /></g>
          <g className="ink" fill="#171d1f"><path d="M484 430h34l-5-39h-24z" /><path d="m502 391 19-36" stroke="#d0a85f" strokeWidth="5" /></g>
        </g>
        <g className="instrument" transform="translate(822 210)"><circle r="62" fill="none" stroke="#d0a85f" strokeWidth="8" /><circle r="39" fill="none" stroke="#d0a85f" strokeWidth="4" /><path d="M-54 0h108M0-54v108M-38-38l76 76M38-38l-76 76" stroke="#d0a85f" strokeWidth="3" /><circle r="8" fill="#d0a85f" /></g>
        <g className="scriptorium">
          <path d="M835 420h195l-20 34H855Z" fill="#77492d" /><path d="M880 454v112M980 454v112" stroke="#4d3024" strokeWidth="18" />
          <path d="M895 338h82v90h-82z" fill="none" stroke="#d0a85f" strokeWidth="7" /><path d="M884 338h104M907 316h58M936 316v-40" stroke="#d0a85f" strokeWidth="7" />
          <path d="M905 365h62M905 386h62" stroke="#e9dcb5" strokeWidth="8" />
        </g>
        <g className="warmth" opacity=".9"><ellipse cx="600" cy="430" rx="260" ry="120" fill="url(#warm)" opacity=".16" filter="url(#glow)" /><path d="m600 55 6 16 16 6-16 6-6 16-6-16-16-6 16-6Z" fill="#f1c76d" /></g>
        <path className="border-pattern" d="M18 18h1164v584H18z" fill="none" stroke="#c7a45d" strokeWidth="3" strokeDasharray="2 13" opacity=".7" />
      </svg>
      <div className="scene-caption"><span>{['I', 'II', 'III', 'IV'][stage]}</span></div>
    </div>
  );
}

function Study({ state, lang, now, discipline, onDiscipline, onSelect }: {
  state: GameState; lang: Language; now: number; discipline: Discipline; onDiscipline: (discipline: Discipline) => void; onSelect: (id: string) => void;
}) {
  const active = getActivity(state.activeActivityId);
  return (
    <section className="study-screen screen-section">
      <div className="section-heading">
        <div><p className="eyebrow">{lang === 'ar' ? 'حجرة العمل' : 'The workroom'}</p><h1>{lang === 'ar' ? 'الدراسة' : 'Study'}</h1></div>
        <p>{lang === 'ar' ? 'كل نشاط يتكرر تلقائياً. يمكنك تغيير النشاط متى شئت.' : 'Every activity repeats automatically. Change the work whenever you choose.'}</p>
      </div>
      {active && <ActivityTimer state={state} activity={active} lang={lang} now={now} />}
      <div className="discipline-tabs" role="tablist" aria-label={lang === 'ar' ? 'العلوم' : 'Disciplines'}>
        <button type="button" role="tab" aria-selected={discipline === 'translation'} className={discipline === 'translation' ? 'selected translation' : 'translation'} onClick={() => onDiscipline('translation')}><span>أ</span><b>{lang === 'ar' ? 'الترجمة' : 'Translation'}</b><small>{lang === 'ar' ? 'الكلمة' : 'The word'}</small></button>
        <button type="button" role="tab" aria-selected={discipline === 'mathematics'} disabled={!hasResearch(state, 'mathematics')} className={discipline === 'mathematics' ? 'selected mathematics' : 'mathematics'} onClick={() => onDiscipline('mathematics')}><span>∴</span><b>{lang === 'ar' ? 'الرياضيات' : 'Mathematics'}</b><small>{hasResearch(state, 'mathematics') ? (lang === 'ar' ? 'البرهان' : 'The proof') : (lang === 'ar' ? 'مغلق' : 'Locked')}</small></button>
        <button type="button" role="tab" disabled className="astronomy"><span>✦</span><b>{lang === 'ar' ? 'علم الفلك' : 'Astronomy'}</b><small>{lang === 'ar' ? 'لاحقاً' : 'Ahead'}</small></button>
      </div>
      <div className={`activity-list discipline-${discipline}`}>
        {activities.filter((activity) => activity.discipline === discipline).map((activity) => (
          <ActivityCard key={activity.id} activity={activity} state={state} lang={lang} selected={state.activeActivityId === activity.id} onSelect={() => onSelect(activity.id)} />
        ))}
        {discipline === 'astronomy' && <div className="teaser-card"><span>✦</span><h3>{lang === 'ar' ? 'المرصد ما زال مظلماً' : 'The Observatory remains dark'}</h3><p>{lang === 'ar' ? 'يظهر هذا الطريق بعد اكتمال الجلسة الأولى.' : 'This path begins beyond the first-session slice.'}</p></div>}
      </div>
    </section>
  );
}

function ActivityTimer({ state, activity, lang, now }: { state: GameState; activity: Activity; lang: Language; now: number }) {
  const timing = activityTiming(state, now)!;
  const xp = levelProgress(state.xp[activity.discipline]);
  const reward = activity.knowledge * knowledgeMultiplier(state, activity.discipline);
  const recentReward = state.lastReward?.activityId === activity.id && now - state.lastReward.at < 1_800 ? state.lastReward : null;
  return (
    <article className={`activity-timer ${activity.discipline}`}>
      <div className="timer-topline">
        <span className="discipline-sigil" aria-hidden="true"><i>{activity.discipline === 'translation' ? 'أ' : '∴'}</i></span>
        <div><p className="eyebrow">{lang === 'ar' ? 'النشاط الجاري · تكرار تلقائي' : 'Active work · auto-repeat'}</p><h2>{activity.name[lang]}</h2></div>
        <div className="remaining-time"><bdi>{(timing.remainingMs / 1_000).toFixed(1)}s</bdi><small>{lang === 'ar' ? 'متبقية' : 'remaining'}</small></div>
      </div>
      <div className="timer-track" dir="ltr"><i style={{ transform: `scaleX(${timing.percent / 100})` }} /><span className="timer-glint" style={{ insetInlineStart: `${timing.percent}%` }} /></div>
      <div className="timer-details">
        <div><small>{ui[lang].total}</small><strong><bdi>{formatDuration(activity.durationMs)}</bdi></strong></div>
        <div><small>{ui[lang].reward}</small><strong><bdi>+{formatKnowledge(reward)} ✦ · +{activity.xp} XP</bdi></strong></div>
        <div className="level-detail"><small>{lang === 'ar' ? `${ui[lang].level} ${xp.currentLevel}` : `${ui[lang].level} ${xp.currentLevel}`}</small><strong>{lang === 'ar' ? (activity.discipline === 'translation' ? 'الترجمة' : 'الرياضيات') : activity.discipline[0].toUpperCase() + activity.discipline.slice(1)}</strong><span dir="ltr"><i style={{ width: `${xp.percent}%` }} /></span><em><bdi>{xp.requiredXp === null ? 'MAX' : `${xp.currentXp} / ${xp.requiredXp} XP`}</bdi></em></div>
      </div>
      {recentReward && <div className="reward-bloom" aria-live="polite"><span>+{formatKnowledge(recentReward.knowledge)} ✦</span><span>+{recentReward.xp} XP</span></div>}
    </article>
  );
}

function ActivityCard({ activity, state, lang, selected, onSelect }: { activity: Activity; state: GameState; lang: Language; selected: boolean; onSelect: () => void }) {
  const available = activityAvailable(state, activity);
  const reward = activity.knowledge * knowledgeMultiplier(state, activity.discipline);
  return (
    <button type="button" className={`activity-card ${selected ? 'selected' : ''} ${available ? '' : 'locked'}`} disabled={!available || selected} onClick={onSelect}>
      <span className="activity-number">{String(activities.filter((candidate) => candidate.discipline === activity.discipline).indexOf(activity) + 1).padStart(2, '0')}</span>
      <span className="activity-card-copy"><strong>{activity.name[lang]}</strong><small>{activity.description[lang]}</small></span>
      <span className="activity-yield"><bdi>{formatDuration(activity.durationMs)}</bdi><small><bdi>+{formatKnowledge(reward)} ✦ · +{activity.xp} XP</bdi></small></span>
      <span className="activity-state">{selected ? (lang === 'ar' ? 'جارٍ الآن' : 'Active') : available ? (lang === 'ar' ? 'ابدأ' : 'Select') : `${lang === 'ar' ? 'المستوى' : 'Level'} ${activity.minLevel}`}</span>
    </button>
  );
}

function Research({ state, lang, onBuy }: { state: GameState; lang: Language; onBuy: (node: ResearchNode) => void }) {
  const node = (id: string) => researchNodes.find((candidate) => candidate.id === id)!;
  return (
    <section className="research-screen screen-section">
      <div className="section-heading">
        <div><p className="eyebrow">{lang === 'ar' ? 'هوامش تتّصل' : 'Margins connect'}</p><h1>{lang === 'ar' ? 'مسار البحث' : 'Research path'}</h1></div>
        <p>{lang === 'ar' ? 'أنفق المعرفة لترميم الدار وربط العلوم. يظهر كل اكتشاف في موضعه.' : 'Spend Knowledge to restore the House and connect its disciplines. Every discovery has a place.'}</p>
      </div>
      <div className="research-map">
        <ResearchCard node={node('desk')} state={state} lang={lang} onBuy={onBuy} />
        <Connector complete={hasResearch(state, 'desk')} />
        <ResearchCard node={node('mathematics')} state={state} lang={lang} onBuy={onBuy} />
        <Connector complete={hasResearch(state, 'mathematics')} />
        <div className="choice-frame">
          <div className="choice-heading"><span>{lang === 'ar' ? 'اختيارك الأول' : 'Your first priority'}</span><small>{lang === 'ar' ? 'يمكن فتح المسار الآخر بعد ترميم دار النسخ.' : 'The other path reopens after the Scriptorium.'}</small></div>
          <div className="choice-branches">
            <ResearchCard node={node('preserve')} state={state} lang={lang} onBuy={onBuy} compact />
            <span className="or-seal">{lang === 'ar' ? 'أو' : 'OR'}</span>
            <ResearchCard node={node('follow')} state={state} lang={lang} onBuy={onBuy} compact />
          </div>
        </div>
        <Connector complete={hasResearch(state, 'preserve') || hasResearch(state, 'follow')} />
        <ResearchCard node={node('language')} state={state} lang={lang} onBuy={onBuy} />
        <Connector complete={state.kindi.complete} />
        <ResearchCard node={node('scriptorium')} state={state} lang={lang} onBuy={onBuy} />
        <Connector complete={hasResearch(state, 'scriptorium')} />
        <ResearchCard node={node('heavens')} state={state} lang={lang} onBuy={onBuy} />
      </div>
    </section>
  );
}

function Connector({ complete }: { complete: boolean }) {
  return <div className={`research-connector ${complete ? 'complete' : ''}`} aria-hidden="true"><i /><span>◆</span><i /></div>;
}

function researchLockText(state: GameState, node: ResearchNode, lang: Language) {
  if (node.kind === 'teaser') return lang === 'ar' ? 'مسار قادم' : 'Future path';
  if (node.choiceGroup && researchNodes.some((candidate) => candidate.choiceGroup === node.choiceGroup && candidate.id !== node.id && hasResearch(state, candidate.id)) && !hasResearch(state, 'scriptorium')) {
    return lang === 'ar' ? 'بعد دار النسخ' : 'After Scriptorium';
  }
  if (node.requiresKindiComplete && !state.kindi.complete) return lang === 'ar' ? 'أكمل سجلّ الكندي' : 'Complete Al-Kindi';
  if (node.requiresLevels) {
    const missing = Object.entries(node.requiresLevels).filter(([discipline, required]) => levelForXp(state.xp[discipline as Discipline]) < Number(required));
    if (missing.length) return missing.map(([discipline, required]) => `${lang === 'ar' ? (discipline === 'translation' ? 'الترجمة' : 'الرياضيات') : discipline} ${lang === 'ar' ? 'م' : 'Lv'} ${required}`).join(' · ');
  }
  return lang === 'ar' ? 'أكمل المسار السابق' : 'Complete the path above';
}

function ResearchCard({ node, state, lang, onBuy, compact = false }: { node: ResearchNode; state: GameState; lang: Language; onBuy: (node: ResearchNode) => void; compact?: boolean }) {
  const complete = hasResearch(state, node.id);
  const requirements = researchRequirementsMet(state, node);
  const available = researchAvailable(state, node);
  const affordable = node.cost !== null && state.knowledge + Number.EPSILON >= node.cost;
  const status = complete ? 'complete' : node.kind === 'teaser' ? 'teaser' : requirements ? 'available' : 'locked';
  return (
    <article className={`research-node ${status} ${compact ? 'compact' : ''}`}>
      <div className="node-seal" aria-hidden="true">{complete ? '✓' : node.kind === 'chronicle' ? '⌘' : node.kind === 'restoration' ? '⌂' : node.kind === 'choice' ? '◇' : '✦'}</div>
      <div className="node-copy"><p className="eyebrow">{node.eyebrow[lang]}</p><h2>{node.name[lang]}</h2><p>{node.description[lang]}</p></div>
      <div className="node-action">
        {complete ? <span className="completed-label">{lang === 'ar' ? 'مكتمل' : 'Complete'}</span>
          : available ? <button type="button" disabled={!affordable} onClick={() => onBuy(node)}><span>{affordable ? (lang === 'ar' ? 'اكتشف' : 'Discover') : (lang === 'ar' ? 'اجمع المزيد' : 'Gather more')}</span><bdi>{node.cost} ✦</bdi></button>
            : <span className="locked-label">{researchLockText(state, node, lang)}</span>}
      </div>
    </article>
  );
}

function Library({ state, lang, onBegin, onSymbol, onCompare, onSubstitution, onPlaintext }: {
  state: GameState; lang: Language; onBegin: () => void; onSymbol: (symbol: string) => void; onCompare: () => void; onSubstitution: (letter: string) => void; onPlaintext: (answer: string) => void;
}) {
  return (
    <section className="library-screen screen-section">
      <div className="section-heading">
        <div><p className="eyebrow">{lang === 'ar' ? 'ما حفظته الدار' : 'What the House preserves'}</p><h1>{lang === 'ar' ? 'المكتبة والسجلّات' : 'Library & Chronicles'}</h1></div>
        <p>{lang === 'ar' ? 'كل مخطوطة هنا علامة على فهمٍ اكتسبته، لا مجرد شيء جمعته.' : 'Each manuscript marks an idea understood—not merely an object collected.'}</p>
      </div>
      <div className="library-shelf">
        {state.manuscripts.map((id, index) => {
          const copy = manuscriptCopy[id] ?? { title: { en: id, ar: id }, note: { en: '', ar: '' } };
          return <article className={`manuscript ${id === 'method-of-analysis' ? 'major' : ''}`} key={id}><span className="manuscript-number">{String(index + 1).padStart(2, '0')}</span><div className="manuscript-diagram" aria-hidden="true"><i /><i /><i /></div><small>{copy.note[lang]}</small><h3>{copy.title[lang]}</h3></article>;
        })}
      </div>
      <KindiChronicle state={state} lang={lang} onBegin={onBegin} onSymbol={onSymbol} onCompare={onCompare} onSubstitution={onSubstitution} onPlaintext={onPlaintext} />
      <article className="future-chronicle"><span>✦</span><div><p className="eyebrow">{lang === 'ar' ? 'سجلّ مستقبلي' : 'A future Chronicle'}</p><h3>{lang === 'ar' ? 'البتّاني — جداول السماء' : 'Al-Battani — Tables of the Sky'}</h3><p>{lang === 'ar' ? 'سيظهر بعد فتح المرصد. ليس جزءاً من هذه الجلسة.' : 'It will emerge with the Observatory. It is not part of this session.'}</p></div></article>
    </section>
  );
}

const cipherSymbols = ['◆', '○', '△', '◆', '□', '◆', '◇', '◆', '△', '○', '◆', '◆', '□', '△', '◆'];

function KindiChronicle({ state, lang, onBegin, onSymbol, onCompare, onSubstitution, onPlaintext }: {
  state: GameState; lang: Language; onBegin: () => void; onSymbol: (symbol: string) => void; onCompare: () => void; onSubstitution: (letter: string) => void; onPlaintext: (answer: string) => void;
}) {
  const phase = state.kindi.phase;
  return (
    <article className={`kindi-chronicle phase-${phase}`}>
      <header className="chronicle-header">
        <div className="kindi-portrait" aria-hidden="true"><span>ك</span><i /></div>
        <div><p className="eyebrow">{lang === 'ar' ? 'سجلّ رئيسي · علم التعمية' : 'Major Chronicle · Cryptanalysis'}</p><h2>{lang === 'ar' ? 'الكندي — الشفرة' : 'Al-Kindi — The Cipher'}</h2><p>{lang === 'ar' ? 'لا تخمّن الرسالة. ابحث عن النمط الذي تركته اللغة وراءها.' : 'Do not guess the message. Find the pattern the language left behind.'}</p></div>
        <span className="chronicle-status">{state.kindi.complete ? (lang === 'ar' ? 'مكتمل' : 'Complete') : state.kindi.unlocked ? (lang === 'ar' ? 'متاح' : 'Available') : (lang === 'ar' ? 'مختوم' : 'Sealed')}</span>
      </header>
      {!state.kindi.unlocked && <div className="chronicle-locked"><span aria-hidden="true">⌘</span><p>{lang === 'ar' ? 'ابحث في «أنماط في اللغة» لفتح هذا السجلّ.' : 'Research “Patterns in Language” to open this Chronicle.'}</p></div>}
      {phase === 'intro' && (
        <div className="chronicle-step intro-step">
          <p className="step-number">I</p><h3>{lang === 'ar' ? 'رسالة بلا مفتاح' : 'A message without a key'}</h3>
          <p>{lang === 'ar' ? 'بين أوراق المترجمين رسالة مشفّرة. يبيّن الكندي أن تكرار الرموز يكشف خصائص اللغة نفسها. ستستخدم الملاحظة، ثم الفرضية، ثم الدليل.' : 'A ciphered note lies among the translators’ papers. Al-Kindi shows that repeated symbols reveal the habits of language itself. You will use observation, then a hypothesis, then evidence.'}</p>
          <button className="primary-button" type="button" onClick={onBegin}>{lang === 'ar' ? 'افحص الرسالة' : 'Examine the message'}</button>
        </div>
      )}
      {phase === 'frequency' && (
        <div className="chronicle-step">
          <StepHeading number="I" title={lang === 'ar' ? 'اعثر على الرمز الأكثر تكراراً' : 'Find the most repeated symbol'} note={lang === 'ar' ? 'انقر كل ظهور لرمز واحد بعد أن تعدّه.' : 'Count, then select one occurrence of the symbol.'} />
          <div className="cipher-line" dir="ltr">{cipherSymbols.map((symbol, index) => <button type="button" key={`${symbol}-${index}`} className={state.kindi.selectedSymbol === symbol ? 'attempted' : ''} onClick={() => onSymbol(symbol)}>{symbol}</button>)}</div>
          {state.kindi.selectedSymbol && state.kindi.selectedSymbol !== '◆' && <p className="gentle-hint">{lang === 'ar' ? 'يظهر رمز آخر مرات أكثر. عدّ الأشكال المعيّنة.' : 'Another mark appears more often. Count the solid shapes.'}</p>}
        </div>
      )}
      {phase === 'comparison' && (
        <div className="chronicle-step">
          <StepHeading number="II" title={lang === 'ar' ? 'قارن التكرار باللغة' : 'Compare frequency with language'} note={lang === 'ar' ? 'الرمز ◆ يشغل الحصة الأكبر من الرسالة، كما تفعل حروف شائعة في النص العادي.' : '◆ occupies the largest share of the message, as common letters do in ordinary text.'} />
          <div className="frequency-board">
            <FrequencyBar label="◆" value={53} note={lang === 'ar' ? 'في الرسالة' : 'in the cipher'} />
            <FrequencyBar label={lang === 'ar' ? 'ا' : 'E'} value={41} note={lang === 'ar' ? 'في نص عربي نموذجي' : 'in an example text'} />
            <FrequencyBar label={lang === 'ar' ? 'م' : 'T'} value={24} note={lang === 'ar' ? 'في نص عربي نموذجي' : 'in an example text'} />
          </div>
          <button className="primary-button" type="button" onClick={onCompare}>{lang === 'ar' ? 'اختبر فرضية' : 'Form a hypothesis'}</button>
        </div>
      )}
      {phase === 'substitution' && (
        <div className="chronicle-step">
          <StepHeading number="III" title={lang === 'ar' ? 'اختر بديلاً محتملاً' : 'Test a likely substitution'} note={lang === 'ar' ? 'إذا كان ◆ أكثر الرموز تكراراً، فأي حرف شائع قد يمثّل؟' : 'If ◆ is the most frequent symbol, which common letter might it represent?'} />
          <div className="substitution"><span>◆</span><b>→</b>{[
            { value: 'rare', en: 'Q', ar: 'ظ' }, { value: 'common', en: 'E', ar: 'ا' }, { value: 'other', en: 'M', ar: 'م' },
          ].map((choice) => <button type="button" key={choice.value} onClick={() => onSubstitution(choice.value)}>{choice[lang]}</button>)}</div>
          {state.kindi.substitution && state.kindi.substitution !== 'common' && <p className="gentle-hint">{lang === 'ar' ? 'اختر حرفاً يظهر كثيراً في اللغة اليومية.' : 'Try a letter that appears very often in ordinary language.'}</p>}
        </div>
      )}
      {phase === 'pattern' && (
        <div className="chronicle-step">
          <StepHeading number="IV" title={lang === 'ar' ? 'دع النمط يكشف المعنى' : 'Let the pattern reveal meaning'} note={lang === 'ar' ? 'ظهر الحرف الشائع في مواضعه. أي قراءة توافق النمط المتكرر؟' : 'The common letter is now visible. Which reading fits the repeated pattern?'} />
          <div className="partial-reveal" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{lang === 'ar' ? 'يرى الـقـيّـم الـنـمـط' : 'THE KEEPER SEES THE PATTERN'}</div>
          <div className="plaintext-options">
            <button type="button" onClick={() => onPlaintext('wrong-one')}>{lang === 'ar' ? 'يحفظ الناسخ كل كتاب' : 'THE SCRIBE HIDES THE VOLUME'}</button>
            <button type="button" onClick={() => onPlaintext('correct')}>{lang === 'ar' ? 'يرى القيّم النمط' : 'THE KEEPER SEES THE PATTERN'}</button>
            <button type="button" onClick={() => onPlaintext('wrong-two')}>{lang === 'ar' ? 'تُغلق الأبواب عند الغروب' : 'THE DOORS CLOSE AT SUNSET'}</button>
          </div>
        </div>
      )}
      {phase === 'complete' && (
        <div className="chronicle-complete">
          <div className="analysis-seal" aria-hidden="true"><span>◆</span><i /><i /><i /></div>
          <div><p className="eyebrow">{lang === 'ar' ? 'فهم دائم' : 'Permanent insight'}</p><h3>{lang === 'ar' ? 'منهج التحليل' : 'Method of Analysis'}</h3><p>{lang === 'ar' ? 'لم تكسر الشفرة بالحظ. لاحظت التكرار، وقارنته باللغة، واختبرت فرضية.' : 'You did not break the cipher by luck. You observed repetition, compared it with language, and tested a hypothesis.'}</p><strong><bdi>+10%</bdi> {lang === 'ar' ? 'إنتاج المعرفة من كل العلوم' : 'Knowledge production from every discipline'}</strong></div>
        </div>
      )}
    </article>
  );
}

function StepHeading({ number, title, note }: { number: string; title: string; note: string }) {
  return <div className="step-heading"><span>{number}</span><div><h3>{title}</h3><p>{note}</p></div></div>;
}

function FrequencyBar({ label, value, note }: { label: string; value: number; note: string }) {
  return <div className="frequency-bar"><b>{label}</b><span><i style={{ width: `${value}%` }} /></span><small>{note}</small></div>;
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-card" role="dialog" aria-modal="true">{children}</div></div>;
}
