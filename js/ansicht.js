// ---------- Darstellung: Brett, Karten, Tableaus ----------
const PORT=id=>PORTRAITS.find(x=>x.id===id)||PORTRAITS[0];
const pf=(p,cls)=>`<div class="pf ${cls||''}">${portraitSVG(PORT(p.portrait),150)}</div>`;
const chipRow=(n,max,cls)=>`<span class="tokens ${cls||''}">${Array.from({length:Math.max(n,max||0)},(_,k)=>`<i class="tok ${k<n?'':'off'}"></i>`).join('')}</span>`;
const PHASES=[['event','Ereignis'],['commit','Ansage'],['play','Spielphase'],['escalation','Wochenende'],['abrechnung','Abrechnung'],['call','Vorstands-Call'],['reflection','Reflexion']];

function render(){
  if(!S){showSetup();return}
  renderBoard();renderTable();renderStage();renderTeam();renderLog();renderTimer();
  try{localStorage.setItem(STORE,JSON.stringify(S))}catch(e){}
  MO.flush();
}

// Spielbrett: Wochenleiste links, zwei Leisten in der Mitte, Material rechts
function renderBoard(){
  const st=S.settings;
  const weeks=Array.from({length:st.rounds},(_,i)=>{const r=i+1;const sch=S.scheduled.filter(x=>x.round===r);
    return `<div class="wk ${r===S.round?'cur':r<S.round?'past':''}"><div class="wn">W${r}</div>${r===S.round&&S.prio?`<div class="wp" title="Priorität der Woche">☎ ${SIDE[S.prio]}</div>`:''}<div class="wf">${sch.map(x=>`<span class="mini-back" title="Folgekarte kommt in Woche ${r}: ${esc(CARD(x.card).title)}">${cardBackSVG(20,'!')}<i>${esc(CARD(x.card).title)}</i></span>`).join('')}</div></div>`}).join('');
  const ph=PHASES.map(([k,l])=>`<span class="${S.phase===k?'on':''}">${l}</span>`).join('');
  const sued=S.nachbarDebt?Array.from({length:S.nachbarDebt},()=>glyph('sued',20)).join(''):'<span class="muted">nichts</span>';
  const bowl=Array.from({length:2},(_,k)=>`<i class="tok puf ${k<S.puffer?'':'off'}"></i>`).join('');
  $('board').innerHTML=`<div class="b-left"><div class="bh">Wochenleiste</div><div class="weeks">${weeks}</div></div>
    <div class="b-tracks">${trackHtml('v')}${trackHtml('p')}</div>
    <div class="b-right">
      <div class="mat"><div class="stack" title="Ereignisstapel">${cardBackSVG(40,'NO')}<b class="num">${S.deck.length}</b></div><div class="ml">Stapel<br><span class="muted">Ablage ${S.discard.length}</span></div></div>
      <div class="mat sued" title="Schuld bei Süd: Frau Brandt merkt sich jeden Gefallen"><div class="tokrow">${sued}</div><div class="ml">Süd</div></div>
      ${st.puffer?`<div class="mat" title="Puffer: übrige Zeit des Teams"><div class="bowl">${bowl}</div><div class="ml">Puffer</div></div>`:''}
      <div id="timer" class="clock"><i id="hand"></i><b id="tnum"></b></div>
      <div class="tools"><div class="phases">${ph}</div><button class="small" id="btn-mo" title="Making-of-Kommentare">Making-of: ${{jeder:'jeder Zug',erst:'1. Mal',aus:'aus'}[st.makingOf]||'aus'}</button><button class="small" id="btn-komp" title="Alle Making-of-Kommentare nachlesen">?</button><button class="gear small" id="btn-gear" title="Einstellungen">⚙</button></div>
    </div>`;
  $('btn-gear').addEventListener('click',showSettings);
  $('btn-komp').addEventListener('click',()=>MO.kompendium());
  $('btn-mo').addEventListener('click',()=>{const m=['jeder','erst','aus'];S.settings.makingOf=m[(m.indexOf(S.settings.makingOf)+1)%3];setupSettings.makingOf=S.settings.makingOf;renderBoard()});
}
function trackHtml(k){
  const v=k==='v';const max=v?S.settings.standingMax:S.settings.projectTarget;const cur=v?S.standing:S.project;
  const fc=forecast(null);const pv=UI.preview;
  const f=fc?(v?fc.v:fc.p):null,ok=pv?.ok?(v?pv.ok.v:pv.ok.p):null,fl=pv?.fail?(v?pv.fail.v:pv.fail.p):null;
  const cells=Array.from({length:max+1},(_,i)=>{
    const cls=[];
    if(v){if(i===0)cls.push('z-zero');else if(S.settings.kopplung&&i<=SKEPSIS)cls.push('z-low')}
    else{cls.push(i<3?'z-a':i<6?'z-k':'z-s');if(i===max)cls.push('goal')}
    const star=!v&&S.settings.kopplung&&MILESTONES.includes(i)?`<span class="ms ${S.milestones.includes(i)?'got':''}" title="Meilenstein: +1 Vertrauen">★</span>`:'';
    return `<div class="cell ${cls.join(' ')}"><span class="cn">${i}</span>${star}${f===i&&f!==cur&&ok==null?'<span class="ring fc"></span>':''}${ok===i?'<span class="ring ok"></span>':''}${fl===i&&fl!==ok?'<span class="ring fail"></span>':''}${i===cur?pawnSVG(v?TEAL:OLIVE,22):''}</div>`}).join('');
  const now=Date.now();
  const deltas=UI.deltas.filter(d=>d.k===k&&now-d.t<2800).slice(-2).map(d=>`<span class="delta ${d.d>0?'up':'down'}" style="animation-delay:${-(now-d.t)}ms">${sgn(d.d)} ${esc(d.why)}</span>`).join('');
  let info='';
  if(pv&&ok!=null&&(ok!==f||(fl!=null&&fl!==f)))info=`<span class="okl" title="mit „${esc(pv.label)}“">damit: ${ok}${fl!=null?` <span class="fl">· scheitert: ${fl}</span>`:''}</span>`;
  else if(f!=null&&f!==cur)info=`<span class="fcl" title="Was am Wochenende passiert, wenn ab jetzt niemand mehr etwas tut">Wochenende: ${f}</span>`;
  else if(f!=null)info=`<span class="fcl" title="Prognose fürs Wochenende">Wochenende: hält</span>`;
  const legend=v?`<span class="z-low-l">${S.settings.kopplung?`1–${SKEPSIS} Skepsis: Projekt-Wagnis −1`:''}</span><span>0 Übernahme</span>`:`<span>Anlauf · Kern · Abschluss</span>${S.settings.kopplung?'<span>★ Meilenstein +1 Vertrauen</span>':''}`;
  return `<div class="track ${k}"><div class="tl">${glyph(k,22)}<b>${v?'Vertrauen':'Projekt · '+projectPhaseName()}</b><span class="num tv">${cur}${v?'':'/'+max}</span>${info}<span class="deltas">${deltas}</span></div><div class="cells">${cells}</div><div class="legend">${legend}</div></div>`;
}
function renderTimer(){
  const el=$('timer'),nb=$('tnum'),hand=$('hand');if(!el)return;
  if(!timed()||!S.settings.turnTimer){nb.textContent=timed()?'∞':'';el.className='clock off';hand.style.transform='rotate(180deg)';$('stage').classList.remove('crit');return}
  if(!UI.turnEnd){nb.textContent='';return}
  const ms=Math.max(0,UI.turnEnd-Date.now()),s=Math.ceil(ms/1000),f=Math.min(1,ms/(S.settings.turnSec*1000));const crit=s<=10&&!MO.busy();
  nb.textContent=MO.busy()?'II':s;el.className='clock'+(crit?' critt':'');hand.style.transform=`rotate(${180+(1-f)*360}deg)`;$('stage').classList.toggle('crit',crit);
}

