// ---------- Zustand ----------
const STORE='planspiel-v3';
let S=null;
let UI={act:null,lastRoll:null,peek:null,timerId:null,turnEnd:null,call:null,refl:null,flashQ:[],flashBusy:false,secretOpen:false,focus:null,preview:null,deltas:[]};
let setupSettings={...DEFAULT_SETTINGS};
let setupPlayers=[{name:'Ilka',eig:'ruhe',portrait:'p1'},{name:'Bernd',eig:'bauch',portrait:'p2'},{name:'Selin',eig:'perfekt',portrait:'p3'},{name:'Tomasz',eig:'kaffee',portrait:'p4'}];
const $=id=>document.getElementById(id);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P=key=>S.players.find(p=>p.key===key);
const fill=t=>String(t).replace(/\{MA\}/g,(S&&P('MA')||{}).name||'Mitarbeitende:r');
const two=()=>S.settings.dice==='2d6';
const callThreshold=()=>two()?7:4;
const eventsFor=round=>{const a=String(S.settings.events).split(',').map(x=>+x||1);return a[Math.min(round,a.length)-1]||1};
function projectDiff(){const pd=String(S.settings.pd).split(',').map(x=>+x);const i=S.project<3?0:S.project<6?1:2;const v=(pd[i]||[4,5,7][i])+(S.settings.wagnisPlus||0);return two()?v+3:v}
const wagDiff=e=>e.diff+(S.settings.wagnisPlus||0);
const bereitDiff=()=>two()?S.settings.bereit+3:S.settings.bereit;
function pSuccess(diff,bonus){const need=diff-bonus;if(!two()){if(need<=1)return 1;if(need>6)return 0;return (7-need)/6}let c=0;for(let i=1;i<=6;i++)for(let j=1;j<=6;j++)if(i+j>=need)c++;return c/36}
const pct=x=>Math.round(x*100)+' %';
const projectPhaseName=()=>S.project<3?'Anlaufphase':S.project<6?'Kernarbeit':'Abschluss';
const openStoerungen=()=>S.open.filter(e=>e.type==='Störung').length;
const SIDE={standing:'Betrieb',project:'Projekt'};
const sideCount=s=>S.players.filter(p=>p.side===s).length;
const basePen=()=>(S.settings.escPen||1)+(S.prio==='standing'?1:0);
// Eigenarten
const eigOf=p=>S.settings.eigenarten?p.eig:null;
const has=(p,k)=>eigOf(p)===k;
const helpVal=h=>(S.settings.helpB||1)+(has(h,'neinsagen')?1:0);
const canLern=p=>!p.lernUsed&&!has(p,'hase')&&S.lern.some(k=>!k.used);
const canReroll=p=>has(p,'bauch')&&!p.eigUsed&&p.chips>0;
function mkCard(c){return {...c,protected:false,peeked:false}}
function buildDeck(){
  const rest=shuffle(EVENTS.filter(e=>!SEEDED_EVENTS.includes(e.id))).map(mkCard);
  const seeded=shuffle(EVENTS.filter(e=>SEEDED_EVENTS.includes(e.id))).map(mkCard);
  return [...shuffle([...seeded,rest.shift()]),...rest];
}
function mapDifficulty(deck,s){deck.forEach(e=>{const t=(e.diff-4)/2;e.diff=Math.round(s.diffMin+t*(s.diffMax-s.diffMin))})}
function newState(settings,players){
  const deck=buildDeck();mapDifficulty(deck,settings);
  return {settings:{...settings},round:1,phase:'event',standing:settings.standingStart,project:0,restructuring:false,restructuringRound:null,over:false,won:null,
    players:players.map((p,i)=>({...ROLES[i],name:p.name,eig:p.eig,portrait:p.portrait||PORTRAITS[i].id,chips:settings.chips,abilityUsed:false,eigUsed:false,lernUsed:false,helpUsed:false,extraChips:0,paired:0,helpCount:0,passed:false,left:false,side:null,rolled:false,noPair:false,erschoepfung:0,overtimeUsed:false,debt:0,out:false})),
    deck,discard:[],open:[],lern:[],log:[],stats:{rolls:0,ones:0,sixes:0,fails:0,succ:0,timeouts:0,wagnis:0,sicher:0},projectHist:[0],eventDone:false,turn:null,waitReroll:false,lastAddressed:null,
    scheduled:[],nachbarDebt:0,critUsed:false,puffer:0,prio:null,standingActed:false,projectActed:false,projectAtStart:0,milestones:[],week:[],weekStart:{v:settings.standingStart,p:0}};
}
function roll(){const d=two()?[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)]:[1+Math.floor(Math.random()*6)];return{d,total:d.reduce((a,b)=>a+b,0),crit:d.every(x=>x===6),fumble:d.every(x=>x===1)}}

// ---------- Protokoll ----------
function L(k,a,t,h){S.log.push({k,a,t,h:h||null})}
const nm=key=>{const p=P(key);return `<span class="nm" style="color:var(${p.color})">${esc(p.name)}</span>`};
const logRound=n=>L('round',null,`Woche ${n}`);
const logPhase=t=>L('phase',null,t);
const logNarr=t=>L('narr','dm',`Spielleitung: ${fill(t)}`,`<b>Spielleitung:</b> ${esc(fill(t))}`);
const logSys=t=>L('sys',null,fill(t));
const logRef=t=>L('ref',null,t);
const logAct=(key,t)=>L('act',key,`${P(key).name}: ${fill(t)}`,`${nm(key)}: ${esc(fill(t))}`);
function logTrack(what,from,to,why){const up=to>from;L('track'+(up?' up':' down'),null,`${what} ${up?'steigt':'sinkt'} auf ${to}${why?' ('+why+')':''}.`)}
const partsTxt=parts=>parts.map((p,i)=>(i?' + ':'')+p.v+(p.l?' '+p.l:'')).join('').replace(/\+ -/g,'− ');
function logRoll(key,parts,total,diff,ok,label){
  const txt=partsTxt(parts);
  L('roll',key,`${P(key).name}: ${label||'Wurf'} ${txt} = ${total} gegen ${diff} – ${ok?'Erfolg':'Fehlschlag'}`,
    `${nm(key)}: ${esc(label||'Wurf')} <span class="calc">${esc(txt)} =</span> <b>${total}</b> <span class="calc">gegen ${diff}</span> – <span class="${ok?'ok':'fail'}">${ok?'Erfolg':'Fehlschlag'}</span>`);
}

