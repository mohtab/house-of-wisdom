export type Discipline = 'translation' | 'mathematics' | 'astronomy';
export type Language = 'en' | 'ar';

export type GameState = {
  version: 1;
  knowledge: number;
  xp: Record<Discipline, number>;
  active: string;
  progressMs: number;
  lastUpdatedAt: number;
  research: string[];
  manuscripts: string[];
  alkindi: { unlocked: boolean; started: boolean; step: number; complete: boolean };
  observations: number;
  albattaniDiscovered: boolean;
  language: Language;
};

export type Activity = {
  id: string;
  discipline: Discipline;
  name: Record<Language, string>;
  intervalMs: number;
  knowledge: number;
  xp: number;
  minLevel: number;
  requires?: string;
};

export const activities: Activity[] = [
  { id:'faded', discipline:'translation', name:{en:'Decipher a Faded Line',ar:'فك سطر باهت'}, intervalMs:6000, knowledge:1, xp:3, minLevel:1 },
  { id:'passage', discipline:'translation', name:{en:'Copy a Clear Passage',ar:'نسخ مقطع واضح'}, intervalMs:10000, knowledge:2, xp:5, minLevel:2 },
  { id:'folio', discipline:'translation', name:{en:'Translate the Mathematical Folio',ar:'ترجمة الصحيفة الرياضية'}, intervalMs:15000, knowledge:4, xp:8, minLevel:4 },
  { id:'compile', discipline:'translation', name:{en:'Compile a Manuscript',ar:'جمع مخطوطة'}, intervalMs:45000, knowledge:14, xp:20, minLevel:1, requires:'scriptorium' },
  { id:'numerals', discipline:'mathematics', name:{en:'Practice Numerals',ar:'التدرّب على الأرقام'}, intervalMs:8000, knowledge:2, xp:4, minLevel:1, requires:'mathematics' },
  { id:'proof', discipline:'mathematics', name:{en:'Work a Geometric Proof',ar:'حل برهان هندسي'}, intervalMs:12000, knowledge:4, xp:7, minLevel:3, requires:'mathematics' },
  { id:'patterns', discipline:'mathematics', name:{en:'Study Patterns in Letters',ar:'دراسة الأنماط في الحروف'}, intervalMs:18000, knowledge:7, xp:10, minLevel:5, requires:'mathematics' },
  { id:'sky', discipline:'astronomy', name:{en:'Observe the Night Sky',ar:'مراقبة السماء ليلاً'}, intervalMs:15000, knowledge:4, xp:5, minLevel:1, requires:'observatory' },
  { id:'star', discipline:'astronomy', name:{en:'Record a Star Position',ar:'تسجيل موضع نجم'}, intervalMs:25000, knowledge:8, xp:9, minLevel:3, requires:'observatory' },
  { id:'compare', discipline:'astronomy', name:{en:'Compare Observations',ar:'مقارنة الرصدات'}, intervalMs:40000, knowledge:14, xp:15, minLevel:5, requires:'observatory' }
];

export const nodes = [
  { id:'desk', cost:15, name:{en:'Restore the Desk',ar:'ترميم المكتب'}, description:{en:'+5% Translation Knowledge.',ar:'+5٪ معرفة من الترجمة.'} },
  { id:'mathematics', cost:45, after:'desk', name:{en:'Numerals in the Margins',ar:'أرقام في الهوامش'}, description:{en:'Unlock Mathematics.',ar:'يفتح الرياضيات.'} },
  { id:'preserve', cost:60, after:'mathematics', name:{en:'Preserve the Folio',ar:'حفظ الصحيفة'}, description:{en:'+10% Translation output.',ar:'+10٪ إنتاج الترجمة.'} },
  { id:'follow', cost:60, after:'mathematics', name:{en:'Follow the Pattern',ar:'تتبّع النمط'}, description:{en:'+10% Mathematics output.',ar:'+10٪ إنتاج الرياضيات.'} },
  { id:'language', cost:100, after:'mathematics', levels:{translation:4,mathematics:5}, name:{en:'Patterns in Language',ar:'أنماط في اللغة'}, description:{en:'Unlock Al-Kindi — The Cipher.',ar:'يفتح الكندي — الشفرة.'} },
  { id:'scriptorium', cost:140, chronicle:true, name:{en:'Restore the Scriptorium',ar:'ترميم دار النسخ'}, description:{en:'Unlock manuscript compilation.',ar:'يفتح جمع المخطوطات.'} },
  { id:'heavens', cost:180, after:'scriptorium', levels:{translation:6,mathematics:7}, name:{en:'Measured Heavens',ar:'السماء المقاسة'}, description:{en:'Reveal the Observatory.',ar:'يكشف المرصد.'} },
  { id:'observatory', cost:240, after:'heavens', name:{en:'Restore the Observatory',ar:'ترميم المرصد'}, description:{en:'Unlock Astronomy.',ar:'يفتح علم الفلك.'} },
  { id:'regularities', cost:140, after:'observatory', levels:{astronomy:3}, name:{en:'Regularities in the Sky',ar:'انتظامات في السماء'}, description:{en:'+10% Astronomy output.',ar:'+10٪ إنتاج الفلك.'} }
] as const;