// ---------- Karten ----------
function fxList(o,isProj,e){
  const t=[];const f=(g,v,txt,title)=>t.push(`<span class="fx">${pill(g,v,title||txt)}${txt?` ${esc(txt)}`:''}</span>`);
  if(o.resolve&&!isProj){f('ok','','erledigt');if(e&&e.type!=='Chance'&&!e.protected)t.push(`<span class="fx" title="Diesen Vertrauensverlust am Wochenende gibt es dann nicht">${pill('shield','')} verhindert ${pill('v',sgn(-(basePen()+(e.peeked?1:0))))}</span>`)}
  if(o.project)f('p',sgn(o.project),'','Projekt');
  if(o.standing)f('v',sgn(o.standing),'','Vertrauen');
  if(o.chipsAll)f('chip','+'+o.chipsAll,'für alle','Chips');
  if(o.later)f('folge','W'+(S.round+o.later.delay),'„'+CARD(o.later.card).title+'“','Folgekarte');
  if(o.nachbar)f('sued','+1','Schuld bei Süd');
  if(o.noPair)f('lock','',P(o.noPair).name+' gebunden');
  if(o.endRound)f('moon','','danach fertig für die Woche');
  if(o.nextChips)f('next',sgn(o.nextChips),'Chip nächste Woche');
  if(o.pair)f('pair','','zählt als „zu zweit“');
  if(o.escalateNow)f('boom','','eskaliert sofort','Hürde +1 und Vertrauen −'+(S.settings.escPen||1));
  if(o.escalateNow)f('v',sgn(-(S.settings.escPen||1)),'','Vertrauen');
  return t.length?`<span class="fxl">${t.join('')}</span>`:'';
}
function gameCard(e,o){
  o=o||{};const to=P(e.to);const pen=basePen()+(e.peeked?1:0);
  return `<div class="gcard t-${e.type} ${o.cls||''}" data-ev="${e.id}" ${o.pick?'tabindex="0" role="button"':''}>
    <div class="gc-head"><span class="gc-type">${e.type}${e.id>=100?' · Folge':''}</span><span class="gc-h" title="Wagnis gelingt ab dieser Augenzahl">${hurdleSVG(wagDiff(e),28)}</span></div>
    <div class="gc-art">${iconSVG(e.icon,o.big?84:54)}</div>
    <div class="gc-title">${esc(e.title)}</div>
    ${o.big?'':`<div class="gc-text">${esc(fill(e.text))}</div>`}
    <div class="gc-to">${pf(to,'mini')}<span>an ${esc(to.name)}</span>${e.peeked?'<span class="tag" title="Flurfunk-Antenne hat sie angekündigt">angekündigt</span>':''}</div>
    <div class="gc-foot">${e.type==='Chance'?'<span>verfällt am Wochenende</span>':e.protected?`<span class="fx">${pill('shield','','darf liegen bleiben')} darf liegen bleiben, wird aber doppelt schwerer</span>`:`<span>liegen lassen</span> ${pill('v',sgn(-pen),'Vertrauen am Wochenende')}`}</div>
  </div>`;
}
function renderTable(){
  const el=$('evs');
  if(!S.open.length){el.innerHTML='<div class="empty">Tisch frei.</div>';return}
  const p=S.phase==='play'&&S.turn!==null?S.players[S.turn]:null;
  const picking=UI.act&&['help','solve','ruhe'].includes(UI.act.kind);
  const canPick=e=>picking?(UI.act.kind==='solve'?e.type==='Störung':UI.act.kind==='ruhe'?e.type!=='Chance':true):(p&&p.side==='standing'&&!S.waitReroll);
  const sel=UI.act?.eventId;
  el.innerHTML=S.open.map((e,i)=>gameCard(e,{cls:`${canPick(e)?'pick':''} ${sel===e.id?'sel':''} ${picking&&!canPick(e)?'dim':''} rot${i%3}`,pick:canPick(e)})).join('');
  el.querySelectorAll('.gcard.pick').forEach(c=>{const go=()=>{const id=+c.dataset.ev;if(picking)UI.act.eventId=id;else UI.act={id:'ev:'+id,kind:'event',eventId:id,reason:false,lern:false,helpers:[]};render()};c.addEventListener('click',go);c.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();go()}})});
}
function dmBox(e){return `<div class="dmbox"><div class="h">Spielleitung liest vor</div><div class="r">${esc(fill(e.read||e.text))}</div>${e.qa?`<div class="q">Rückfragen: ${esc(fill(e.qa))}</div>`:''}</div>`}
function eigCard(p,small){
  const g=EIG(p.eig);if(!g||!S.settings.eigenarten)return '';
  return `<div class="kcard eig ${small?'small':''}"><div class="kh">Eigenart · ${g.nr}</div><div class="kt">${esc(g.name)}</div><div class="kq">${esc(g.quote)}</div><div class="kb">${pill('ok','')} ${esc(g.bonus)}</div><div class="km">${pill('boom','')} ${esc(g.malus)}</div>${p.eigUsed&&g.aktiv?'<div class="used">diese Woche genutzt</div>':''}</div>`;
}
function roleCard(p){return `<div class="kcard role" style="--pc:var(${p.color})"><div class="kh">Rolle · ${esc(p.focus)}</div><div class="kt">${esc(p.role)}</div><div class="kb"><b>Fähigkeit:</b> ${esc(p.ability)}${p.abilityUsed?' <span class="used">verbraucht</span>':''}</div></div>`}
function secretCard(p){return `<button class="kcard secret ${UI.secretOpen?'open':''}" id="s-secret" aria-pressed="${UI.secretOpen}"><span class="inner"><span class="front"><span class="kh">Verdeckte Seite</span><span class="kt">nur für ${esc(p.name)}</span><span class="muted">antippen zum Umdrehen</span></span><span class="back"><span class="kh">Geheimes Ziel</span><span class="kb">${esc(fill(p.goal))}</span><span class="kh">Geheiminfo</span><span class="kb">${esc(fill(p.info))}</span></span></span></button>`}
function exhaust(p){return `<span class="exh" title="Erschöpfung ${p.erschoepfung}/3">${[0,1,2].map(i=>`<i class="${i<p.erschoepfung?'on':''}"></i>`).join('')}</span>`}