// ---------- Einblendungen ----------
function flash(text,kind,ms,html){UI.flashQ.push({text:fill(text),kind:kind||'',ms:ms||1300,html:html||null});while(UI.flashQ.length>6){const i=UI.flashQ.findIndex(f=>f.kind!=='round'&&f.kind!=='dice');if(i<0)break;UI.flashQ.splice(i,1)}if(!UI.flashBusy)nextFlash()}
function nextFlash(){const f=$('flash'),d=f.firstElementChild;const it=UI.flashQ.shift();if(!it){UI.flashBusy=false;f.hidden=true;MO.flush();return}UI.flashBusy=true;f.hidden=true;void d.offsetWidth;if(it.html)d.innerHTML=it.html;else d.textContent=it.text;d.className=it.kind;d.style.setProperty('--dur',it.ms+'ms');f.hidden=false;setTimeout(nextFlash,it.ms)}
function diceFlash(dice,parts,total,diff,ok,label){
  const calc=partsTxt(parts.slice(1));
  flash('', 'dice',1500,`<div class="dk">${esc(label)}</div><div class="dd">${dice.map(n=>dieSVG(n,86,'roll')).join('')}</div><div class="dc"><span class="num">${dice.join(' + ')}${calc?' + '+esc(calc):''}</span> = <b>${total}</b> gegen ${diff}</div><div class="dr ${ok?'ok':'fail'}">${ok?'Geschafft':'Daneben'}</div>`);
}

// ---------- Leisten ----------
function setStanding(v,why){
  const from=S.standing;S.standing=Math.max(0,Math.min(S.settings.standingMax,v));const d=S.standing-from;
  if(d){logTrack('Vertrauen',from,S.standing,why);S.week.push({k:'v',d,why:why||''});UI.deltas.push({k:'v',d,why:why||'',t:Date.now()});flash(`Vertrauen ${sgn(d)}${why?': '+why:''}`,d>0?'good':'bad',1200)}
  if(S.settings.kopplung&&from>SKEPSIS&&S.standing<=SKEPSIS&&S.standing>0){logSys(`Vertrauen bei ${S.standing}: Der Vorstand ist skeptisch. Projekt-Wagnisse −1, solange das so bleibt.`);MO.note('skepsis',{v:S.standing})}
  if(S.standing===0&&!S.restructuring&&!S.over){S.restructuring=true;S.restructuringRound=S.round;logNarr(`Dr. Kessler hat genug gesehen. Der Vorstand übernimmt ${SCENARIO.bereich}, kommissarisch über ${SCENARIO.nachbar}. Es folgt eine letzte Woche mit einem Chip weniger pro Person.`);flash('Der Vorstand übernimmt euer Fachgebiet!','bad',2400);MO.note('uebernahme',{})}
}
function setProject(v,why){
  const from=S.project;S.project=Math.max(0,Math.min(S.settings.projectTarget,v));const d=S.project-from;
  if(d){logTrack('Projekt',from,S.project,why);S.week.push({k:'p',d,why:why||''});UI.deltas.push({k:'p',d,why:why||'',t:Date.now()});flash(S.project>=S.settings.projectTarget&&d>0?'Die Vorstudie ist fertig!':`Projekt ${sgn(d)}${why?': '+why:''}`,d>0?'good':'bad',1200)}
  if(S.settings.kopplung&&d>0)MILESTONES.forEach(m=>{if(from<m&&S.project>=m&&!S.milestones.includes(m)){S.milestones.push(m);logNarr(`Meilenstein: Die Vorstudie hat Stand ${m}. Dr. Kessler hat es gesehen.`);MO.note('meilenstein',{m});setStanding(S.standing+1,`Meilenstein ${m} bei der Vorstudie`)}});
}
// Prognose fürs Wochenende: was passiert, wenn ab jetzt nichts mehr geschieht. h = gedachte Handlung.
function forecast(h){
  if(!S||!['event','commit','play','escalation'].includes(S.phase))return null;
  let v=S.standing+(h?.v||0),pr=Math.max(0,Math.min(S.settings.projectTarget,S.project+(h?.p||0)));
  if(S.settings.kopplung)MILESTONES.forEach(m=>{if(S.project<m&&pr>=m&&!S.milestones.includes(m))v++});
  const pen=basePen();
  S.open.forEach(e=>{if(e.type==='Chance'||e.protected||(h&&h.resolve===e.id))return;v-=pen+(e.peeked?1:0)});
  if(S.settings.stillstand){
    const pAct=S.projectActed||h?.side==='project',sAct=S.standingActed||h?.side==='standing';
    if(!pAct)pr=Math.max(0,pr-(S.prio==='project'?2:1));
    if(!sAct)v-=S.prio==='standing'?2:1;
  }
  if(S.prio==='project'&&pr<=S.projectAtStart)v--;
  return {v:Math.max(0,Math.min(S.settings.standingMax,v)),p:pr};
}

