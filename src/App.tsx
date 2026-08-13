import { useEffect, useMemo, useState } from 'react';
import { activities, activityAvailable, advance, buy, has, initial, level, nextKindi, nodeAvailable, nodes, objective, selectActivity, startKindi, type GameState, type Language } from './game';

const SAVE='house-of-wisdom-v01';
const labels={en:{house:'House',study:'Study',research:'Research',library:'Library',knowledge:'Knowledge'},ar:{house:'الدار',study:'الدراسة',research:'البحث',library:'المكتبة',knowledge:'المعرفة'}};

function load(){ try{ const raw=localStorage.getItem(SAVE); if(!raw)return {state:initial(),offline:null}; const parsed=JSON.parse(raw) as GameState; const r=advance(parsed); return {state:r.state,offline:r.summary.elapsed>15000?r.summary:null}; }catch{return {state:initial(),offline:null};} }

export default function App(){
  const loaded=useMemo(load,[]); const [state,setState]=useState(loaded.state); const [tab,setTab]=useState<'house'|'study'|'research'|'library'>('house'); const [offline,setOffline]=useState(loaded.offline); const lang=state.language; const t=labels[lang];
  useEffect(()=>{document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.documentElement.lang=lang},[lang]);
  useEffect(()=>{const id=setInterval(()=>setState(s=>advance(s).state),500);return()=>clearInterval(id)},[]);
  useEffect(()=>localStorage.setItem(SAVE,JSON.stringify(state)),[state]);
  useEffect(()=>{if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>undefined)},[]);
  const active=activities.find(a=>a.id===state.active); const progress=active?state.progressMs/active.intervalMs*100:0;
  return <div className="app">
    <header><div><small>بيت الحكمة</small><h1>House of Wisdom</h1></div><button className="lang" onClick={()=>setState(s=>({...s,language:s.language==='en'?'ar':'en'}))}>{lang==='en'?'العربية':'English'}</button><div className="pill">✦ {Math.floor(state.knowledge)} <small>{t.knowledge}</small></div></header>
    <div className="objective"><small>{lang==='ar'?'الهدف الحالي':'Current objective'}</small><strong>{objective(state,lang)}</strong></div>
    <main>
      {tab==='house'&&<House state={state} lang={lang}/>} 
      {tab==='study'&&<Study state={state} lang={lang} progress={progress} onSelect={id=>setState(s=>selectActivity(s,id))}/>} 
      {tab==='research'&&<Research state={state} lang={lang} onBuy={id=>setState(s=>buy(s,id))}/>} 
      {tab==='library'&&<Library state={state} lang={lang} onStart={()=>setState(startKindi)} onNext={()=>setState(nextKindi)}/>} 
    </main>
    <nav>{(['house','study','research','library'] as const).map(x=><button key={x} className={tab===x?'selected':''} onClick={()=>setTab(x)}>{t[x]}</button>)}</nav>
    {offline&&<div className="modal"><div><h2>{lang==='ar'?'بينما كنت بعيداً...':'While you were away...'}</h2><p>+{offline.knowledge} {t.knowledge} · +{offline.xp} XP</p><button onClick={()=>setOffline(null)}>{lang==='ar'?'عد إلى الدار':'Return to the House'}</button></div></div>}
  </div>
}

function House({state,lang}:{state:GameState;lang:Language}){ const stage=has(state,'observatory')?3:has(state,'scriptorium')?2:has(state,'desk')?1:0; return <section className="panel"><div className={`scene stage-${stage}`}><div className="stars">✦ · ✧ · ✦</div><div className="arch">⌂</div><div className="desk">▱</div><div className="books">▥</div>{stage>=3&&<div className="dome">◒</div>}</div><h2>{lang==='ar'?'الفصل الأول: الحارس':'Chapter One: The Keeper'}</h2><p>{lang==='ar'?'أعد بناء دار المعرفة، اكتشافاً بعد آخر.':'Rebuild the House of Knowledge, one discovery at a time.'}</p></section> }

function Study({state,lang,progress,onSelect}:{state:GameState;lang:Language;progress:number;onSelect:(id:string)=>void}){ return <section><h2>{lang==='ar'?'الدراسة':'Study'}</h2><div className="progress"><i style={{width:`${progress}%`}}/></div><div className="cards">{activities.filter(a=>activityAvailable(state,a)).map(a=><button key={a.id} className={state.active===a.id?'card active':'card'} onClick={()=>onSelect(a.id)}><strong>{a.name[lang]}</strong><small>{Math.round(a.intervalMs/1000)}s · +{a.knowledge} ✦ · +{a.xp} XP</small><span>Lv {level(state.xp[a.discipline])}</span></button>)}</div></section> }

function Research({state,lang,onBuy}:{state:GameState;lang:Language;onBuy:(id:string)=>void}){ return <section><h2>{lang==='ar'?'البحث':'Research'}</h2><div className="cards">{nodes.map(n=>{const done=has(state,n.id),available=nodeAvailable(state,n),afford=state.knowledge>=n.cost;return <article className={done?'card done':'card'} key={n.id}><strong>{n.name[lang]}</strong><p>{n.description[lang]}</p><button disabled={done||!available||!afford} onClick={()=>onBuy(n.id)}>{done?'✓':`${n.cost} ✦`}</button></article>})}</div></section> }

function Library({state,lang,onStart,onNext}:{state:GameState;lang:Language;onStart:()=>void;onNext:()=>void}){ const ar=lang==='ar'; const steps=[null,ar?'لاحظ أن بعض الرموز تتكرر أكثر من غيرها.':'Notice that some symbols repeat more often than others.',ar?'قارن تكرار الرموز بتكرار الحروف في اللغة.':'Compare symbol frequency with ordinary language.',ar?'اختبر فرضية: الرمز الأكثر شيوعاً قد يمثل حرفاً شائعاً.':'Test a hypothesis: the most common symbol may represent a common letter.',ar?'بدأ المعنى يظهر. التحليل، لا الحظ، كسر الشفرة.':'Meaning begins to emerge. Analysis, not luck, broke the cipher.']; return <section><h2>{ar?'المخطوطات':'Manuscripts'}</h2><div className="manuscripts">{state.manuscripts.map(x=><span key={x}>▤ {x}</span>)}</div><h2>{ar?'السجلات':'Chronicles'}</h2><article className="chronicle"><h3>{ar?'الكندي — الشفرة':'Al-Kindi — The Cipher'}</h3>{!state.alkindi.unlocked?<p>{ar?'مغلق':'Locked'}</p>:state.alkindi.complete?<p>✓ {ar?'مكتمل — منهج التحليل +10٪ معرفة':'Complete — Method of Analysis +10% Knowledge'}</p>:!state.alkindi.started?<button onClick={onStart}>{ar?'ابدأ السجل':'Begin Chronicle'}</button>:<><div className="cipher">◇ ○ △ ◇ □ ◇ △ ○ ◇ ◇ □ △</div><p>{steps[state.alkindi.step]}</p><button onClick={onNext}>{state.alkindi.step===4?(ar?'اكشف الرسالة':'Reveal the message'):(ar?'تابع':'Continue')}</button></>}</article><article className="chronicle muted"><h3>{ar?'البتّاني — جداول السماء':'Al-Battani — The Tables of the Sky'}</h3><p>{state.albattaniDiscovered?(ar?'تم اكتشاف السجل. المتطلبات لم تكتمل بعد.':'Chronicle discovered. Requirements are not yet met.'):(ar?'لم يُكتشف بعد.':'Not yet discovered.')}</p></article></section> }