// ---------- Bühne ----------
function renderStage(){
  const el=$('stage');
  if(S.over){el.style.setProperty('--pc','var(--ink)');el.innerHTML=renderEnd();return}
  if(S.phase==='play'&&S.turn!==null){const p=S.players[S.turn];el.style.setProperty('--pc',`var(${p.color})`);el.innerHTML=renderPlayerStage(p);bindStage(p);return}
  if(S.phase==='commit'&&S.turn!==null){
    const p=S.players[S.turn];el.style.setProperty('--pc',`var(${p.color})`);
    const n=S.open.filter(e=>e.type!=='Chance').length;const pen=basePen();
    el.innerHTML=`<div class="who">${pf(p)}<div><div class="nm">${esc(p.name)}</div><div class="rl">${esc(p.role)} · Ansage</div></div>${chipRow(p.chips,S.settings.chips,'big')}</div><div class="body">
      ${S.prio?`<div class="prompt narr">${SCENARIO.vorstand} will diese Woche vor allem: ${SIDE[S.prio]}.</div>`:''}
      <div class="prompt">Worauf setzt du diese Woche? Leg deine Ansagekarte offen.</div>
      <div class="sides">
        <button class="side st" id="c-standing"><span class="kh">Ansagekarte</span><span class="big">Betrieb</span><span>${S.open.length} Karte${S.open.length===1?'':'n'} auf dem Tisch${n?` · ${n}× ${pill('v',sgn(-pen))} wenn sie liegen bleiben`:''}</span><span class="muted">bisher ${sideCount('standing')}${S.settings.stillstand&&!sideCount('standing')?` · ohne Betrieb: ${pill('v',sgn(-(S.prio==='standing'?2:1)))}`:''}</span></button>
        <button class="side pr" id="c-project"><span class="kh">Ansagekarte</span><span class="big">Projekt</span><span>Die Vorstudie voranbringen · ${projectPhaseName()}${S.project>=6?' · gründlich kostet 3 Chips':''}${openStoerungen()?` · ${openStoerungen()} Störung${openStoerungen()>1?'en':''} bremsen das Wagnis`:''}</span><span class="muted">bisher ${sideCount('project')}${S.settings.stillstand&&!sideCount('project')?` · ohne Projekt: ${pill('p',sgn(-(S.prio==='project'?2:1)))}`:''}</span></button>
      </div>
      <div class="muted">Die Ansage gilt für die ganze Woche. Mindestens eine Handlung ist Pflicht.</div></div>`;
    $('c-standing').addEventListener('click',()=>chooseSide(p,'standing'));
    $('c-project').addEventListener('click',()=>chooseSide(p,'project'));
    return;
  }
  el.style.setProperty('--pc','var(--ink)');
  let h=`<div class="who"><div><div class="nm" style="font-size:32px">Spielleitung</div><div class="rl">${(PHASES.find(x=>x[0]===S.phase)||[0,''])[1]}</div></div></div><div class="body">`;
  if(S.phase==='event'){
    const n=eventsFor(S.round);const due=S.scheduled.filter(x=>x.round<=S.round).length;
    if(S.eventDone){
      h+=`<div class="drawn">${S.open.map(e=>`<div class="drawrow">${gameCard(e,{cls:'flip'})}${dmBox(e)}</div>`).join('')}</div>`;
      const first=S.open.find(x=>x.id===UI.focus)||S.open[0];
      h+=`<div class="row"><button class="big primary" id="s-next">Zur Ansage</button>${first?`<span class="muted">${esc(P(first.to).name)} ist adressiert und sagt zuerst an.</span>`:''}</div>`;
    } else {
      h+=S.round===1?`<div class="dmbox"><div class="h">Spielleitung liest vor</div><div class="r">${esc(SCENARIO.intro)}</div></div>`:'';
      h+=`<div class="row" style="gap:18px"><div class="stack big">${cardBackSVG(70,'NO')}</div><div><div class="prompt">Woche ${S.round}: ${n} Ereignis${n>1?'se':''}${due?` und ${due} Folge${due>1?'n':''} von früher`:''}.</div><div class="muted">Zieh die Karten vom Stapel, lies sie vor, leg sie auf den Tisch.</div></div></div><div class="row"><button class="big primary" id="s-draw">Ziehen</button></div>`;
    }
  }
  if(S.phase==='escalation'){
    const pen=basePen();const lying=S.open.filter(e=>e.type!=='Chance');const fc=forecast(null);
    const rows=lying.map(e=>`<tr><td>${esc(e.title)}</td><td>${e.protected?pill('shield','','darf liegen bleiben')+' Hürde +2':pill('v',sgn(-(pen+(e.peeked?1:0))))+' · Hürde +1'}</td></tr>`).join('');
    const still=[];if(S.settings.stillstand){if(!S.projectActed)still.push(`<tr><td>Niemand war am Projekt</td><td>${pill('p',sgn(-(S.prio==='project'?2:1)))}</td></tr>`);if(!S.standingActed)still.push(`<tr><td>Niemand war im Betrieb</td><td>${pill('v',sgn(-(S.prio==='standing'?2:1)))}</td></tr>`)}
    if(S.prio==='project'&&S.project<=S.projectAtStart)still.push(`<tr><td>Priorität Projekt, kein Fortschritt</td><td>${pill('v','−1')}</td></tr>`);
    h+=`<div class="prompt">Die Woche ist um. Was noch liegt, kommt jetzt auf die Rechnung.</div>
      ${rows||still.length?`<table class="rev">${rows}${still.join('')}</table>`:'<div class="prompt narr">Nichts liegt mehr auf dem Tisch.</div>'}
      ${S.open.filter(e=>e.type!=='Chance'&&!e.protected).map(e=>`<div class="prompt narr">„${esc(e.title)}“: ${esc(fill(e.esc))}</div>`).join('')}
      ${fc?`<div class="muted">Danach: Vertrauen ${fc.v}, Projekt ${fc.p}.</div>`:''}
      <div class="row"><button class="big primary" id="s-next">Woche abrechnen</button></div>`;
  }
  if(S.phase==='abrechnung'){
    const w=S.week;const dv=S.standing-S.weekStart.v,dp=S.project-S.weekStart.p;
    h+=`<div class="receipt"><div class="rh">Wochenabrechnung · Woche ${S.round}</div>
      ${w.length?w.map(x=>`<div class="rl2">${pill(x.k,sgn(x.d))}<span>${esc(x.why)}</span></div>`).join(''):'<div class="rl2 muted">Keine Bewegung auf den Leisten.</div>'}
      <div class="rsum"><span>${pill('v',`${S.weekStart.v} → ${S.standing}`)} ${dv?'('+sgn(dv)+')':''}</span><span>${pill('p',`${S.weekStart.p} → ${S.project}`)} ${dp?'('+sgn(dp)+')':''}</span></div></div>
      <div class="muted">Jede Zeile ist eine Entscheidung oder eine Unterlassung dieser Woche.</div>
      <div class="row"><button class="big primary" id="s-next">Zum Vorstands-Call</button></div>`;
  }
  if(S.phase==='call'){
    h+=`<div class="prompt narr">☎ ${SCENARIO.vorstand} ruft an.</div><textarea id="s-q" ${UI.call.done?'disabled':''}>${esc(UI.call.q)}</textarea>`;
    if(!UI.call.done)h+=`<div class="row">${callers().map(p=>`<button class="big primary" data-ans="${p.key}" style="color:var(${p.color})">${esc(p.name)} antwortet${has(p,'folien')?' (+2)':''}</button>`).join('')}<span class="muted">Überzeugt ab ${callThreshold()} · oder Widerspruch:</span>${S.players.slice(1).map(p=>`<button data-obj="${p.key}" style="color:var(${p.color});font-weight:800">${esc(p.name)}</button>`).join('')}</div>`;
    h+=`<div class="row"><button class="${UI.call.done?'big primary':'ghost'}" id="s-next">${UI.call.done?'Zur Reflexion':'Überspringen'}</button></div>`;
  }
  if(S.phase==='reflection'){
    const twoL=lernCount()>1;
    h+=`<div class="prompt narr">Pause im Fachgebiet. Chips bleiben liegen.</div><ol class="qs"><li>Welche Entscheidung war die schwerste, und wer hat sie getroffen?</li><li>Was wusste jemand, das die anderen nicht wussten? Hat er es gesagt?</li><li>Was machen wir nächste Woche anders?</li>${S.settings.eigenarten?'<li>Wo hat dir deine Eigenart geholfen, wo hat sie dir geschadet?</li>':''}</ol>
      <div class="lernrow"><textarea class="lernkarte" id="r1" placeholder="Lernkarte: ein Satz">${esc(UI.refl?.[0]||'')}</textarea>${twoL?`<textarea class="lernkarte" id="r2" placeholder="Zweite Lernkarte (Sinnsucher:in)">${esc(UI.refl?.[1]||'')}</textarea>`:''}</div>
      <div class="row"><button class="big primary" id="s-refl">${lastRound()?'Spiel beenden':'Zurück ins Fachgebiet'}</button></div>`;
  }
  el.innerHTML=h+'</div>';
  $('s-draw')?.addEventListener('click',()=>{drawRound();render()});
  $('s-next')?.addEventListener('click',next);
  el.querySelectorAll('[data-ans]').forEach(b=>b.addEventListener('click',()=>{UI.call.q=$('s-q').value;callAnswer(b.dataset.ans)}));
  el.querySelectorAll('[data-obj]').forEach(b=>b.addEventListener('click',()=>{UI.call.q=$('s-q').value;callObject(b.dataset.obj)}));
  $('s-q')?.addEventListener('input',e=>UI.call.q=e.target.value);
  $('s-refl')?.addEventListener('click',()=>finishReflection([$('r1').value,$('r2')?.value||'']));
  $('r1')?.addEventListener('input',e=>{UI.refl=UI.refl||['',''];UI.refl[0]=e.target.value});
  $('r2')?.addEventListener('input',e=>{UI.refl=UI.refl||['',''];UI.refl[1]=e.target.value});
}
function renderPlayerStage(p){
  let h=`<div class="who">${pf(p)}<div><div class="nm">${esc(p.name)}</div><div class="rl">${esc(p.role)} · setzt auf ${SIDE[p.side]||''}</div></div><span class="sidetag ${p.side==='standing'?'st':'pr'}">${SIDE[p.side]||''}</span>${exhaust(p)}${chipRow(p.chips,S.settings.chips,'big')}</div><div class="body">`;
  h+=`<div class="tableau ${UI.act&&!UI.secretOpen?'compact':''}">${roleCard(p)}${eigCard(p)}${secretCard(p)}</div>`;
  if(UI.peek)h+=`<div class="opts"><b>Flurfunk:</b> ${esc(UI.peek)} <button class="ghost small" id="s-peek">ok</button></div>`;
  if(S.waitReroll){
    const lr=UI.lastRoll;
    h+=`<div class="result fail">${lr.total} gegen ${lr.diff}: daneben</div><div class="prompt">Bauchmensch: nachlegen? Ein Chip, Nachwurf mit denselben Boni · Chance ${pct(pSuccess(lr.diff,lr.bonus))}</div><div class="acts"><button class="primary" id="s-reroll">Nachlegen</button><button id="s-keep">Dabei belassen</button></div>`;
    return h+'</div>';
  }
  h+=`<div class="optlabel">Deine Züge${p.rolled?'':' · mindestens eine Handlung'}${has(p,'bauch')&&!p.rolled?' · Bauchmensch: zuerst ein Wagnis':''}</div><div class="optgrid">`;
  for(const o of options(p)){
    const sel=UI.act&&UI.act.id===o.id;
    h+=`<div class="optc ${o.cls||''} ${sel?'sel':''} ${o.disabled?'dis':''}" data-o="${o.id}" ${o.disabled?'':'tabindex="0" role="button"'}>
      <div class="oh"><div style="display:flex;gap:10px;align-items:center;min-width:0">${o.icon?iconSVG(o.icon,44):''}<div><div class="ot">${esc(o.title)}</div><div class="os">${esc(fill(o.sub))}</div></div></div><div class="oc nc">${o.cost||''}</div></div>
      ${o.ok?`<div class="oe"><span class="${o.neutral?'':'g'}">${o.ok}</span>${o.fail?` · <span class="r">${esc(o.fail)}</span>`:''}</div>`:''}
      ${sel?renderSel(p,o):''}</div>`;
  }
  return h+`</div></div>`;
}
function extraParts(p){const a=UI.act;if(!a)return [];const r=[];if(a.reason&&!has(p,'bauch'))r.push({v:1,l:'Begründung'});if(a.lern&&canLern(p))r.push({v:1,l:'Lernkarte'});a.helpers.forEach(k=>r.push({v:helpVal(P(k)),l:P(k).name}));return r}
function extraBonus(p){const a=UI.act;if(!a)return 0;return (a.reason&&!has(p,'bauch')?1:0)+(a.lern&&canLern(p)?1:0)+a.helpers.reduce((s,k)=>s+helpVal(P(k)),0)}
function options(p){
  const o=[];const c=p.chips;const bauch=has(p,'bauch')&&!p.rolled;
  if(p.side==='standing'){
    S.open.forEach(e=>{
      const cheapest=Math.min(...e.opts.map(x=>x.chips||1));
      o.push({id:'ev:'+e.id,kind:'event',eventId:e.id,icon:e.icon,title:e.title,sub:`${e.type} · ${e.opts.length} Wege`,cost:`ab ${cheapest} ${glyph('chip',14)}`,ok:e.type!=='Chance'?`liegen lassen ${pill('v',sgn(-(basePen()+(e.peeked?1:0))))}`:'verfällt sonst',neutral:true,cls:'t-'+e.type,disabled:c<1&&!e.opts.some(x=>x.payer&&x.payer!==p.key&&P(x.payer).chips>0)});
    });
    if(!S.open.length)o.push({id:'bereit',kind:'bereit',title:'Bereitschaft',sub:'Tisch frei: den Betrieb am Laufen halten (Wagnis)',cost:`1 ${glyph('chip',14)}`,ok:`Wurf ≥ ${bereitDiff()}: ${pill('v','+1')}`,fail:'sonst nichts',disabled:c<1});
    if(p.abilityKey==='help'&&!p.helpUsed)o.push({id:'help',kind:'help',title:'Hilfe von außen',sub:'Fähigkeit · ein Wagnis wird um 1 leichter',cost:`1 ${glyph('chip',14)}`,ok:'Wagnis-Hürde −1',disabled:c<1||!S.open.length||bauch});
    if(p.abilityKey==='solve'&&!p.abilityUsed)o.push({id:'solve',kind:'solve',title:'Störung durchziehen',sub:'Fähigkeit · einmal pro Spiel, der einzige saubere Weg',cost:`2 ${glyph('chip',14)}`,ok:`Störung weg ${pill('shield','+'+basePen())}, keine Nebenwirkung`,disabled:c<2||!S.open.some(e=>e.type==='Störung')||bauch});
  } else {
    const stn=openStoerungen();
    o.push({id:'proj',kind:'projectD',title:'Projekt',sub:`${projectPhaseName()} · 4 Aktionskarten${S.project>=6?' · gründlich kostet jetzt 3 Chips':''}${stn?` · ${stn} offene Störung${stn>1?'en':''} bremsen das Wagnis`:''}`,cost:`ab 1 ${glyph('chip',14)}`,ok:pill('p','+1'),cls:'t-Chance',icon:'paper',disabled:c<1});
    if(p.abilityKey==='push'&&!p.abilityUsed)o.push({id:'push',kind:'push',title:'Projektschub',sub:'Fähigkeit · einmal pro Spiel, der einzige saubere Weg',cost:`2 ${glyph('chip',14)}`,ok:pill('p','+3'),disabled:c<2||bauch});
  }
  const k=eigOf(p);
  if(k&&!p.eigUsed){
    if(k==='flurfunk')o.push({id:'flurfunk',kind:'flurfunk',title:'Flurfunk',sub:'Eigenart · oberste Ereigniskarte ansehen',cost:'kein Zug',ok:'Du weißt, was kommt',fail:'bleibt sie liegen: 1 Vertrauen extra'});
    if(k==='ruhe')o.push({id:'ruhe',kind:'ruhe',title:'Die Ruhe selbst',sub:'Eigenart · eine Karte darf heute liegen bleiben',cost:'kein Zug',ok:'Kein Vertrauensverlust für diese Karte',fail:'sie wird doppelt schwerer',disabled:!S.open.some(e=>e.type!=='Chance')});
    if(k==='delegier')o.push({id:'delegier',kind:'delegier',title:'Delegieren',sub:'Eigenart · einen Chip weitergeben',cost:`1 ${glyph('chip',14)}, ist ein Zug`,ok:'Jemand anderes hat einen Zug mehr',disabled:c<1||bauch});
  }
  if(S.settings.puffer&&S.puffer>0&&!has(p,'feierabend'))o.push({id:'puffer',kind:'puffer',title:'Puffer nehmen',sub:`Gemeinsame Schale · ${S.puffer} Chip${S.puffer>1?'s':''} übrig`,cost:'kein Zug',ok:'+1 Chip für dich'});
  if(S.settings.overtime&&c<1&&!p.overtimeUsed&&!has(p,'feierabend'))o.push({id:'overtime',kind:'overtime',title:'Überstunden',sub:`Noch einen Chip aus der nächsten Woche holen · Erschöpfung ${p.erschoepfung}/3`,cost:'kein Zug',ok:'+1 Chip jetzt',fail:'nächste Woche ein Chip weniger'+(p.erschoepfung>=2?', danach fällst du aus':'')});
  o.push({id:'pass',kind:'pass',title:'Fertig',sub:p.rolled||c<1?'Keine weiteren Züge in dieser Woche':'Erst mindestens einmal handeln',cost:c>0?`${c} ${glyph('chip',14)} übrig`:'',ok:c>0&&S.settings.puffer?'Übrige Zeit wird Puffer fürs Team':'',cls:'pass',disabled:!p.rolled&&c>0});
  return o;
}
function modRow(p,a,hasLern,extra){
  const helpers=S.players.filter(h=>h.key!==p.key&&h.side===p.side&&!h.noPair&&!h.out);
  return `<div class="opts">${has(p,'bauch')?'<span class="muted">Bauchmensch: Begründen zählt bei dir nicht</span>':`<label><input type="checkbox" id="o-reason" ${a.reason?'checked':''}> Begründet (laut sagen, warum) +1 auf Wagnisse</label>`}${hasLern?`<label><input type="checkbox" id="o-lern" ${a.lern?'checked':''}> Lernkarte: +1 auf Wagnis oder 1 Chip sparen</label>`:''}
    <span class="muted">Zu zweit:</span>${helpers.length?helpers.map(h=>`<label><input type="radio" name="helper" data-h="${h.key}" ${a.helpers.includes(h.key)?'checked':''} ${h.chips<1?'disabled':''}> <span style="color:var(${h.color})">${esc(h.name)}</span> +${helpVal(h)} oder zahlt 1 Chip</label>`).join('')+`<label><input type="radio" name="helper" data-h="" ${!a.helpers.length?'checked':''}> allein</label>`:'<span class="muted">niemand auf deiner Seite</span>'}${extra||''}</div>`;
}
// Eine Option als Zeile (Ereigniskarte) oder als Aktionskarte (Projekt)
function optRow(p,x,e,isProj){
  const a=UI.act;const c=optCost(p,x,a,e);const block=optBlock(p,x,isProj);const avail=!block&&c.payer.chips>=c.payerCost&&!(c.payer!==p&&c.payer.out);
  const wag=!!x.roll;const parts=wag?[...wagBase(p,e),...extraParts(p)]:[];const diff=e?wagDiff(e):projectDiff();const bonus=sumParts(parts);const ch=wag?pSuccess(diff,bonus):null;
  const toks=`<span class="ctoks">${Array.from({length:c.payerCost},()=>glyph('chip',18)).join('')}</span>`;
  const costTxt=c.payer!==p?`${toks}<small>von ${esc(c.payer.name)}</small>`:`${toks}${c.helperPays?`<small>+1 von ${esc(c.helper.name)}</small>`:''}${c.notes.length?`<small>${esc(c.notes.join(', '))}</small>`:''}`;
  const okFx=fxList(wag?{...x,roll:null}:x,isProj,e)||(isProj?'':fxList({resolve:true},false,e));
  const failFx=wag?(Object.keys(x.roll.fail||{}).length?fxList(x.roll.fail,isProj,e):'<span class="fx">Chip weg, Karte bleibt</span>'):'';
  const bonusTxt=parts.length?` <span class="calc" title="${esc(partsTxt(parts))}">${sgn(bonus)}</span>`:'';
  return `<div class="orow ${isProj?'acard':''} ${wag?'wag':''} ${avail?'':'dis'}" data-prev="${x.id}" tabindex="-1">
    <div class="om">${isProj?'<div class="kh">Aktionskarte · Projekt</div>':''}<div class="ol">${esc(fill(x.label))}${wag?` <span class="wtag">${dieSVG(5,16)} Wagnis</span>`:''}</div><div class="ox">${esc(fill(x.text))}</div>
      <div class="oce">${wag?`<div class="wl">${hurdleSVG(diff,24)} Wurf${bonusTxt} → <b>${pct(ch)}</b>${parts.length?` <span class="muted">(${esc(partsTxt(parts))})</span>`:''}</div><div>Erfolg: ${okFx}</div><div>Fehlschlag: ${failFx}</div>`:okFx}</div>
      ${block?`<div class="blk">${esc(block)}</div>`:''}</div>
    <div class="ocost">${costTxt}</div><button class="small ${wag?'':'primary'}" data-opt="${x.id}" ${avail?'':'disabled'}>Wählen</button></div>`;
}
function previewFor(p,x,e,isProj){
  const hOk={resolve:!isProj&&x.resolve&&e?e.id:null,v:x.standing||0,p:isProj?(x.project||0):(x.project||0),side:p.side};
  let hFail=null;
  if(x.roll){const f=x.roll.fail||{};hFail={resolve:null,v:(f.standing||0)-(f.escalateNow?(S.settings.escPen||1):0),p:f.project||0,side:p.side}}
  return {label:fill(x.label),ok:forecast(hOk),fail:hFail?forecast(hFail):null};
}
function renderSel(p,o){
  const a=UI.act;const hasLern=canLern(p);
  if(o.kind==='event'||o.kind==='projectD'){
    const e=o.kind==='event'?S.open.find(x=>x.id===o.eventId):null;
    const list=o.kind==='event'?e.opts:PROJECT_OPTS.map(x=>projOpt(p,x));
    return `${e?`<div class="selcard">${gameCard(e,{big:true})}${dmBox(e)}</div>`:''}<div class="orows ${e?'':'proj'}">${list.map(x=>optRow(p,x,e,!e)).join('')}</div>${modRow(p,a,hasLern)}<div class="acts"><button class="ghost" id="o-cancel">Zurück</button></div>`;
  }
  if(o.kind==='bereit'){
    const parts=wagBase(p,{type:'Bereit'});const bonus=sumParts(parts)+extraBonus(p);
    return modRow(p,a,hasLern,`<span class="sum num">${sgn(bonus)} gegen ${bereitDiff()} → ${pct(pSuccess(bereitDiff(),bonus))}</span>`)+`<div class="acts"><button class="primary" id="o-go">Würfeln</button><button class="ghost" id="o-cancel">Abbrechen</button></div>`;
  }
  if(o.kind==='help'||o.kind==='solve'||o.kind==='ruhe'){
    const list=S.open.filter(e=>o.kind==='solve'?e.type==='Störung':o.kind==='ruhe'?e.type!=='Chance':true);
    return `<div class="opts"><span class="muted">Welche Karte? (auch links auf dem Tisch antippen)</span>${list.map(e=>`<button class="small ${a.eventId===e.id?'primary':''}" data-pick="${e.id}">${esc(e.title)}</button>`).join('')}</div>
      <div class="acts"><button class="primary" id="o-go" ${a.eventId?'':'disabled'}>Einsetzen</button><button class="ghost" id="o-cancel">Abbrechen</button></div>`;
  }
  if(o.kind==='delegier')return `<div class="opts"><span class="muted">An wen?</span>${S.players.filter(h=>h.key!==p.key&&!h.out).map(h=>`<button class="small" data-t="${h.key}" style="color:var(${h.color})">${esc(h.name)}</button>`).join('')}<button class="ghost small" id="o-cancel">Abbrechen</button></div>`;
  if(o.kind==='push')return `<div class="acts"><button class="primary" id="o-go">Projektschub einsetzen</button><button class="ghost" id="o-cancel">Abbrechen</button></div>`;
  if(o.kind==='puffer')return `<div class="acts"><button class="primary" id="o-go">Chip nehmen</button><button class="ghost" id="o-cancel">Abbrechen</button></div>`;
  if(o.kind==='overtime')return `<div class="prompt">Du holst dir Zeit aus der nächsten Woche. Das merkt man.</div><div class="acts"><button class="primary" id="o-go">Überstunden machen</button><button class="ghost" id="o-cancel">Abbrechen</button></div>`;
  if(o.kind==='pass')return `<div class="acts"><button class="primary" id="o-go">Fertig für diese Woche</button><button class="ghost" id="o-cancel">Doch nicht</button></div>`;
  return '';
}
function bindStage(p){
  const el=$('stage');
  $('s-secret')?.addEventListener('click',()=>{UI.secretOpen=!UI.secretOpen;if(UI.secretOpen)MO.note('verdeckt',{p});render()});
  $('s-peek')?.addEventListener('click',()=>{UI.peek=null;render()});
  $('s-reroll')?.addEventListener('click',()=>doAction(p,'reroll'));
  $('s-keep')?.addEventListener('click',()=>doAction(p,'keep'));
  el.querySelectorAll('.optc:not(.dis)').forEach(c=>{const go=e=>{
    if(e.target.closest('.opts,.acts,.orows,.dmbox,.selcard,button,label,input'))return;
    const o=options(p).find(x=>x.id===c.dataset.o);if(!o)return;
    if(o.kind==='flurfunk'){doAction(p,'eig');return}
    UI.act={id:o.id,kind:o.kind,eventId:o.eventId||null,reason:false,lern:false,helpers:[]};render();
  };c.addEventListener('click',go);c.addEventListener('keydown',e=>{if(e.target===c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();go(e)}})});
  const a=UI.act;if(!a)return;
  // Vorschau auf dem Brett, solange eine Option unter dem Zeiger liegt
  el.querySelectorAll('[data-prev]').forEach(r=>{const show=()=>{const e=a.kind==='event'?S.open.find(x=>x.id===a.eventId):null;const list=e?e.opts:PROJECT_OPTS.map(x=>projOpt(p,x));const x=list.find(y=>y.id===r.dataset.prev);if(!x)return;UI.preview=previewFor(p,x,e,!e);renderBoard();renderTimer()};
    r.addEventListener('mouseenter',show);r.addEventListener('focusin',show);r.addEventListener('mouseleave',()=>{UI.preview=null;renderBoard();renderTimer()})});
  $('o-reason')?.addEventListener('change',e=>{a.reason=e.target.checked;render()});
  $('o-lern')?.addEventListener('change',e=>{a.lern=e.target.checked;render()});
  el.querySelectorAll('[data-h]').forEach(c=>c.addEventListener('change',()=>{const k=c.dataset.h;a.helpers=k?[k]:[];render()}));
  el.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>{a.eventId=+b.dataset.pick;render()}));
  el.querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',()=>doAction(p,'eig',{target:b.dataset.t})));
  el.querySelectorAll('[data-opt]').forEach(b=>b.addEventListener('click',()=>{const opt={optId:b.dataset.opt,eventId:a.eventId,reason:a.reason,lern:a.lern,helpers:a.helpers};if(a.kind==='event')doAction(p,'opt',opt);else doAction(p,'popt',opt)}));
  $('o-cancel')?.addEventListener('click',()=>{UI.act=null;UI.preview=null;render()});
  $('o-go')?.addEventListener('click',()=>{
    const opt={eventId:a.eventId,reason:a.reason,lern:a.lern,helpers:a.helpers};
    if(a.kind==='bereit')doAction(p,'bereit',opt);
    else if(a.kind==='help'||a.kind==='solve'||a.kind==='push')doAction(p,'ability',{eventId:a.eventId});
    else if(a.kind==='ruhe')doAction(p,'eig',{eventId:a.eventId});
    else if(a.kind==='puffer')doAction(p,'puffer');
    else if(a.kind==='overtime')doAction(p,'overtime');
    else if(a.kind==='pass')passTurn();
  });
}
function renderTeam(){
  $('team').innerHTML=S.players.map((p,i)=>{
    const g=EIG(p.eig);const active=(S.phase==='play'||S.phase==='commit')&&S.turn===i;
    return `<div class="tm ${active?'active':''} ${S.phase==='play'&&p.passed&&!active?'passed':''}" style="--pc:var(${p.color})" title="${esc(p.role)}">
      ${pf(p)}<div class="r1"><span class="n">${esc(p.name)}</span><span class="rl">${esc(p.role)}</span></div>
      <div class="r2">${p.side&&(S.phase==='commit'||S.phase==='play')?`<span class="sidetag ${p.side==='standing'?'st':'pr'}">${SIDE[p.side]}</span>`:''}${active?'<span class="tag">'+(S.phase==='commit'?'sagt an':'am Zug')+'</span>':S.phase==='play'&&p.passed?'<span class="tag">fertig</span>':''}${p.noPair?'<span class="tag">gebunden</span>':''}${p.out?'<span class="tag">erschöpft</span>':''}${p.left?'<span class="tag">gewechselt</span>':''}${exhaust(p)}${p.extraChips||p.debt?`<span>${sgn(p.extraChips-p.debt)} nächste Woche</span>`:''}${chipRow(p.chips,S.settings.chips)}</div>
      ${S.settings.eigenarten&&g?`<div class="r3" title="${esc(g.bonus+' / '+g.malus)}"><b>${esc(g.name)}</b> ${esc(g.quote)}</div>`:''}</div>`}).join('');
  $('lk').innerHTML=S.lern.length?`<div class="lkh">Lernkarten</div>${S.lern.map(k=>`<span class="k ${k.used?'used':''}">${esc(k.text)}</span>`).join('')}`:'';
}
function renderLog(){
  const el=$('log');const atBottom=el.scrollHeight-el.scrollTop-el.clientHeight<40||!el.dataset.f;
  el.innerHTML=S.log.map(l=>`<div class="l ${l.k}">${l.h||esc(l.t)}</div>`).join('');el.dataset.f='1';if(atBottom)el.scrollTop=el.scrollHeight;
}
function goalHint(p){
  if(p.key==='MA')return `${p.paired}× zu zweit${p.left?', gewechselt':''}`;
  if(p.key==='TP'){let s=0;for(let i=1;i<S.projectHist.length;i++)if(S.projectHist[i]===S.projectHist[i-1])s++;return s?`Projekt stand ${s}× still`:'nie stehen geblieben'}
  if(p.key==='BL')return 'Vertrauensverlauf im Protokoll';return 'siehe Protokoll';
}
function renderEnd(){
  const st=S.stats;
  return `<div class="who"><div><div class="nm" style="color:var(${S.won?'--good':'--crit'})">${S.won?'Teamziel erreicht':'Teamziel verfehlt'}</div><div class="rl">Nach Woche ${S.round}</div></div></div><div class="body">
    <div class="tiles"><div class="tile"><div class="v num">${S.project}/${S.settings.projectTarget}</div><div class="k">Projekt</div></div><div class="tile"><div class="v num">${S.standing}</div><div class="k">Vertrauen</div></div><div class="tile"><div class="v num">${st.sicher}</div><div class="k">sichere Wege</div></div><div class="tile"><div class="v num">${st.wagnis}</div><div class="k">Wagnisse</div></div><div class="tile"><div class="v num">${st.succ+st.fails?Math.round(100*st.succ/(st.succ+st.fails)):0}%</div><div class="k">Würfe ok</div></div><div class="tile"><div class="v num">${S.nachbarDebt}</div><div class="k">Schuld bei Süd</div></div><div class="tile"><div class="v num">${st.timeouts}</div><div class="k">Zeit abgelaufen</div></div></div>
    <div class="prompt">Verdeckte Seiten auf den Tisch. Wer hat sein Ziel geschafft, wer hat es geopfert, wer hat geschwiegen?</div>
    <table class="rev">${S.players.map(p=>`<tr><td style="color:var(${p.color});font-weight:800;white-space:nowrap">${esc(p.name)}${S.settings.eigenarten&&EIG(p.eig)?`<div class="muted" style="font-weight:600">${esc(EIG(p.eig).name)}</div>`:''}</td><td>${esc(fill(p.goal))}<div class="muted">${esc(fill(p.info))}</div></td><td class="muted" style="white-space:nowrap">${goalHint(p)}</td></tr>`).join('')}</table>
    <div class="muted">Wo hast du etwas getan, weil es Punkte brachte, das du im echten Fachgebiet nie tun würdest?</div>
    <div class="row"><button class="big primary" id="s-new">Neues Spiel</button><button id="s-copy">Protokoll kopieren</button></div></div>`;
}
document.addEventListener('click',e=>{if(e.target.id==='s-new')resetGame();if(e.target.id==='s-copy')copyLog(e.target)});