// ---------- Ereignisse ----------
function drawEvent(reason,card){
  let e;
  if(card){e=mkCard(card);mapDifficulty([e],S.settings)}
  else{if(!S.deck.length){S.deck=shuffle(S.discard);S.discard=[];logSys('Ereignisstapel neu gemischt.')}if(!S.deck.length){logSys('Keine Ereigniskarten mehr.');return null}e=S.deck.shift()}
  if(e.id===8)e.diff+=S.nachbarDebt;
  S.open.push(e);
  L('sys',null,`Ereignis${reason?' ('+reason+')':''}: ${e.title} [${e.type}, Wagnis ab ${wagDiff(e)}], an ${P(e.to).name}.`,`Ereignis${reason?' ('+esc(reason)+')':''}: <b>${esc(e.title)}</b> <span class="calc">[${e.type}, Wagnis ab ${wagDiff(e)}]</span>, an ${nm(e.to)}.`);
  logNarr(e.text);
  if(!reason){S.lastAddressed=e.to;UI.focus=e.id}else if(reason==='Patzer')flash(`Neues Ereignis: ${e.title}`,'bad');
  return e;
}
function drawRound(){
  S.week=[];S.weekStart={v:S.standing,p:S.project};
  if(S.settings.prio){S.prio=Math.random()<.5?'standing':'project';const t=S.prio==='standing'?`${SCENARIO.vorstand} ruft an: „Diese Woche zählt der Betrieb. Ich will keine Schlagzeilen.“ Liegengebliebene Karten kosten diese Woche 3 Vertrauen.`:`${SCENARIO.vorstand} ruft an: „Diese Woche will ich Fortschritt bei der Vorstudie sehen.“ Ohne Projektfortschritt kostet die Woche Vertrauen, Projektstillstand kostet doppelt.`;logNarr(t);flash(`Priorität der Woche: ${SIDE[S.prio]}`,'',1800)}
  S.projectAtStart=S.project;S.standingActed=false;S.projectActed=false;
  const n=eventsFor(S.round);
  for(let i=0;i<n;i++){const e=drawEvent(i?'weitere Karte':null);if(e&&i)flash(`Und noch etwas: ${e.title}`,'bad',1300)}
  const due=S.scheduled.filter(x=>x.round<=S.round);S.scheduled=S.scheduled.filter(x=>x.round>S.round);
  due.forEach(x=>{const e=drawEvent('Folge von früher',CARD(x.card));if(e)flash(`Die Rechnung von früher: ${e.title}`,'bad',1600)});
  S.eventDone=true;
  MO.note('ziehen',{n,round:S.round,titles:S.open.map(e=>e.title)});
  if(S.prio)MO.note('prio',{prio:S.prio});
  if(due.length)MO.note('folge-kommt',{titles:due.map(x=>CARD(x.card).title)});
}
function schedule(cardId,delay){const r=S.round+delay;S.scheduled.push({round:r,card:cardId});logSys(`Folge: „${CARD(cardId).title}“ kommt in Woche ${r}.`);return r}
function resolveEvent(e,byKey,byText){
  S.open=S.open.filter(x=>x!==e);if(e.id<100)S.discard.push(e);
  L('act',byKey,`${P(byKey).name}: „${e.title}“ erledigt${byText?' ('+byText+')':''}.`,`${nm(byKey)}: <b>„${esc(e.title)}“ erledigt</b>${byText?' ('+esc(byText)+')':''}.`);
}
function afterRoll(p,r){
  if(r.crit){S.stats.sixes++;if(S.settings.critOnce&&S.critUsed){logSys('Glanzwurf, aber das Vertrauen ist diese Woche schon einmal gestiegen.')}else{S.critUsed=true;logNarr(`${p.name}, erzähl, was so gut lief.`);flash(`Glanzleistung! ${p.name}, erzähl, was so gut lief.`,'good');setStanding(S.standing+1,'Glanzwurf');MO.note('glanz',{p})}}
  if(r.fumble){S.stats.ones++;logSys('Patzer! Zweites Ereignis.');flash('Patzer! Ein zweites Ereignis bricht herein.','bad');const e=drawEvent('Patzer');MO.note('patzer',{p,title:e?.title})}
}
function helped(h,p){
  h.paired++;p.paired++;h.helpCount++;
  if(has(h,'neinsagen')&&h.helpCount%2===0){h.erschoepfung++;logSys(`${h.name} kann nicht Nein sagen: ein Strich auf dem Erschöpfungsmarker (${h.erschoepfung}/3).`);flash(`${h.name} hilft schon wieder. Erschöpfung ${h.erschoepfung}/3.`,'bad');MO.note('e-neinsagen',{h})}
}
// Bonusteile eines Wagnisses. e = Ereigniskarte, null = Projekt, {type:'Bereit'} = Bereitschaft
function wagBase(p,e){
  const parts=[];const k=eigOf(p);
  if(e&&e.type!=='Bereit'){if(FOCUS_MATCH[p.focus].includes(e.type))parts.push({v:2,l:'Schwerpunkt'});else if(p.abilityKey==='standby'&&e.type==='Störung')parts.push({v:2,l:'Störungsbereitschaft'})}
  if(!e){if(p.focus==='Projekt')parts.push({v:2,l:'Schwerpunkt'});const st=openStoerungen();if(st)parts.push({v:-st,l:st>1?st+' offene Störungen':'offene Störung'});if(S.settings.kopplung&&S.standing<=SKEPSIS)parts.push({v:-1,l:'Vorstand skeptisch'})}
  if(k==='perfekt')parts.push({v:-1,l:'Perfektionist:in'});
  if(k==='folien'&&e&&e.type==='Störung')parts.push({v:-1,l:'Folienkönig:in'});
  if(k==='sinn'&&e&&e.type==='Störung')parts.push({v:-1,l:'Sinnsucher:in'});
  if(k==='hase'&&e&&e.id>=100)parts.push({v:2,l:'Alter Hase'});
  if(k==='hase'&&e&&e.type==='Chance')parts.push({v:-1,l:'Alter Hase'});
  if(k==='zahlen'&&e){if(e.type==='Politik')parts.push({v:1,l:'Zahlenmensch'});if(e.type==='Team')parts.push({v:-2,l:'Zahlenmensch'})}
  if(k==='kaffee'&&e){if(e.type==='Team')parts.push({v:2,l:'Kaffeeküche'});if(e.type==='Politik')parts.push({v:-1,l:'Kaffeeküche'})}
  return parts;
}
const sumParts=a=>a.reduce((s,x)=>s+x.v,0);
function mods(p,opt,parts){
  let b=0;
  if(opt.reason&&!has(p,'bauch')){b+=1;parts.push({v:1,l:'Begründung'});MO.note('begruendung',{p})}
  (opt.helpers||[]).forEach(k=>{const h=P(k);if(!h||h.chips<1||h.side!==p.side||h.noPair||h.out)return;h.chips--;helped(h,p);const v=helpVal(h);b+=v;parts.push({v,l:h.name});MO.note('helfer',{p,h,v})});
  if(opt.lern&&canLern(p)){const k=S.lern.find(x=>!x.used);k.used=true;p.lernUsed=true;b+=1;parts.push({v:1,l:'Lernkarte'});MO.note('lern',{p,text:k.text,wag:true})}
  return b;
}
// Konsequenzen einer Option in Worten (für Protokoll und Einblendungen)
function consText(o,ctx){
  const t=[];
  if(o.resolve&&!ctx?.project)t.push('erledigt');
  if(o.project)t.push(`Projekt ${sgn(o.project)}`);
  if(o.standing)t.push(`Vertrauen ${sgn(o.standing)}`);
  if(o.chipsAll)t.push(`alle +${o.chipsAll} Chip`);
  if(o.later)t.push(`„${CARD(o.later.card).title}“ kommt in Woche ${S.round+o.later.delay}`);
  if(o.nachbar)t.push('ihr schuldet Süd etwas');
  if(o.noPair)t.push(`${P(o.noPair).name} fällt diese Woche als Helfer:in aus`);
  if(o.endRound)t.push('danach bist du fertig für die Woche');
  if(o.nextChips)t.push(`nächste Woche ${o.nextChips} Chip`);
  if(o.pair)t.push(`zählt für ${P(o.pair).name} als „zu zweit“`);
  if(o.escalateNow)t.push('Karte eskaliert sofort');
  return t.join(' · ');
}
function applyEffects(p,o,e,label){
  const why=`${e?'„'+e.title+'“: ':''}${label||'Fehlschlag'}`;
  if(o.standing)setStanding(S.standing+o.standing,why);
  if(o.project)setProject(S.project+o.project,why);
  if(o.chipsAll){S.players.forEach(x=>x.chips+=o.chipsAll);logSys(`Alle erhalten ${o.chipsAll} Chip.`);MO.note('chipsall',{})}
  if(o.later){const r=schedule(o.later.card,o.later.delay);MO.note('folge-geplant',{title:CARD(o.later.card).title,round:r})}
  if(o.nachbar){S.nachbarDebt++;const c8=S.open.find(x=>x.id===8);if(c8)c8.diff++;logSys(`Süd merkt sich das (${S.nachbarDebt}×).`);if(!S.deck.some(x=>x.id===8)&&!c8&&!S.scheduled.some(x=>x.card===109))schedule(109,1);MO.note('sued',{debt:S.nachbarDebt})}
  if(o.noPair){const t=P(o.noPair);t.noPair=true;logSys(`${t.name} ist diese Woche gebunden und kann nicht helfen.`);MO.note('gebunden',{t})}
  if(o.endRound){p.endRound=true;logSys(`${p.name} ist danach für diese Woche fertig.`);MO.note('endround',{p})}
  if(o.nextChips){p.extraChips+=o.nextChips;logSys(`${p.name} hat nächste Woche ${o.nextChips} Chip.`);MO.note('nextchips',{p})}
  if(o.pair){const t=P(o.pair);t.paired++;p.paired++;MO.note('zuzweit',{t})}
  if(o.escalateNow&&e){e.diff++;logSys(`„${e.title}“ eskaliert sofort. Wagnis jetzt ab ${wagDiff(e)}.`);flash(`„${e.title}“ eskaliert sofort!`,'bad');setStanding(S.standing-(S.settings.escPen||1),`„${e.title}“ eskaliert sofort`);MO.note('sofort',{e})}
  if(o.resolve&&e&&S.open.includes(e)){if(e.win)flash(e.win,'good');resolveEvent(e,p.key,label)}
}
// Kosten einer Option und wer zahlt. e = Ereigniskarte (null beim Projekt)
function optCost(p,o,a,e){
  let cost=o.chips||1;const payer=o.payer&&o.payer!==p.key?P(o.payer):p;const notes=[];
  if(payer===p&&e){
    if(has(p,'delegier')&&e.to===p.key&&!o.roll){cost++;notes.push('Delegier-Weltmeister:in +1')}
      }
  let lernSave=false;if(a?.lern&&canLern(p)&&cost>=2&&!o.roll){cost--;lernSave=true}
  const helper=(a?.helpers||[])[0]?P(a.helpers[0]):null;
  const helperPays=!o.roll&&helper&&helper.chips>0&&helper.side===p.side&&!helper.noPair&&!helper.out&&cost>=2?1:0;
  return {cost,payer,helperPays,helper,payerCost:cost-helperPays,lernSave,notes};
}
// Sperren durch Eigenarten
function optBlock(p,o,isProject){
  if(isProject&&o.id==='s'&&has(p,'perfekt'))return 'Perfektionist:in: „Schnell“ geht für dich nicht.';
  if(has(p,'bauch')&&!p.rolled&&!o.roll)return 'Bauchmensch: Deine erste Handlung der Woche ist ein Wagnis.';
  return null;
}
function pay(p,c){
  c.payer.chips-=c.payerCost;
  if(c.helperPays){c.helper.chips-=1;helped(c.helper,p);MO.note('helfer',{p,h:c.helper,sicher:true})}
  if(c.lernSave){const k=S.lern.find(x=>!x.used);k.used=true;p.lernUsed=true;logSys('Lernkarte eingesetzt: ein Chip gespart.');MO.note('lern',{p,text:k.text,wag:false})}
  if(c.payer!==p)MO.note('payer',{p,payer:c.payer});
  if(c.notes.length)MO.note('eig-kosten',{p,notes:c.notes});
}