const thresholds = [0,0,18,50,100,170,260,380,530,720,950,1230];
export function level(xp:number){ let n=1; for(let i=2;i<thresholds.length;i++){ if(xp>=thresholds[i]) n=i; else break; } return n; }
export function has(s:GameState,id:string){ return s.research.includes(id); }
export function initial(now=Date.now()):GameState { return { version:1, knowledge:0, xp:{translation:0,mathematics:0,astronomy:0}, active:'faded', progressMs:0, lastUpdatedAt:now, research:[], manuscripts:['Damaged Mathematical Folio'], alkindi:{unlocked:false,started:false,step:0,complete:false}, observations:0, albattaniDiscovered:false, language:'en' }; }

export function activityAvailable(s:GameState,a:Activity){ return level(s.xp[a.discipline])>=a.minLevel && (!a.requires || has(s,a.requires)); }
export function nodeAvailable(s:GameState,n:(typeof nodes)[number]){
  if(has(s,n.id)) return false;
  if('after' in n && n.after && !has(s,n.after)) return false;
  if('chronicle' in n && n.chronicle && !s.alkindi.complete) return false;
  if('levels' in n && n.levels){ for(const [d,l] of Object.entries(n.levels)){ if(level(s.xp[d as Discipline]) < Number(l)) return false; } }
  return true;
}

function multiplier(s:GameState,d:Discipline){ let m=1; if(d==='translation'&&has(s,'desk'))m+=.05; if(d==='translation'&&has(s,'preserve'))m+=.1; if(d==='mathematics'&&has(s,'follow'))m+=.1; if(d==='astronomy'&&has(s,'regularities'))m+=.1; if(s.alkindi.complete)m+=.1; return m; }

export function advance(input:GameState,now=Date.now(),cap=8*60*60*1000){
  const s=structuredClone(input); const elapsed=Math.min(Math.max(0,now-s.lastUpdatedAt),cap); const a=activities.find(x=>x.id===s.active);
  const summary={elapsed,knowledge:0,xp:0,actions:0};
  if(a && activityAvailable(s,a)){
    const total=s.progressMs+elapsed; const count=Math.floor(total/a.intervalMs); s.progressMs=total%a.intervalMs;
    if(count){ const k=Math.floor(count*a.knowledge*multiplier(s,a.discipline)); const x=Math.floor(count*a.xp); s.knowledge+=k; s.xp[a.discipline]+=x; if(a.discipline==='astronomy')s.observations+=count; Object.assign(summary,{knowledge:k,xp:x,actions:count}); }
  }
  if(has(s,'language'))s.alkindi.unlocked=true;
  if(has(s,'observatory')&&level(s.xp.astronomy)>=5&&s.observations>=18)s.albattaniDiscovered=true;
  s.lastUpdatedAt=now; return {state:s,summary};
}

export function selectActivity(s:GameState,id:string){ const a=activities.find(x=>x.id===id); if(!a||!activityAvailable(s,a))return s; return {...s,active:id,progressMs:0,lastUpdatedAt:Date.now()}; }
export function buy(s:GameState,id:string){ const n=nodes.find(x=>x.id===id); if(!n||!nodeAvailable(s,n)||s.knowledge<n.cost)return s; const next=structuredClone(s); next.knowledge-=n.cost; next.research.push(id); if(id==='language')next.alkindi.unlocked=true; if(id==='follow')next.manuscripts.push('Sealed Correspondence'); if(id==='preserve')next.manuscripts.push('Preserved Mathematical Folio'); return next; }
export function startKindi(s:GameState){ if(!s.alkindi.unlocked)return s; const next=structuredClone(s); next.alkindi.started=true; next.alkindi.step=Math.max(1,next.alkindi.step); return next; }
export function nextKindi(s:GameState){ const next=structuredClone(s); if(!next.alkindi.started||next.alkindi.complete)return next; if(next.alkindi.step<4)next.alkindi.step++; else {next.alkindi.complete=true;next.alkindi.step=5;next.manuscripts.push('Al-Kindi — Method of Analysis');} return next; }
export function objective(s:GameState,lang:Language){ const ar=lang==='ar'; if(!has(s,'desk'))return ar?'رمّم المكتب':'Restore the Desk'; if(!has(s,'mathematics'))return ar?'افهم الأرقام في الهوامش':'Understand the Numerals in the Margins'; if(!s.alkindi.complete)return ar?'حل شفرة الكندي':'Solve Al-Kindi’s Cipher'; if(!has(s,'scriptorium'))return ar?'رمّم دار النسخ':'Restore the Scriptorium'; if(!has(s,'observatory'))return ar?'افتح المرصد':'Reopen the Observatory'; return s.albattaniDiscovered?(ar?'استعد لسجل البتّاني':'Prepare for Al-Battani’s Chronicle'):(ar?'راقب السماء':'Observe the Sky'); }