// ---------- Overlay: Aufbau & Einstellungen ----------
function settingsHtml(s){
  return `<div class="grid">
    <label>Würfel<select id="s-dice"><option value="d6" ${s.dice==='d6'?'selected':''}>W6 · Hürden 4–6</option><option value="2d6" ${s.dice==='2d6'?'selected':''}>2W6 · Hürden 7–9</option></select></label>
    <label>Making-of-Kommentare<select id="s-mo"><option value="jeder" ${s.makingOf==='jeder'?'selected':''}>bei jedem Zug</option><option value="erst" ${s.makingOf==='erst'?'selected':''}>nur beim ersten Mal</option><option value="aus" ${s.makingOf==='aus'?'selected':''}>aus</option></select></label>
    <label>Chips pro Woche<input id="s-chips" type="number" min="1" max="6" value="${s.chips}"></label>
    <label>Wochen<input id="s-rounds" type="number" min="2" max="8" value="${s.rounds}"></label>
    <label>Vertrauen Start<input id="s-standing" type="number" min="1" max="10" value="${s.standingStart}"></label>
    <label>Vertrauen Max<input id="s-standingmax" type="number" min="5" max="15" value="${s.standingMax}"></label>
    <label>Projektziel<input id="s-project" type="number" min="3" max="15" value="${s.projectTarget}"></label>
    <label>Hürde min<input id="s-diffmin" type="number" min="2" max="12" value="${s.diffMin}"></label>
    <label>Hürde max<input id="s-diffmax" type="number" min="2" max="12" value="${s.diffMax}"></label>
    <label>Ereignisse pro Woche<input id="s-events" value="${esc(s.events)}" placeholder="2,3,3,4"></label>
    <label>Projekt-Hürden (Wagnis)<input id="s-pd" value="${esc(s.pd)}" placeholder="4,5,7"></label>
    <label>Vertrauensverlust je liegengebliebener Karte<input id="s-escpen" type="number" min="1" max="3" value="${s.escPen}"></label>
    <label>Wagnis-Aufschlag<input id="s-wagplus" type="number" min="0" max="3" value="${s.wagnisPlus}"></label>
    <label>Bereitschaft-Hürde<input id="s-bereit" type="number" min="2" max="6" value="${s.bereit}"></label>
    <label>Helfer-Bonus (Wagnis)<input id="s-helpb" type="number" min="1" max="3" value="${s.helpB}"></label>
    <label>Sekunden pro Zug<input id="s-turnsec" type="number" min="5" max="180" value="${s.turnSec}"></label>
    <label>Zeit abgelaufen<select id="s-timeout"><option value="hard" ${s.timeoutMode==='hard'?'selected':''}>Chip verloren</option><option value="mild" ${s.timeoutMode==='mild'?'selected':''}>Zug verfällt</option></select></label>
    <label class="ck"><input id="s-eig" type="checkbox" ${s.eigenarten?'checked':''}> Eigenart-Karten</label>
    <label class="ck"><input id="s-kopplung" type="checkbox" ${s.kopplung?'checked':''}> Leisten gekoppelt (Meilensteine, Skepsis)</label>
    <label class="ck"><input id="s-puffer" type="checkbox" ${s.puffer?'checked':''}> Puffer (übrige Chips werden Teamzeit)</label>
    <label class="ck"><input id="s-overtime" type="checkbox" ${s.overtime?'checked':''}> Überstunden erlaubt</label>
    <label class="ck"><input id="s-stillstand" type="checkbox" ${s.stillstand?'checked':''}> Stillstand kostet</label>
    <label class="ck"><input id="s-prio" type="checkbox" ${s.prio?'checked':''}> Priorität der Woche</label>
    <label class="ck"><input id="s-callfail" type="checkbox" ${s.callFail?'checked':''}> Call-Fehlschlag kostet Vertrauen</label>
    <label class="ck"><input id="s-critonce" type="checkbox" ${s.critOnce?'checked':''}> Glanzwurf nur 1× pro Woche</label>
    <label class="ck"><input id="s-turntimer" type="checkbox" ${s.turnTimer?'checked':''}> Zugtimer</label></div>`;
}
function readSettings(){
  const g=id=>$(id);const s={...DEFAULT_SETTINGS,...setupSettings};if(!g('s-dice'))return s;
  s.dice=g('s-dice').value;s.makingOf=g('s-mo').value;s.chips=+g('s-chips').value;s.rounds=+g('s-rounds').value;s.standingStart=+g('s-standing').value;s.standingMax=+g('s-standingmax').value;s.projectTarget=+g('s-project').value;
  s.diffMin=+g('s-diffmin').value;s.diffMax=+g('s-diffmax').value;s.turnSec=+g('s-turnsec').value;s.timeoutMode=g('s-timeout').value;s.turnTimer=g('s-turntimer').checked;s.eigenarten=g('s-eig').checked;s.kopplung=g('s-kopplung').checked;
  s.events=g('s-events').value||'2,3,3,4';s.pd=g('s-pd').value||'4,5,7';s.escPen=+g('s-escpen').value||1;s.bereit=+g('s-bereit').value||5;s.helpB=+g('s-helpb').value||1;s.callFail=g('s-callfail').checked;s.critOnce=g('s-critonce').checked;s.wagnisPlus=+g('s-wagplus').value||0;s.puffer=g('s-puffer').checked;s.overtime=g('s-overtime').checked;s.stillstand=g('s-stillstand').checked;s.prio=g('s-prio').checked;return s;
}
function bindDice(){$('s-dice')?.addEventListener('change',e=>{if(e.target.value==='2d6'){$('s-diffmin').value=7;$('s-diffmax').value=9}else{$('s-diffmin').value=4;$('s-diffmax').value=6}})}
function simHtml(){return `<details><summary>Balancing: Auto-Sim</summary><div class="row" style="margin-top:8px"><label class="muted">Partien <input id="sim-n" type="number" value="500" min="10" max="5000" style="width:80px"></label>
  <select id="sim-strat"><option value="klug">klug (Wagnis bei ≥ 67 %, billig wenn verkraftbar, sonst sicher)</option><option value="sicher">immer der sichere, teure Weg</option><option value="billig">immer der billige Weg, Nebenwirkungen egal</option><option value="wagnis">immer Wagnis</option><option value="mix">sicher wenn möglich, sonst billig</option></select><button class="primary" id="btn-sim">Simulieren</button></div><div id="simres" class="tiles sim"></div></details>`}