// ---------- Ansage ----------
function startCommit(){
  S.phase='commit';logPhase('Ansage');S.players.forEach(p=>{p.side=null;p.rolled=false;p.passed=false;p.noPair=false;p.endRound=false});S.critUsed=false;
  const i=S.players.findIndex(p=>p.key===S.lastAddressed);S.turn=i>=0?i:0;
  logSys(`${S.players[S.turn].name} ist adressiert und sagt zuerst an.`);startTurnTimer();
  MO.note('ansage',{first:S.players[S.turn]});
}
function chooseSide(p,side,auto){
  if(S.phase!=='commit'||S.players[S.turn]!==p||p.side)return;
  stopTurnTimer();p.side=side;
  L('act',p.key,`${p.name}: setzt auf ${side==='standing'?'den Betrieb':'das Projekt'}${auto?' (Zeit abgelaufen)':''}.`,`${nm(p.key)}: setzt auf <b>${side==='standing'?'den Betrieb':'das Projekt'}</b>${auto?' <span class="fail">(Zeit abgelaufen)</span>':''}.`);
  MO.note('seite',{p,side,auto,st:sideCount('standing'),pr:sideCount('project'),left:S.players.filter(x=>!x.side).length});
  let g=0;do{S.turn=(S.turn+1)%S.players.length}while(S.players[S.turn].side&&g++<4);
  if(S.players.every(x=>x.side)){flash(`Betrieb ${sideCount('standing')} · Projekt ${sideCount('project')}`,'',1500);startPlay()}else startTurnTimer();
  render();
}
function commitTimeout(){const p=S.players[S.turn];S.stats.timeouts++;chooseSide(p,sideCount('standing')<=sideCount('project')?'standing':'project',true)}