function bindSim(){$('btn-sim')?.addEventListener('click',()=>{const s=readSettings();const r=simulate(Math.max(10,Math.min(5000,+$('sim-n').value||500)),$('sim-strat').value,s);const pc=x=>Math.round(100*x/r.games)+'%';
  $('simres').innerHTML=`<div class="tile"><div class="v">${pc(r.won)}</div><div class="k">Teamziel</div></div><div class="tile"><div class="v">${pc(r.projectReached)}</div><div class="k">Projekt voll</div></div><div class="tile"><div class="v">${pc(r.lostStanding)}</div><div class="k">Vertrauen 0</div></div><div class="tile"><div class="v num">${r.avgProject.toFixed(1)}</div><div class="k">Ø Projekt</div></div><div class="tile"><div class="v num">${r.avgStanding.toFixed(1)}</div><div class="k">Ø Vertrauen</div></div><div class="tile"><div class="v num">${(r.follow/r.games).toFixed(1)}</div><div class="k">Folgekarten/Partie</div></div><div class="tile"><div class="v num">${(r.rolls/r.games).toFixed(0)}</div><div class="k">Würfe/Partie</div></div>`})}
function eigOptions(sel){return EIGENARTEN.map(g=>`<option value="${g.key}" ${sel===g.key?'selected':''}>${g.nr} · ${g.name}</option>`).join('')}
function eigPreview(k){const g=EIG(k);return `<div class="kcard eig small"><div class="kh">Eigenart · ${g.nr} · steckt dahinter: ${esc(g.staerke)}</div><div class="kt">${esc(g.name)}</div><div class="kq">${esc(g.quote)}</div><div class="kb">${pill('ok','')} ${esc(g.bonus)}</div><div class="km">${pill('boom','')} ${esc(g.malus)}</div></div>`}
// Würfeln auf dem W12. Ist die Eigenart schon vergeben: nochmal.
function rollEig(i){const taken=setupPlayers.filter((x,j)=>j!==i).map(x=>x.eig);let n,g,t=0;do{n=1+Math.floor(Math.random()*12);g=EIGENARTEN.find(x=>x.nr===n);t++}while(taken.includes(g.key)&&t<50);return {n,g}}
function showSetup(){
  const ov=$('ov');ov.hidden=false;$('app').style.visibility='hidden';
  ov.innerHTML=`<div class="box"><h1>Planspiel Hot-Seat</h1><div class="muted">Vier Rollen, eine Spielleitung, ein Bildschirm. Figur wählen, Namen eintragen, Eigenart wählen oder auswürfeln, los. Regelstand v3.0, Prototyp für die Brettspielfassung.</div>
    <div class="scen">${esc(SCENARIO.intro)}</div>
    <div class="row"><button id="btn-rollall">${d12SVG(12,22)} Alle Eigenarten auswürfeln</button><span class="muted">12 Eigenart-Karten, jede mit Bonus und Malus. Doppelt gewürfelt? Nochmal.</span></div>
    <div class="seats">${ROLES.map((r,i)=>{const sp=setupPlayers[i];sp.portrait=sp.portrait||PORTRAITS[i].id;return `<div class="seat" style="--pc:var(${r.color})"><div class="r">${r.role}</div>
      <div class="pick"><div class="pf" id="pf-${i}">${portraitSVG(PORT(sp.portrait),150)}</div><div><input data-n="${i}" value="${esc(sp.name)}" aria-label="Name" style="width:120px"><div class="muted" style="font-size:12px" id="pl-${i}">${esc(PORT(sp.portrait).line)}</div></div></div>
      <div class="pgrid" data-pg="${i}">${PORTRAITS.map(pt=>`<div class="pp ${sp.portrait===pt.id?'on':''}" data-pid="${pt.id}" title="${esc(pt.name)}: ${esc(pt.line)}">${portraitSVG(pt,44)}</div>`).join('')}</div>
      <div class="eigpick"><select data-s="${i}" aria-label="Eigenart">${eigOptions(sp.eig)}</select><button class="small" data-roll="${i}" title="Mit dem W12 auswürfeln" aria-label="Eigenart auswürfeln">${d12SVG(sp.eig?EIG(sp.eig).nr:12,22)}</button></div>
      <div id="sd-${i}">${eigPreview(sp.eig)}</div></div>`}).join('')}</div>
    <details><summary>Regeln anpassen</summary><div style="margin-top:8px">${settingsHtml({...DEFAULT_SETTINGS,...setupSettings})}</div></details>${simHtml()}
    <div class="row"><button class="big primary" id="btn-start">Spiel starten</button>${hasSaved()?'<button id="btn-resume">Spielstand fortsetzen</button>':''}<button class="ghost" id="btn-komp0">Making-of lesen</button></div></div>`;
  ov.querySelectorAll('[data-n]').forEach(i=>i.addEventListener('input',e=>setupPlayers[+i.dataset.n].name=e.target.value));
  ov.querySelectorAll('.pgrid').forEach(g=>g.querySelectorAll('.pp').forEach(pp=>pp.addEventListener('click',()=>{const i=+g.dataset.pg;const pt=PORT(pp.dataset.pid);setupPlayers[i].portrait=pt.id;const inp=ov.querySelector(`[data-n="${i}"]`);if(!inp.value||PORTRAITS.some(x=>x.name===inp.value)){setupPlayers[i].name=pt.name;inp.value=pt.name}$('pf-'+i).innerHTML=portraitSVG(pt,150);$('pl-'+i).textContent=pt.line;g.querySelectorAll('.pp').forEach(x=>x.classList.toggle('on',x.dataset.pid===pt.id))})));
  const setEig=(i,k,rolled)=>{setupPlayers[i].eig=k;ov.querySelector(`[data-s="${i}"]`).value=k;$('sd-'+i).innerHTML=eigPreview(k);const b=ov.querySelector(`[data-roll="${i}"]`);b.innerHTML=d12SVG(EIG(k).nr,22,rolled?'roll':'')};
  ov.querySelectorAll('[data-s]').forEach(i=>i.addEventListener('change',e=>setEig(+i.dataset.s,e.target.value)));
  ov.querySelectorAll('[data-roll]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.roll;const r=rollEig(i);setEig(i,r.g.key,true)}));
  $('btn-rollall').addEventListener('click',()=>{setupPlayers.forEach(x=>x.eig=null);ROLES.forEach((r,i)=>{const x=rollEig(i);setEig(i,x.g.key,true)})});
  bindDice();bindSim();
  $('btn-start').addEventListener('click',startGame);
  $('btn-komp0').addEventListener('click',()=>MO.kompendium());
  $('btn-resume')?.addEventListener('click',()=>{try{S=JSON.parse(localStorage.getItem(STORE));migrate();UI.call=UI.call||{q:CALL_QUESTIONS[0],done:false};closeOverlay();if(timed()&&S.turn!==null)startTurnTimer();render()}catch(e){}});
}
function showSettings(){
  const ov=$('ov');ov.hidden=false;
  ov.innerHTML=`<div class="box"><h1>Einstellungen</h1><div class="muted">Regeländerungen gelten ab dem nächsten Spiel, die Making-of-Einstellung sofort. Regelstand v3.0.</div>${settingsHtml({...DEFAULT_SETTINGS,...(S?S.settings:setupSettings)})}${simHtml()}
    <div class="row"><button class="primary" id="btn-apply">Übernehmen</button><button id="btn-copy">Protokoll kopieren</button><button id="btn-new">Neues Spiel</button><button class="ghost" id="btn-close">Schließen</button></div></div>`;
  bindDice();bindSim();
  $('btn-apply').addEventListener('click',()=>{setupSettings=readSettings();if(S){S.settings.makingOf=setupSettings.makingOf;render()}closeOverlay()});
  $('btn-copy').addEventListener('click',e=>copyLog(e.target));
  $('btn-new').addEventListener('click',()=>{setupSettings=readSettings();resetGame()});
  $('btn-close').addEventListener('click',closeOverlay);
  ov.addEventListener('click',e=>{if(e.target===ov)closeOverlay()},{once:true});
}
function closeOverlay(){$('ov').hidden=true;$('app').style.visibility=''}
function hasSaved(){try{const s=JSON.parse(localStorage.getItem(STORE)||'null');return s&&!s.over&&s.scheduled}catch(e){return false}}
function migrate(){if(S){S.settings={...DEFAULT_SETTINGS,...S.settings};S.milestones=S.milestones||[];S.week=S.week||[];S.weekStart=S.weekStart||{v:S.standing,p:S.project}}}
function startGame(){
  setupSettings=readSettings();setupPlayers.forEach((sp,i)=>{if(!sp.eig)sp.eig=rollEig(i).g.key});
  S=newState(setupSettings,setupPlayers);MO.reset();
  UI={...UI,act:null,lastRoll:null,peek:null,timerId:null,turnEnd:null,call:{q:CALL_QUESTIONS[0],done:false},refl:['',''],flashQ:[],flashBusy:false,secretOpen:false,focus:null,preview:null,deltas:[]};
  logRound(1);logNarr(SCENARIO.intro);
  logSys(`Am Tisch: ${S.players.map(p=>`${p.name} (${p.role}${S.settings.eigenarten?', '+EIG(p.eig).name:''})`).join(', ')}.`);logPhase('Ereignis');
  MO.note('start',{players:S.players});
  closeOverlay();flash('Woche 1','round',2000);render();
}
function resetGame(){stopTurnTimer();if(S){setupPlayers=S.players.map(p=>({name:p.name,eig:p.eig,portrait:p.portrait}))}S=null;try{localStorage.removeItem(STORE)}catch(e){}render()}
function copyLog(btn){
  if(!S)return;const txt=S.log.map(l=>l.k==='round'?`\n=== ${l.t} ===`:l.k==='phase'?`--- ${l.t} ---`:l.t).join('\n');
  const done=()=>{const t=btn.textContent;btn.textContent='Kopiert';setTimeout(()=>btn.textContent=t,1500)};
  const fb=()=>{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){}document.body.removeChild(ta)};
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(txt).then(done).catch(fb);else fb();
}

// ---------- Start ----------
function boot(data){if(data&&data.S){S=data.S;migrate();UI={...UI,...(data.UI||{}),timerId:null,turnEnd:null,flashQ:[],flashBusy:false};if(timed()&&S.turn!==null)startTurnTimer()}render()}
try{window.claude?.hot?.snapshot?.(()=>({S,UI:{call:UI.call,refl:UI.refl}}))}catch(e){}
document.addEventListener('keydown',e=>{if(MO.open&&(e.key==='Escape'||e.key==='Enter')){e.preventDefault();MO.close()}});
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