// ---------- Zugreihenfolge ----------
function startPlay(){S.phase='play';logPhase('Spielphase');S.players.forEach(p=>p.passed=false);const i=S.players.findIndex(p=>p.key===S.lastAddressed);S.turn=i>=0?i:0;S.waitReroll=false;MO.note('spielphase',{st:sideCount('standing'),pr:sideCount('project')});beginTurn()}
// Am Zug ist, wer Chips hat oder sich noch Zeit holen kann (Puffer, Überstunden)
const canAct=p=>!p.passed&&!p.out&&(p.chips>0||(!has(p,'feierabend')&&((S.settings.overtime&&!p.overtimeUsed)||(S.settings.puffer&&S.puffer>0))));
const playOver=()=>!S.players.some(canAct);
function beginTurn(){
  if(playOver()){endPlay();return}
  let g=0;while(!canAct(S.players[S.turn])&&g++<8){S.players[S.turn].passed=true;S.turn=(S.turn+1)%S.players.length}
  if(playOver()){endPlay();return}
  UI.act=null;UI.lastRoll=null;S.waitReroll=false;UI.secretOpen=false;UI.preview=null;startTurnTimer();
}
function advanceTurn(){const p=S.players[S.turn];if(p.endRound){p.passed=true;p.endRound=false}S.turn=(S.turn+1)%S.players.length;beginTurn()}
function passTurn(){const p=S.players[S.turn];if(!p.rolled&&p.chips>0)return;p.passed=true;logAct(p.key,'ist fertig für diese Woche.');MO.note('fertig',{p,left:p.chips});stopTurnTimer();advanceTurn();render()}
function turnTimeout(){
  const p=S.players[S.turn];S.stats.timeouts++;
  if(S.settings.timeoutMode==='hard'&&p.chips>0){p.chips--;L('act',p.key,`${p.name}: zögert zu lange. Chip verloren.`,`${nm(p.key)}: zögert zu lange. <span class="fail">Chip verloren.</span>`);flash(`Zu lange gezögert! ${p.name} verliert einen Chip.`,'bad')}
  else{p.passed=true;L('act',p.key,`${p.name}: zögert zu lange. Zug verfällt.`,`${nm(p.key)}: zögert zu lange. <span class="fail">Zug verfällt.</span>`);flash(`Zu lange gezögert! ${p.name}s Zug verfällt.`,'bad')}
  MO.note('timeout',{p});advanceTurn();render();
}
function endPlay(){stopTurnTimer();S.turn=null;S.phase='escalation';UI.act=null;UI.preview=null;logSys('Spielphase beendet.');MO.note('wochenende',{})}
const timed=()=>S&&(S.phase==='play'||S.phase==='commit');
// Der Timer steht, solange ein Making-of-Kommentar offen ist oder gleich kommt.
function startTurnTimer(){stopTurnTimer();if(!S.settings.turnTimer)return;UI.turnEnd=Date.now()+(S.phase==='commit'?Math.min(30,S.settings.turnSec):S.settings.turnSec)*1000;
  UI.timerId=setInterval(()=>{if(!S||!timed()||S.turn===null){stopTurnTimer();return}if(MO.busy()){UI.turnEnd+=200;return}if(Date.now()>=UI.turnEnd){stopTurnTimer();if(S.phase==='commit')commitTimeout();else turnTimeout()}else renderTimer()},200);renderTimer()}
function stopTurnTimer(){if(UI.timerId){clearInterval(UI.timerId);UI.timerId=null}UI.turnEnd=null}

// ---------- Aktionen ----------
function wagnisRoll(p,opt,diff,label,baseParts){
  const parts=[];const r=roll();S.stats.rolls++;S.stats.wagnis++;parts.push({v:r.d.join('+'),l:null});
  let b=0;(baseParts||[]).forEach(x=>{b+=x.v;parts.push(x)});
  b+=mods(p,opt,parts);
  const total=r.total+b,ok=total>=diff;
  logRoll(p.key,parts,total,diff,ok,label);diceFlash(r.d,parts,total,diff,ok,`${p.name}: ${label}`);
  if(ok)S.stats.succ++;else S.stats.fails++;
  const eig=(baseParts||[]).filter(x=>EIGENARTEN.some(g=>x.l===g.name)||['Kaffeeküche'].includes(x.l));if(eig.length)MO.note('eig-wurf',{p,parts:eig});
  return {r,total,ok,bonus:b,parts};
}
function doAction(p,kind,opt={}){
  if(S.phase!=='play'||S.over||S.players[S.turn]!==p)return;
  stopTurnTimer();let ends=false;UI.preview=null;
  // Option auf einer Ereigniskarte
  if(kind==='opt'){
    const e=S.open.find(x=>x.id===opt.eventId);const o=e&&e.opts.find(x=>x.id===opt.optId);if(!e||!o||p.side!=='standing'||optBlock(p,o,false))return startTurnTimer();
    const c=optCost(p,o,opt,e);if(c.payer.chips<c.payerCost||c.payer.out)return startTurnTimer();
    pay(p,c);p.rolled=true;S.standingActed=true;
    const who=c.payer!==p?` (${c.payer.name} zahlt)`:c.helperPays?` (zu zweit mit ${c.helper.name})`:'';
    logAct(p.key,`${o.label}${who}: ${o.text}`);
    if(o.roll){
      const wd=wagDiff(e);const w=wagnisRoll(p,opt,wd,'Wagnis',wagBase(p,e));
      UI.lastRoll={e:e.id,total:w.total,ok:w.ok,bonus:w.bonus,optId:o.id,diff:wd};
      MO.note('wagnis',{p,e,o,w,wd,pen:basePen()});
      if(w.ok){flash(`Das Wagnis geht auf!`,'good');applyEffects(p,o,e,o.label)}
      else{flash(`Das Wagnis geht schief.`,'bad');applyEffects(p,{...o.roll.fail},e,null);if(!o.roll.fail.escalateNow)logSys(`„${e.title}“ bleibt liegen.`)}
      afterRoll(p,w.r);
      if(!w.ok&&canReroll(p)&&S.open.includes(e)){S.waitReroll=true;UI.act=null;render();return}
    } else {S.stats.sicher++;MO.note('sicher',{p,e,o,c,pen:basePen()});flash(`${o.label}: ${consText(o)||'erledigt'}`,'');applyEffects(p,o,e,o.label)}
    if(o.out)logNarr(o.out);
    ends=true;
  }
  // Projektoption
  if(kind==='popt'){
    const o0=PROJECT_OPTS.find(x=>x.id===opt.optId);if(!o0||p.side!=='project'||optBlock(p,o0,true))return startTurnTimer();
    const o=projOpt(p,o0);
    const c=optCost(p,o,opt,null);if(c.payer.chips<c.payerCost)return startTurnTimer();
    pay(p,c);p.rolled=true;S.projectActed=true;
    logAct(p.key,`arbeitet am Projekt, ${o.label.toLowerCase()}${c.helperPays?' (zu zweit mit '+c.helper.name+')':''}: ${o.text}`);
    if(o.roll){
      const diff=projectDiff();const w=wagnisRoll(p,opt,diff,'Projekt-Wagnis',wagBase(p,null));
      UI.lastRoll={e:null,total:w.total,ok:w.ok,bonus:w.bonus,optId:'w',diff};
      MO.note('projekt-w',{p,w,diff});
      if(w.ok){flash('Die Idee trägt!','good');setProject(S.project+1,'Projekt-Wagnis: die Idee trägt')}else flash('Die Idee trägt nicht. Chip weg.','bad');
      afterRoll(p,w.r);
      if(!w.ok&&canReroll(p)){S.waitReroll=true;UI.act=null;render();return}
    } else {S.stats.sicher++;MO.note('projekt-'+o.id,{p,o});applyEffects(p,{...o,resolve:false},null,'Projekt '+o.label.toLowerCase())}
    if(o.out)logNarr(o.out);
    ends=true;
  }
  if(kind==='bereit'){
    if(p.chips<1||p.side!=='standing'||S.open.length)return startTurnTimer();
    p.chips--;p.rolled=true;S.standingActed=true;const diff=bereitDiff();
    logAct(p.key,'hält den Betrieb am Laufen (Bereitschaft).');
    const w=wagnisRoll(p,opt,diff,'Bereitschaft',wagBase(p,{type:'Bereit'}));
    MO.note('bereit',{p,w,diff});
    if(w.ok)setStanding(S.standing+1,'Bereitschaft: der Laden läuft');else flash('Routine. Niemand merkt etwas.','');
    afterRoll(p,w.r);ends=true;
  }
  if(kind==='reroll'){
    const lr=UI.lastRoll;if(!lr)return;const e=lr.e?S.open.find(x=>x.id===lr.e):null;if(lr.e&&!e)return;if(p.chips<1)return;
    p.chips--;p.eigUsed=true;const r=roll();S.stats.rolls++;const b=lr.bonus;const diff=lr.diff;const total=r.total+b,ok=total>=diff;
    logAct(p.key,'legt nach (Bauchmensch).');const parts=[{v:r.d.join('+'),l:null},{v:b,l:'Boni wie zuvor'}];logRoll(p.key,parts,total,diff,ok,'Nachwurf');diceFlash(r.d,parts,total,diff,ok,`${p.name}: Nachwurf`);
    MO.note('e-bauch',{p,ok});
    if(ok){S.stats.succ++;if(e){const o=e.opts.find(x=>x.id===lr.optId);if(o)applyEffects(p,o,e,o.label+' (Nachwurf)');else resolveEvent(e,p.key,'Nachwurf')}else setProject(S.project+1,'Nachwurf: die Idee trägt doch')}else S.stats.fails++;
    afterRoll(p,r);S.waitReroll=false;ends=true;
  }
  if(kind==='keep'){S.waitReroll=false;ends=true}
  if(kind==='puffer'){if(!S.settings.puffer||S.puffer<1||has(p,'feierabend'))return startTurnTimer();S.puffer--;p.chips++;logAct(p.key,'nimmt einen Chip aus dem gemeinsamen Puffer.');flash(`${p.name} nimmt sich Zeit aus dem Puffer.`,'');MO.note('puffer',{p})}
  if(kind==='overtime'){if(!S.settings.overtime||p.overtimeUsed||p.chips>0||has(p,'feierabend'))return startTurnTimer();p.chips++;p.debt=1;p.erschoepfung++;p.overtimeUsed=true;logAct(p.key,`macht Überstunden (Erschöpfung ${p.erschoepfung}/3). Nächste Woche ein Chip weniger.`);flash(p.erschoepfung>=3?`${p.name} macht Überstunden. Nächste Woche fällt ${p.name} aus.`:`${p.name} macht Überstunden. Nächste Woche fehlt die Zeit.`,p.erschoepfung>=2?'bad':'');MO.note('ueberstunden',{p})}
  if(kind==='ability'){
    if(optBlock(p,{},false))return startTurnTimer();
    if(p.abilityKey==='help'){const e=S.open.find(x=>x.id===opt.eventId);if(!e||p.chips<1||p.helpUsed||p.side!=='standing')return startTurnTimer();p.chips--;p.helpUsed=true;p.rolled=true;e.diff=Math.max(1,e.diff-1);logAct(p.key,`holt Hilfe von außen. „${e.title}“: Wagnis jetzt ab ${wagDiff(e)}.`);flash(`Hilfe von außen! „${e.title}“ wird leichter.`,'good');MO.note('f-help',{p,e});ends=true}
    if(p.abilityKey==='solve'){const e=S.open.find(x=>x.id===opt.eventId);if(!e||e.type!=='Störung'||p.chips<2||p.abilityUsed||p.side!=='standing')return startTurnTimer();p.chips-=2;p.abilityUsed=true;p.rolled=true;S.standingActed=true;flash(`${p.name} zieht „${e.title}“ durch!`,'good');resolveEvent(e,p.key,'Fähigkeit, ohne Nebenwirkung');MO.note('f-solve',{p,e,pen:basePen()});ends=true}
    if(p.abilityKey==='push'){if(p.chips<2||p.abilityUsed||p.side!=='project')return startTurnTimer();p.chips-=2;p.abilityUsed=true;p.rolled=true;S.projectActed=true;logAct(p.key,'setzt den Projektschub ein.');MO.note('f-push',{p});setProject(S.project+3,'Projektschub');ends=true}
  }
  if(kind==='eig'){
    const k=eigOf(p);if(p.eigUsed)return startTurnTimer();
    if(k==='flurfunk'){const t=S.deck[0];p.eigUsed=true;if(t){t.peeked=true;UI.peek=`${t.title} (${t.type}): ${fill(t.text)}`}else UI.peek='Der Stapel ist leer.';logAct(p.key,'hört sich im Flur um und kennt die nächste Karte.');MO.note('e-flurfunk',{p,title:t?.title})}
    if(k==='ruhe'){const e=S.open.find(x=>x.id===opt.eventId);if(!e||e.type==='Chance')return startTurnTimer();e.protected=true;p.eigUsed=true;logAct(p.key,`bleibt ruhig: „${e.title}“ darf heute liegen bleiben.`);flash(`${p.name} bleibt ruhig. „${e.title}“ kostet kein Vertrauen.`,'');MO.note('e-ruhe',{p,e})}
    if(k==='delegier'){if(optBlock(p,{},false))return startTurnTimer();const t=P(opt.target);if(!t||p.chips<1)return startTurnTimer();p.chips--;t.chips++;p.eigUsed=true;p.rolled=true;logAct(p.key,`gibt einen Chip an ${t.name} ab.`);flash(`${p.name} delegiert: ${t.name} hat einen Chip mehr.`,'');MO.note('e-delegier',{p,t});ends=true}
  }
  UI.act=null;
  if(ends)advanceTurn();else if(S.phase==='play')startTurnTimer();
  render();
}
// Projektoption mit Eigenart und Phase
function projOpt(p,o){return {...o,chips:o.id==='g'?(S.project>=6?3:2)+(has(p,'perfekt')?1:0):o.chips,project:o.id==='g'&&has(p,'perfekt')?2:o.project}}

// ---------- Wochenende ----------
function escalate(){
  logPhase('Eskalation');
  const pen=basePen();
  if(!S.open.length)logNarr('Nichts offen. Ein ruhiger Abend im Fachgebiet.');
  const keep=[];
  S.open.forEach(e=>{
    if(e.type==='Chance'){if(e.id<100)S.discard.push(e);logSys(`Chance „${e.title}“ ungenutzt.`);logNarr(e.esc);return}
    if(e.protected){e.protected=false;e.diff+=2;logSys(`„${e.title}“ bleibt liegen, ohne Vertrauensverlust. Dafür doppelt schwerer: Wagnis jetzt ab ${wagDiff(e)}.`)}
    else{e.diff++;logSys(`„${e.title}“ eskaliert. Wagnis jetzt ab ${wagDiff(e)}.`);setStanding(S.standing-pen,`„${e.title}“ bleibt liegen`);if(e.peeked){setStanding(S.standing-1,`Flurfunk: „Sie wussten es doch!“`);e.peeked=false}}
    logNarr(e.esc);keep.push(e);
  });
  S.open=keep;
  if(S.settings.stillstand){
    if(!S.projectActed){const d=S.prio==='project'?2:1;logNarr('Niemand hat diese Woche an der Vorstudie gearbeitet. Was liegen bleibt, veraltet.');setProject(S.project-d,'Stillstand: niemand war am Projekt');MO.note('stillstand',{was:'Projekt'})}
    if(!S.standingActed){const d=S.prio==='standing'?2:1;logNarr('Niemand hat sich diese Woche um den Betrieb gekümmert. Das Depot merkt es, der Vorstand auch.');setStanding(S.standing-d,'Stillstand: niemand war im Betrieb');MO.note('stillstand',{was:'Betrieb'})}
  }
  if(S.prio==='project'&&S.project<=S.projectAtStart){logNarr(`${SCENARIO.vorstand} wollte Fortschritt sehen. Es gab keinen.`);setStanding(S.standing-1,'Priorität Projekt, aber kein Fortschritt')}
  S.phase='abrechnung';MO.note('abrechnung',{start:S.weekStart,v:S.standing,p:S.project,n:S.week.length});render();
}
function toCall(){S.phase='call';UI.call={q:pickQuestion(),done:false};logPhase('Vorstands-Call');MO.note('call',{});render()}
function pickQuestion(){
  const qs=CALL_QUESTIONS.filter(q=>!(q.startsWith('Warum stehen')&&!S.open.length)&&!(q.startsWith('Wer hat entschieden')&&!S.open.some(e=>e.type==='Störung'))&&!(q.includes('Süd')&&!S.nachbarDebt));
  return qs[Math.floor(Math.random()*qs.length)]||CALL_QUESTIONS[2];
}
const callers=()=>S.players.filter((p,i)=>i===0||has(p,'folien'));
function callAnswer(key){
  if(UI.call.done)return;const p=P(key)||S.players[0];logNarr(`Vorstand: „${UI.call.q}“`);
  const r=roll();S.stats.rolls++;const parts=[{v:r.d.join('+'),l:null}];if(has(p,'folien'))parts.push({v:2,l:'Folienkönig:in'});
  const total=r.total+sumParts(parts.slice(1)),ok=total>=callThreshold();
  logAct(p.key,'antwortet dem Vorstand.');logRoll(p.key,parts,total,callThreshold(),ok,'Überzeugungswurf');diceFlash(r.d,parts,total,callThreshold(),ok,`${p.name} antwortet`);
  if(ok)setStanding(S.standing+1,'Vorstands-Call: überzeugend');else if(S.settings.callFail)setStanding(S.standing-1,'Vorstands-Call: nicht überzeugend');
  MO.note('call-antwort',{p,ok,folien:has(p,'folien')});
  UI.call.done=true;render();
}
function callObject(key){
  if(UI.call.done)return;logNarr(`Vorstand: „${UI.call.q}“`);const p=P(key);
  logAct(key,'widerspricht der Bereichsleitung offen vor dem Vorstand.');flash(`${p.name} widerspricht offen vor dem Vorstand!`,'bad');
  setStanding(S.standing-1,`${p.name} widerspricht vor dem Vorstand`);p.extraChips++;logSys(`${p.name} bekommt nächste Woche einen Chip extra.`);
  MO.note('widerspruch',{p});
  UI.call.done=true;render();
}
const lastRound=()=>(S.restructuring&&S.round>S.restructuringRound)||S.round>=S.settings.rounds;
const lernCount=()=>S.players.some(p=>has(p,'sinn'))?2:1;
function finishReflection(cards){
  cards.slice(0,lernCount()).filter(t=>t.trim()).forEach(t=>{S.lern.push({text:t.trim(),used:false});logRef(`Lernkarte: „${t.trim()}“`)});
  S.projectHist.push(S.project);
  if(lastRound()){endGame();return}
  const notes={};
  // Feierabend ist heilig: ein übriger Chip wandert mit
  S.players.forEach(p=>{if(has(p,'feierabend')&&p.chips>0&&!p.out){p.chips--;p.extraChips++;logSys(`${p.name} nimmt einen übrigen Chip mit in die nächste Woche (Feierabend ist heilig).`);notes.feierabend=p.name}});
  if(S.settings.puffer){const left=S.players.reduce((a,p)=>a+p.chips,0);const add=Math.min(2-S.puffer,Math.floor(left/2));if(add>0){S.puffer+=add;logSys(`${left} Chips blieben übrig: ${add} Puffer-Chip${add>1?'s':''} in die gemeinsame Schale (jetzt ${S.puffer}).`);flash(`Übrige Zeit wird Puffer: ${S.puffer} in der Schale.`,'good');notes.puffer=add}}
  S.round++;S.phase='event';S.eventDone=false;UI.focus=null;
  S.players.forEach(p=>{p.out=false;if(p.erschoepfung>=3){p.out=true;p.erschoepfung=0;logSys(`${p.name} ist erschöpft und fällt diese Woche aus.`);flash(`${p.name} fällt diese Woche aus: erschöpft.`,'bad',2000);notes.out=p.name}p.chips=p.out?0:Math.max(0,S.settings.chips+p.extraChips-p.debt-(S.restructuring?1:0));p.debt=0;p.extraChips=0;p.eigUsed=false;p.lernUsed=false;p.helpUsed=false;p.helpCount=0;p.passed=false;p.side=null;p.rolled=false;p.noPair=false;p.endRound=false;p.overtimeUsed=false});
  const ma=P('MA');if(S.round===4&&ma&&ma.paired<2&&!ma.left){ma.left=true;ma.chips=Math.max(0,ma.chips-(S.settings.chips-1));logSys(`${ma.name} nimmt das Angebot aus Süd an: nur noch ein Chip.`);flash(`${ma.name} wechselt nach Süd!`,'bad',2400);notes.ma=ma.name}
  logRound(S.round);logNarr(`Zurück ins Fachgebiet. Es ist wieder Dienstag.${S.restructuring?' Die Umstrukturierung läuft.':''}`);flash(`Woche ${S.round}`,'round',2000);
  MO.note('neue-woche',{round:S.round,...notes});render();
}
function endGame(){
  S.over=true;S.phase='end';stopTurnTimer();S.won=S.project>=S.settings.projectTarget&&S.standing>0;
  logPhase('Spielende');logSys(`Projekt ${S.project}/${S.settings.projectTarget}, Vertrauen ${S.standing}. ${S.won?'Teamziel erreicht.':'Teamziel verfehlt.'}`);
  flash(S.won?'Teamziel erreicht!':'Teamziel verfehlt.',S.won?'good':'bad',2600);MO.note('ende',{won:S.won});render();
}
function next(){
  if(S.over)return;
  if(S.phase==='event'){if(!S.eventDone)drawRound();startCommit()}
  else if(S.phase==='commit'){S.players.forEach(p=>{if(!p.side)p.side='standing'});stopTurnTimer();startPlay()}
  else if(S.phase==='play')endPlay();
  else if(S.phase==='escalation'){escalate();return}
  else if(S.phase==='abrechnung'){toCall();return}
  else if(S.phase==='call'){if(!UI.call.done)logSys('Vorstands-Call übersprungen.');S.phase='reflection';UI.refl=['',''];logPhase('Reflexion');logNarr('Pause im Fachgebiet.');MO.note('reflexion',{n:lernCount()})}
  render();
}
