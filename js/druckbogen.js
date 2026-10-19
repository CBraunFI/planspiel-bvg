// ---------- Druckbogen: alle Spielmaterialien der Brett- und Kartenfassung aus denselben Daten ----------
// Lädt nur grafik.js und daten.js. Regelwerte kommen aus DEFAULT_SETTINGS, damit Karte und Simulator dasselbe sagen.
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fill=t=>String(t).replace(/\{MA\}/g,'Mitarbeitende:r');
const ST=DEFAULT_SETTINGS;
const PEN=ST.escPen||1, WPLUS=ST.wagnisPlus||0;
const ROLE=k=>ROLES.find(r=>r.key===k);
const wag=e=>e.diff+WPLUS;
const PROJ_HURDLES=String(ST.pd).split(',').map(n=>+n+WPLUS);
const EV_COUNTS=String(ST.events).split(',').map(Number);
const chips=n=>`<span class="ctoks">${Array.from({length:n},()=>glyph('chip',13)).join('')}</span>`;

// Zusätzliche Symbole nur für Plättchen und Brett
const XGLYPH={
  tea:`<path d="M4 8h10v4a5 5 0 0 1-10 0z" fill="${BONE}" stroke="${INK}" stroke-width="1.4"/><path d="M14 9.5h1.5a2 2 0 0 1 0 4H13.6" fill="none" stroke="${INK}" stroke-width="1.4"/><path d="M7 2.5q-1 1.5 0 3M10 2.5q-1 1.5 0 3" fill="none" stroke="${SLATE}" stroke-width="1.2" stroke-linecap="round"/><path d="M3 17.5h12" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`,
  ear:`<path d="M6 8a5 5 0 0 1 10 0c0 3-3 4-3 6.5a2.5 2.5 0 0 1-5 0" fill="${BONE}" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/><path d="M9 8.5a2 2 0 0 1 4 0c0 1.5-1.5 2-1.5 3" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/><path d="M2.5 6q-1.5 3 0 6M17.8 4.5q1.4 2 .2 4.5" fill="none" stroke="${RUST}" stroke-width="1.3" stroke-linecap="round"/>`,
  phone:`<path d="M4 6q0-3 6-3t6 3v2h-3.5V6.5h-5V8H4z" fill="${INK}"/><path d="M5 9.5h10l1.5 7.5h-13z" fill="${MUST}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="10" cy="13" r="2" fill="none" stroke="${INK}" stroke-width="1.2"/>`,
  star:`<path d="M10 1.8l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L10 14.2 5 17l1.2-5.6L2 7.6l5.6-.6z" fill="${MUST}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`,
  puf:`<circle cx="10" cy="10" r="7" fill="${TEAL}" stroke="${INK}" stroke-width="1.6"/><circle cx="10" cy="10" r="3.2" fill="none" stroke="${PAPER}" stroke-width="1"/>`,
  plus:`<text x="10" y="14.5" text-anchor="middle" font-size="13" font-weight="800" fill="${TEAL}" font-family="sans-serif">+1</text>`,
  minus:`<text x="10" y="14.5" text-anchor="middle" font-size="13" font-weight="800" fill="${RUST}" font-family="sans-serif">−1</text>`,
};
const xg=(k,s)=>`<svg viewBox="0 0 20 20" width="${s||16}" height="${s||16}" aria-hidden="true" class="gl">${XGLYPH[k]||GLYPH[k]||''}</svg>`;

// ---------- Wirkungen auf Papier (wie fxList im Simulator, aber ohne Spielstand) ----------
function fxP(o,isProj){
  const t=[];const f=(g,v,txt)=>t.push(`<span class="fx">${pill(g,v)}${txt?` ${esc(txt)}`:''}</span>`);
  if(o.resolve&&!isProj)f('ok','','erledigt');
  if(o.project)f('p',sgn(o.project));
  if(o.standing)f('v',sgn(o.standing));
  if(o.chipsAll)f('chip','+'+o.chipsAll,'für alle');
  if(o.later)f('folge','',`in ${o.later.delay} ${o.later.delay>1?'Wochen':'Woche'}: „${CARD(o.later.card).title}“`);
  if(o.nachbar)f('sued','+1','Schuld bei Süd');
  if(o.noPair)f('lock','',ROLE(o.noPair).role+' gebunden');
  if(o.endRound)f('moon','','danach fertig für die Woche');
  if(o.nextChips)f('next',sgn(o.nextChips),'Chip nächste Woche');
  if(o.pair)f('pair','','zählt als „zu zweit“');
  if(o.escalateNow){f('boom','','eskaliert sofort');f('v',sgn(-PEN))}
  return t.join('');
}
function optP(x,e){
  const isProj=!e;const w=!!x.roll;
  const okFx=fxP(w?{...x,roll:null}:x,isProj)||(isProj?'':fxP({resolve:true}));
  const failFx=w?(Object.keys(x.roll.fail||{}).length?fxP(x.roll.fail,isProj):'<span class="fx">Chip weg, Karte bleibt</span>'):'';
  const payer=x.payer?`<small>von ${esc(ROLE(x.payer).role)}</small>`:'';
  const hurdle=isProj?PROJ_HURDLES.map(n=>hurdleSVG(n,14)).join(''):hurdleSVG(wag(e),14);
  return `<div class="po ${w?'wag':''}"><div class="pcost">${chips(x.chips)}${payer}</div><div class="pm">
    <div class="pl">${esc(fill(x.label))}${w?` <span class="wtag">${dieSVG(5,11)} Wagnis</span>`:''}</div>
    <div class="px">${esc(fill(x.text))}</div>
    ${w?`<div class="pw">${hurdle}<span>Erfolg: ${okFx}</span><span>Fehlschlag: ${failFx}</span></div>`:`<div class="pw">${okFx}</div>`}
  </div></div>`;
}

// ---------- Ereignis- und Folgekarten ----------
function evFront(e){
  const r=ROLE(e.to);const folge=e.id>=100;
  const foot=e.type==='Chance'?'<span>verfällt am Wochenende</span>':
    `<span>liegen lassen</span> ${pill('v',sgn(-PEN))} <span class="muted">bei ${xg('phone',11)} Betrieb</span> ${pill('v',sgn(-(PEN+1)))} <span class="muted">· Hürde +1</span>`;
  return `<div class="pc gcard t-${e.type} ${folge?'folge':''}">
    <div class="gc-head"><span class="gc-type">${e.type}${folge?' · Folge':''}</span><span class="nr">${e.id}</span><span class="gc-h" title="Wagnis gelingt ab dieser Augenzahl">${hurdleSVG(wag(e),26)}</span></div>
    <div class="gc-art">${iconSVG(e.icon,66)}</div>
    <div class="gc-title">${esc(e.title)}</div>
    <div class="gc-text">${esc(fill(e.text))}</div>
    <div class="gc-to"><i class="rdot" style="background:var(${r.color})"></i>an ${esc(r.role)}</div>
    <div class="popts">${e.opts.map(x=>optP(x,e)).join('')}</div>
    <div class="gc-foot">${foot}</div>
  </div>`;
}
const evBack=folge=>folge?
  `<div class="pc back b-folge"><div class="bf"><div class="bk">Folgekarte</div><svg viewBox="0 0 20 20" class="bgl">${GLYPH.folge}</svg><div class="bt">Die Rechnung<br>von früher</div><div class="bs">verdeckt auf die Wochenleiste</div></div></div>`:
  `<div class="pc back b-ev"><div class="bf"><div class="bk">Ereigniskarte</div><div class="bno">NO</div><div class="bt">Fachgebiet Nord-Ost</div><div class="bs">Depot der Zukunft</div></div></div>`;

// ---------- Kleine Karten (63 × 88 mm) ----------
function eigFront(g){
  return `<div class="pc kc eig"><div class="kh"><span>Eigenart</span>${d12SVG(g.nr,30)}</div>
    <div class="kt">${esc(g.name)}</div><div class="kq">${esc(g.quote)}</div>
    <div class="kb">${pill('ok','')} ${esc(g.bonus)}</div><div class="km">${pill('boom','')} ${esc(g.malus)}</div>
    <div class="kf">steckt dahinter: <b>${esc(g.staerke)}</b>${g.aktiv?' · aktiv':''}</div></div>`;
}
const eigBack=()=>`<div class="pc back b-eig"><div class="bf"><div class="bk">Eigenart</div>${d12SVG('W12',70)}<div class="bt">Eine Stärke,<br>die zu weit geht</div><div class="bs">wählen oder mit dem W12 würfeln</div></div></div>`;
function roleFront(r){
  const types=FOCUS_MATCH[r.focus].join(', ');
  return `<div class="pc kc role" style="--pc:var(${r.color})"><div class="kh"><span>Rolle · ${esc(r.focus)}</span></div>
    <div class="kt">${esc(r.role)}</div>
    <div class="kb"><b>Schwerpunkt:</b> +2 auf Wagnisse bei ${esc(types)}-Karten</div>
    <div class="kb"><b>Fähigkeit:</b> ${esc(fill(r.ability))}</div>
    <div class="kf">Die Fähigkeit ist der einzige saubere Weg im Spiel.</div></div>`;
}
const roleBack=r=>`<div class="pc back b-role" style="--pc:var(${r.color})"><div class="bf"><div class="bk">Rollenkarte</div><div class="bt big">${esc(r.role)}</div><div class="bs">offen auf das Tableau</div></div></div>`;
function goalFront(r){
  return `<div class="pc kc goal" style="--pc:var(${r.color})"><div class="kh"><span>Verdeckte Seite · ${esc(r.role)}</span>${glyph('lock',16)}</div>
    <div class="kh2">Geheimes Ziel</div><div class="kb">${esc(fill(r.goal))}</div>
    <div class="kh2">Geheiminfo</div><div class="kb">${esc(fill(r.info))}</div>
    <div class="kf">Nur selbst ansehen. Verdeckt an dein Tableau.</div></div>`;
}
const goalBack=r=>`<div class="pc back b-goal" style="--pc:var(${r.color})"><div class="bf"><div class="bk">Zielkarte · verdeckt</div><svg viewBox="0 0 20 20" class="bgl">${GLYPH.lock}</svg><div class="bt">nur für</div><div class="bt big">${esc(r.role)}</div></div></div>`;
function projFront(x){
  let o={...x};let note='';
  if(x.id==='g')note=`<div class="kf">Ab Projekt 6 (Abschluss): ${chips(3)} · Perfektionist:in: +1 Chip, Projekt +2</div>`;
  if(x.id==='w')note=`<div class="kf">Hürde je Phase: Anlauf ${PROJ_HURDLES[0]} · Kernarbeit ${PROJ_HURDLES[1]} · Abschluss ${PROJ_HURDLES[2]}</div>`;
  return `<div class="pc kc proj"><div class="kh"><span>Aktionskarte · Projekt</span>${glyph('p',16)}</div>
    <div class="popts">${optP(o,null)}</div>${note}<div class="kq">${esc(x.out)}</div></div>`;
}
const projBack=()=>`<div class="pc back b-proj"><div class="bf"><div class="bk">Aktionskarte</div><svg viewBox="0 0 20 20" class="bgl">${GLYPH.p}</svg><div class="bt">Projekt</div><div class="bs">Vorstudie „Depot der Zukunft“</div></div></div>`;
function callFront(r,side){
  const v=side==='standing';
  return `<div class="pc kc call ${v?'c-v':'c-p'}" style="--pc:var(${r.color})"><div class="kh"><span>Ansage</span></div>
    <div class="cbig">${iconSVG(v?'signal':'paper',84)}<div class="kt">${v?'Betrieb':'Projekt'}</div></div>
    <div class="kb">${v?'Ich kümmere mich diese Woche um den Betrieb.':'Ich arbeite diese Woche an der Vorstudie.'}</div>
    <div class="kf"><i class="rdot" style="background:var(${r.color})"></i>${esc(r.role)}</div></div>`;
}
const callBack=r=>`<div class="pc back b-moon" style="--pc:var(${r.color})"><div class="bf"><div class="bk">Ansage · Rückseite</div><svg viewBox="0 0 20 20" class="bgl">${GLYPH.moon}</svg><div class="bt">Fertig für<br>die Woche</div><div class="bs">${esc(r.role)}</div></div></div>`;
const lernFront=()=>`<div class="pc kc lern"><div class="kh"><span>Lernkarte</span>${xg('star',16)}</div>
  <div class="kb">Ein Satz, den ihr in der Reflexion gelernt habt:</div><div class="lines">${'<i></i>'.repeat(6)}</div>
  <div class="kf">+1 auf ein Wagnis oder 1 Chip sparen. Laut sagen, wie der Satz gerade hilft, dann umdrehen. Gilt einmal.</div></div>`;
const lernBack=()=>`<div class="pc back b-lern"><div class="bf"><div class="bk">Lernkarte</div><svg viewBox="0 0 20 20" class="bgl">${XGLYPH.star}</svg><div class="bt">Gelernt</div><div class="bs">aus der Reflexion</div></div></div>`;

// ---------- Vorstands-Call: Fragekarten (63 × 88 mm) ----------
const callCond=q=>q.startsWith('Warum stehen')?'nur wenn Karten offen liegen':q.startsWith('Wer hat entschieden')?'nur wenn eine Störung offen liegt':q.includes('Süd')?'nur bei Schuld bei Süd':'';
function kessFront(q,i){
  const c=callCond(q);
  return `<div class="pc kc kess"><div class="kh"><span>Vorstands-Call · Frage ${i+1}</span>${xg('phone',16)}</div>
    <div class="kwho">Dr. Kessler fragt:</div><div class="kt kq2">„${esc(q)}“</div>
    ${c?`<div class="kcond">${esc(c)}</div>`:''}
    <div class="kf">Bereichsleitung antwortet (Folienkönig:in darf, +2). W6 ab 4: überzeugt ${pill('v','+1')}, sonst ${pill('v','−1')}. Wer offen widerspricht: ${pill('v','−1')}, nächste Woche +1 Chip.</div></div>`;
}
const kessBack=()=>`<div class="pc back b-kess"><div class="bf"><div class="bk">Vorstands-Call</div><svg viewBox="0 0 20 20" class="bgl">${XGLYPH.phone}</svg><div class="bt">Dr. Kessler<br>ruft an</div><div class="bs">Spielleitung zieht eine passende Frage</div></div></div>`;

// ---------- Spielhilfe (95 × 135 mm, vier je Bogen) ----------
function hilfeFront(){
  const step=(n,t,x)=>`<li><b>${n} · ${t}</b><span>${x}</span></li>`;
  return `<div class="pc hilfe"><div class="hh"><span>Spielhilfe</span><b>Eine Woche</b></div><ol class="hsteps">
    ${step(1,'Ereignis',`Dr. Kessler ruft an, W6: 1–3 ${xg('phone',10)} Betrieb, 4–6 Projekt. Die Spielleitung deckt die Ereignisse der Woche auf (${EV_COUNTS.join(' / ')}) und die fälligen Folgekarten.`)}
    ${step(2,'Ansage','Alle legen verdeckt Betrieb oder Projekt und decken gleichzeitig auf. Helfen darf nur, wer dieselbe Ansage hat.')}
    ${step(3,'Spielphase',`Reihum je ein Zug, ${ST.turnSec} Sekunden Sanduhr, ${ST.chips} Chips Führungszeit. Wer fertig ist, dreht die Ansage auf ${glyph('moon',10)}.`)}
    ${step(4,'Wochenende',`Jede liegen gebliebene Karte ${pill('v',sgn(-PEN))} (bei Betrieb ${pill('v',sgn(-(PEN+1)))}) und Hürde +1. Niemand am Projekt ${pill('p','−1')}, niemand im Betrieb ${pill('v','−1')}. Chancen verfallen. 2 übrige Chips = 1 Puffer-Chip.`)}
    ${step(5,'Abrechnung','Die Spielleitung liest jede Bewegung auf den Leisten mit ihrem Grund vor.')}
    ${step(6,'Vorstands-Call','Eine Frage von Dr. Kessler. Die Bereichsleitung antwortet und würfelt.')}
    ${step(7,'Reflexion','Was ist passiert, was nehmt ihr mit? Ein Satz auf eine Lernkarte.')}
  </ol><div class="hf">Ziel: Projekt ${ST.projectTarget} in ${ST.rounds} Wochen, ohne das Vertrauen des Vorstands zu verspielen.</div></div>`;
}
function hilfeBack(){
  return `<div class="pc hilfe hb"><div class="hh"><span>Spielhilfe</span><b>Dein Zug</b></div>
    <div class="hk"><b>Karte erledigen</b> Einen Weg wählen und seine Chips zahlen. Jeder Weg hat einen Preis, nur die Fähigkeiten der Rollen sind sauber.</div>
    <div class="hk"><b>Wagnis</b> W6 gegen die Zahl im gestrichelten Würfel. Boni: Schwerpunkt +2 · laut begründen +1 · je Helfer:in +2 (zahlt selbst 1 Chip) · Lernkarte +1.
      <div class="hrow">${dieSVG(1,18)}<span><b>Patzer:</b> ein zweites Ereignis</span>${dieSVG(6,18)}<span><b>Glanzwurf:</b> ${pill('v','+1')}, einmal pro Woche</span></div></div>
    <div class="hk"><b>Projekt</b> Gründlich, Schnell, Süd einbinden oder Wagnis (Hürde ${PROJ_HURDLES.join(' / ')} je Phase). Jede offene Störung −1, Skepsis (Vertrauen ≤ ${SKEPSIS}) −1.</div>
    <div class="hk"><b>Keine Chips mehr?</b> Überstunden: 1 Chip jetzt, nächste Woche einer weniger, ein Strich Erschöpfung. Beim dritten fällst du eine Woche aus.</div>
    <div class="hk"><b>Leisten</b> Meilenstein ${MILESTONES.join(' und ')}: ${pill('v','+1')} einmalig. Vertrauen 0: Süd übernimmt.</div></div>`;
}

// ---------- Würfel zum Basteln ----------
const tabPath=(a,b,n,d,k)=>`<path class="tabp" d="M${a[0]} ${a[1]}L${a[0]+(b[0]-a[0])*k+n[0]*d} ${a[1]+(b[1]-a[1])*k+n[1]*d}L${b[0]-(b[0]-a[0])*k+n[0]*d} ${b[1]-(b[1]-a[1])*k+n[1]*d}L${b[0]} ${b[1]}"/>`;
// W6: Kreuznetz oben, links, vorn, rechts, unten, hinten. Sieben Laschen, jede offene Kante genau eine.
function d6Net(faces,label,s){
  s=s||20;const o=6,W=3*s+2*o,H=4*s+2*o;const pos=[[1,0],[0,1],[1,1],[2,1],[1,2],[1,3]];
  const P=i=>[o+pos[i][0]*s,o+pos[i][1]*s];const t=(a,b,n)=>tabPath(a,b,n,4,.25);
  const [tx,ty]=P(0),[lx,ly]=P(1),[rx,ry]=P(3);
  const tabs=[t([tx,ty],[tx+s,ty],[0,-1]),
    t([lx,ly],[lx+s,ly],[0,-1]),t([lx,ly+s],[lx+s,ly+s],[0,1]),t([lx,ly],[lx,ly+s],[-1,0]),
    t([rx,ry],[rx+s,ry],[0,-1]),t([rx,ry+s],[rx+s,ry+s],[0,1]),t([rx+s,ry],[rx+s,ry+s],[1,0])];
  const sq=pos.map((p,i)=>{const [x,y]=P(i);return `<g transform="translate(${x} ${y})"><rect class="face" width="${s}" height="${s}"/>${faces[i](s)}</g>`}).join('');
  return `<figure class="net"><svg viewBox="0 0 ${W} ${H}" style="width:${W}mm;height:${H}mm">${tabs.join('')}${sq}</svg><figcaption>${label}</figcaption></figure>`;
}
const pipFace=n=>s=>PIPS[n].map(([x,y])=>`<circle cx="${x*s/100}" cy="${y*s/100}" r="${s*.085}" fill="${INK}"/>`).join('');
const prioFace=v=>s=>`<g transform="translate(${s*.28} ${s*.1}) scale(${s*.44/20})">${XGLYPH.phone}</g><text x="${s/2}" y="${s*.82}" text-anchor="middle" class="ft" style="font-size:${s*.2}px">${v?'Betrieb':'Projekt'}</text>`;
// W12: zwei Blüten aus je sechs Fünfecken; die zweite ist die erste, um 180° um den Mittelpunkt einer Außenkante gedreht
function d12Net(s){
  s=s||13;const R=s/(2*Math.sin(Math.PI/5));
  const C=Array.from({length:5},(_,k)=>{const a=-Math.PI/2+k*2*Math.PI/5;return [R*Math.cos(a),R*Math.sin(a)]});
  const refl=(Q,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy;return Q.map(([x,y])=>{const t=((x-a[0])*dx+(y-a[1])*dy)/L;return [2*(a[0]+t*dx)-x,2*(a[1]+t*dy)-y]})};
  const flower=[C];
  // Blütenblatt k: Spiegelung der Mitte an Kante k; Ecken so ordnen, dass Kante 0 an der Mitte liegt
  for(let k=0;k<5;k++){const a=C[k],b=C[(k+1)%5];const N=refl(C,a,b);const i=N.findIndex(p=>Math.hypot(p[0]-b[0],p[1]-b[1])<1e-6);flower.push(Array.from({length:5},(_,j)=>N[(i+j)%5]))}
  const J=flower[3];const m=[(J[2][0]+J[3][0])/2,(J[2][1]+J[3][1])/2];
  const flower2=flower.map(Q=>Q.map(([x,y])=>[2*m[0]-x,2*m[1]-y]));
  const all=[...flower,...flower2];const pts=all.flat();const pad=6;
  const x0=Math.min(...pts.map(p=>p[0]))-pad,y0=Math.min(...pts.map(p=>p[1]))-pad;
  const W=Math.max(...pts.map(p=>p[0]))-x0+pad,H=Math.max(...pts.map(p=>p[1]))-y0+pad;
  const cen=Q=>[Q.reduce((t,p)=>t+p[0],0)/5,Q.reduce((t,p)=>t+p[1],0)/5];
  const t=(a,b,c)=>{const mx=(a[0]+b[0])/2-c[0],my=(a[1]+b[1])/2-c[1],l=Math.hypot(mx,my);return tabPath(a,b,[mx/l,my/l],3.5,.22)};
  // Laschen: in jeder Blüte Kante 1 jedes Blütenblatts (klebt am Nachbarblatt), dazu die Außenkanten 2 und 3 der ersten Blüte außer dem Gelenk
  const tabs=[];
  [flower,flower2].forEach((F,fi)=>F.slice(1).forEach((Q,k)=>{const c=cen(Q);tabs.push(t(Q[1],Q[2],c));
    if(fi===0){if(k!==2)tabs.push(t(Q[2],Q[3],c));tabs.push(t(Q[3],Q[4],c))}}));
  const nums=[1,12,2,11,3,10,7,6,8,5,9,4];
  const faces=all.map((Q,i)=>{const [cx,cy]=cen(Q);const n=nums[i];return `<polygon class="face" points="${Q.map(p=>p.join(',')).join(' ')}"/><text x="${cx}" y="${cy+s*.2}" text-anchor="middle" class="ft n" style="font-size:${s*.55}px">${n}${n===6||n===9?'.':''}</text>`}).join('');
  return `<figure class="net"><svg viewBox="${x0} ${y0} ${W} ${H}" style="width:${W}mm;height:${H}mm">${tabs.join('')}${faces}</svg><figcaption>W12 · Eigenart auswürfeln</figcaption></figure>`;
}
function diceHtml(){
  const std=[pipFace(1),pipFace(3),pipFace(2),pipFace(4),pipFace(6),pipFace(5)];
  const prio=[prioFace(1),prioFace(0),prioFace(1),prioFace(0),prioFace(1),prioFace(0)];
  return `<div class="dice-page"><h2>Würfel zum Basteln</h2>
    <p>Auf Karton (160–250 g/m²) drucken. Außen an der durchgezogenen Linie schneiden, die Innenkanten mit Lineal und stumpfem Messer anritzen und falten, dann die grauen Laschen innen verkleben. Gekaufte Würfel tun es genauso.</p>
    <div class="nets">${d6Net(std,'W6 · Wagnis')}${d6Net(std,'W6 · zweiter Würfel')}${d6Net(prio,'W6 · Priorität der Woche')}${d12Net(15)}</div></div>`;
}

// ---------- Schachtel: Deckel und Inventar ----------
function coverHtml(){
  return `<div class="cover"><div class="cv-in">
    <div class="cv-k">Planspiel · Brett- und Kartenfassung</div>
    <div class="cv-no">NO</div>
    <div class="cv-t">Fachgebiet Nord-Ost</div>
    <div class="cv-s">Vorstudie „Depot der Zukunft“</div>
    <div class="cv-art">${ROLES.map(r=>`<span><i class="rdot" style="background:var(${r.color})"></i>${esc(r.role)}</span>`).join('')}</div>
    <div class="cv-meta"><span><b>4</b> Spielende + Spielleitung</span><span><b>${ST.rounds}</b> Wochen</span><span>Führen zwischen Betrieb und Projekt</span></div>
    <div class="cv-f">JUMP-Programm · Prototyp · Regelstand v3.0</div></div></div>`;
}
function inventoryHtml(){
  const row=(n,t,who)=>`<tr><td class="cb">☐</td><td class="n">${n}</td><td>${t}</td><td class="muted">${who||''}</td></tr>`;
  return `<div class="ovw inv"><h1>Inventar</h1><p class="lead">Vor dem Spiel und beim Einpacken abhaken. Fehlt etwas, unten notieren.</p>
    <table><tr><th></th><th>Stück</th><th>Material</th><th>wohin</th></tr>
    ${row(1,'Spielbrett','Tischmitte')}
    ${row(2,'Spielfiguren Vertrauen und Projekt','Leisten')}
    ${row(EVENTS.length,'Ereigniskarten (Grundstapel)','Spielleitung')}
    ${row(FOLLOW.length,'Folgekarten, eigene Rückseite','Spielleitung')}
    ${row(CALL_QUESTIONS.length,'Fragekarten Vorstands-Call','Spielleitung')}
    ${row(ROLES.length,'Tableaus','je Person 1')}
    ${row(ROLES.length,'Rollenkarten','je Person 1')}
    ${row(ROLES.length,'Verdeckte Zielkarten','je Person 1')}
    ${row(ROLES.length*2,'Ansagekarten Betrieb und Projekt','je Person 2')}
    ${row(EIGENARTEN.length,'Eigenart-Karten','je Person 1')}
    ${row(PROJECT_OPTS.length,'Projekt-Aktionskarten','Tischmitte')}
    ${row(4,'Spielhilfen','je Person 1')}
    ${row('',"Blanko-Lernkarten",'Reflexion')}
    ${row(27,'Chips Führungszeit','je Person 3')}
    ${row(4,'Puffer-Chips','Puffer-Schale')}
    ${row(8,'Süd-Marker','Süd-Feld')}
    ${row(12,'Plättchen +1 und −1','Vorrat')}
    ${row(16,'Plättchen Schloss, Teetasse, Ohr, Mond','Vorrat')}
    ${row(4,'Telefon-Plättchen Priorität','Wochenleiste')}
    ${row(2,'Meilenstein-Sterne','Projektleiste')}
    ${row(1,'Scheibe „Süd übernimmt“','Vorrat')}
    ${row(1,'W12','Aufbau')}
    ${row(2,'W6, dazu der Prioritätswürfel','Tischmitte')}
    ${row(1,'60-Sekunden-Sanduhr','Spielleitung')}
    ${row(1,'Abrechnungsblock','Spielleitung')}
    ${row(1,'Spielleitungsheft','Spielleitung')}
    ${row('','Stifte','')}
    </table><div class="invnote">Fehlt: <i class="ln"></i></div></div>`;
}

// ---------- Bögen mit Schneidemarken ----------
const SIZES={a4p:[210,297],a4l:[297,210],a3l:[420,297]};
function sheet(sec,size,inner,label,extra){
  return `<section class="sheet ${size} ${extra||''}" data-sec="${sec}">${inner}<div class="slabel">Planspiel BVG · Regelstand v3.0 · ${esc(label)}</div></section>`;
}
function grid(cells,cols,rows,w,h,size){
  const [W,H]=SIZES[size];const x0=(W-cols*w)/2,y0=(H-rows*h)/2;const gw=cols*w,gh=rows*h;
  const marks=[];
  for(let i=0;i<=cols;i++){const x=x0+i*w;marks.push(`<i class="cm v" style="left:${x}mm;top:${y0-7}mm"></i><i class="cm v" style="left:${x}mm;top:${y0+gh+2}mm"></i>`)}
  for(let j=0;j<=rows;j++){const y=y0+j*h;marks.push(`<i class="cm h" style="top:${y}mm;left:${x0-7}mm"></i><i class="cm h" style="top:${y}mm;left:${x0+gw+2}mm"></i>`)}
  return `<div class="cgrid" style="left:${x0}mm;top:${y0}mm;grid-template-columns:repeat(${cols},${w}mm);grid-template-rows:repeat(${rows},${h}mm)">${cells.map(c=>`<div class="ccell">${c||''}</div>`).join('')}</div><div class="marks">${marks.join('')}</div>`;
}
// Vorderseiten und gespiegelte Rückseiten: beidseitig drucken, an der langen Kante wenden
function cardSheets(sec,cards,cols,rows,w,h,title){
  const per=cols*rows;const out=[];const n=Math.ceil(cards.length/per);
  for(let s=0;s<n;s++){
    const chunk=cards.slice(s*per,s*per+per);while(chunk.length<per)chunk.push(null);
    const fronts=chunk.map(c=>c&&c.front);
    const backs=[];for(let r=0;r<rows;r++)for(let c=cols-1;c>=0;c--){const k=chunk[r*cols+c];backs.push(k&&k.back)}
    out.push(sheet(sec,'a4p',grid(fronts,cols,rows,w,h,'a4p'),`${title} · Bogen ${s+1}/${n} · Vorderseiten`));
    out.push(sheet(sec,'a4p',grid(backs,cols,rows,w,h,'a4p'),`${title} · Bogen ${s+1}/${n} · Rückseiten (beidseitig, lange Kante)`,'backs'));
  }
  return out.join('');
}

// ---------- Spielbrett (A3 quer, für A4 quer verkleinert) ----------
function boardHtml(){
  const vmax=ST.standingMax,pmax=ST.projectTarget;
  const vcells=Array.from({length:vmax+1},(_,i)=>{
    const cls=i===0?'z-zero':i<=SKEPSIS?'z-low':'';
    const tag=i===0?'Übernahme':i<=SKEPSIS?'Skepsis':i===ST.standingStart?'Start':i===vmax?'höchstens':'';
    return `<div class="bc ${cls}"><b>${i}</b>${tag?`<span>${tag}</span>`:''}</div>`}).join('');
  const phase=i=>i<3?'z-a':i<6?'z-k':'z-s';
  const pcells=Array.from({length:pmax+1},(_,i)=>{
    const star=MILESTONES.includes(i)?`<span class="star">${xg('star',30)}<small>+1 ${glyph('v',10)}</small></span>`:'';
    const tag=i===0?'Start':i===pmax?'fertig!':'';
    return `<div class="bc ${phase(i)} ${i===pmax?'goal':''}"><b>${i}</b>${star}${tag?`<span>${tag}</span>`:''}</div>`}).join('');
  const ph=[['Anlauf',0,3,PROJ_HURDLES[0]],['Kernarbeit',3,6,PROJ_HURDLES[1]],['Abschluss',6,pmax+1,PROJ_HURDLES[2]]]
    .map(([n,a,b,hd])=>`<div class="phb ${phase(a)}" style="grid-column:${a+1}/${b+1}">${n} · Projekt-Wagnis ab ${hd}${a>=6?' · Gründlich 3 Chips':''}</div>`).join('');
  const weeks=Array.from({length:ST.rounds},(_,i)=>`<div class="bwk"><div class="wkh"><div><div class="bwn">Woche ${i+1}</div><div class="wc">${EV_COUNTS[i]||''} Ereignisse ziehen</div></div>
    <div class="spot phone">${xg('phone',22)}<small>Priorität</small></div></div>
    <div class="spot folge">${glyph('folge',18)}<small>Folgekarten dieser Woche<br>verdeckt hierher</small></div></div>`).join('');
  return `<div class="brd">
    <div class="btop"><div class="btitle">Fachgebiet Nord-Ost <span>· Vorstudie „Depot der Zukunft“</span></div>
      <div class="blegend">${pill('v','')} Vertrauen ${pill('p','')} Projekt ${pill('chip','')} Chip ${pill('sued','')} Süd ${pill('folge','')} Folgekarte ${pill('moon','')} fertig ${pill('lock','')} gebunden ${pill('next','')} nächste Woche</div></div>
    <div class="bmid">
      <div class="tracks">
        <div class="trk v"><div class="th">${glyph('v',20)} Vertrauen des Vorstands</div><div class="tcells" style="grid-template-columns:repeat(${vmax+1},1fr)">${vcells}</div>
          <div class="tleg"><span>Felder 1–${SKEPSIS} rot: Vorstand skeptisch, Projekt-Wagnisse −1</span><span>0: Übernahme durch Süd</span></div></div>
        <div class="trk p"><div class="th">${glyph('p',20)} Projekt · Vorstudie</div>
          <div class="tcells" style="grid-template-columns:repeat(${pmax+1},1fr)">${ph}${pcells}</div>
          <div class="tleg"><span>★ Meilenstein: Vertrauen einmalig +1, Stern umdrehen</span><span>${pmax}: Vorstudie fertig</span></div></div>
      </div>
      <div class="bside">
        <div class="fld sued"><div class="fh">${glyph('sued',20)} Süd</div><div class="fx2">Schuld bei Süd: je Gefallen ein Süd-Marker</div><div class="sdots">${'<i></i>'.repeat(6)}</div></div>
        <div class="fld puffer"><div class="fh">Puffer-Schale <span class="fx2">höchstens 2 · jede:r darf nehmen</span></div><div class="bowl2"><i></i><i></i></div></div>
      </div>
    </div>
    <div class="bbot"><div class="wh">Wochenleiste <span>· Ereignisstapel und Ablage liegen neben dem Brett bei der Spielleitung</span></div><div class="wrow">${weeks}</div></div>
  </div>`;
}

// ---------- Tableaus (A5 quer, zwei pro Bogen) ----------
function tableau(r){
  return `<div class="tab" style="--pc:var(${r.color})">
    <div class="tabh"><b>Tableau · ${esc(r.role)}</b><span>Name: <i class="ln"></i></span></div>
    <div class="tslots"><div class="ts">Rollenkarte<small>offen</small></div><div class="ts">Eigenart-Karte<small>offen</small></div><div class="ts">Zielkarte<small>verdeckt</small></div></div>
    <div class="tbot">
      <div class="tf"><div class="tl">Führungszeit · ${ST.chips} Chips pro Woche</div><div class="cslots">${'<i></i>'.repeat(ST.chips)}</div></div>
      <div class="tf"><div class="tl">${glyph('next',12)} Nächste Woche</div><div class="nbox">Chips, die schon verplant sind</div></div>
      <div class="tf"><div class="tl">Erschöpfung</div><div class="exh2"><i></i><i></i><i></i></div><small>Beim dritten Strich: eine Woche aus</small></div>
      <div class="tf"><div class="tl">${glyph('lock',12)} ${glyph('moon',12)} Plättchen</div><div class="nbox"></div></div>
    </div></div>`;
}

// ---------- Plättchen ----------
function disc(inner,cls,cap){return `<div class="disc ${cls||''}">${inner}${cap?`<small>${cap}</small>`:''}</div>`}
const rep=(n,f)=>Array.from({length:n},f).join('');
function tokensHtml(){
  const grp=(t,note,items)=>`<div class="tg"><div class="tgh"><b>${t}</b> ${note?`<span>${note}</span>`:''}</div><div class="tgl">${items}</div></div>`;
  const pawnStand=(c,label)=>`<div class="stand"><div class="tab1"></div><div class="pn rot">${pawnSVG(c,40)}<small>${label}</small></div><div class="pn">${pawnSVG(c,40)}<small>${label}</small></div><div class="tab1"></div></div>`;
  return [`<div class="tokens-page">
    ${grp('Chips · Führungszeit','3 je Person, Rest für Überstunden und Verstärkung',rep(27,()=>disc(glyph('chip',40),'chip')))}
    ${grp('Puffer-Chips','in die Puffer-Schale',rep(4,()=>disc(xg('puf',40),'puf')))}
    ${grp('Süd-Marker','aufs Süd-Feld',rep(8,()=>disc(glyph('sued',40),'sued')))}
  </div>`,`<div class="tokens-page">
    ${grp('Vertrauen auf der Karte','Glanzwurf, Hilfe von außen',rep(6,()=>disc(xg('plus',44),'plus'))+rep(6,()=>disc(xg('minus',44),'minus')))}
    ${grp('Zustände','',rep(4,()=>disc(glyph('lock',30),'',`gebunden`))+rep(4,()=>disc(xg('tea',30),'',`Ruhe selbst`))+rep(4,()=>disc(xg('ear',30),'',`Flurfunk`))+rep(4,()=>disc(glyph('moon',30),'',`fertig`)))}
    ${grp('Telefon · Priorität der Woche','W6: 1–3 Betrieb, 4–6 Projekt',rep(2,()=>disc(xg('phone',26),'',`Betrieb`))+rep(2,()=>disc(xg('phone',26),'',`Projekt`)))}
    ${grp('Meilensteine','auf die Sterne der Projektleiste',rep(2,()=>disc(xg('star',38),'star')))}
    <div class="tg"><div class="tgh"><b>Übernahme · Spielfiguren</b> <span>Figuren an der Linie falten, Laschen nach außen</span></div><div class="tgl">
      <div class="disc big">${glyph('sued',54)}<small>Süd übernimmt</small></div>
      ${pawnStand(TEAL,'Vertrauen')}${pawnStand(OLIVE,'Projekt')}</div></div>
  </div>`];
}

// ---------- Abrechnungsblock (A4 quer) ----------
function ledgerHtml(){
  const rows=22;
  const col=w=>`<div class="lw"><div class="lwh">Woche ${w}</div>
    <div class="lr meta"><span>${xg('phone',12)} Priorität:</span><span>☐ Betrieb ☐ Projekt</span></div>
    <div class="lr meta"><span>Start</span><span>${glyph('v',11)} ___ ${glyph('p',11)} ___</span></div>
    <div class="lr hd"><span>Stichwort</span><span>${glyph('v',11)}</span><span>${glyph('p',11)}</span></div>
    ${rep(rows,()=>'<div class="lr"><span></span><span></span><span></span></div>')}
    <div class="lr meta end"><span>Ende</span><span>${glyph('v',11)} ___ ${glyph('p',11)} ___</span></div>
    <div class="lr meta"><span>Call:</span><span>Frage ___ Wurf ___</span></div>
    <div class="lr meta lern"><span>${xg('star',11)} Lernkarte:</span><span></span></div></div>`;
  return `<div class="ledger"><div class="lhead"><b>Abrechnungsblock</b><span>Partie: <i class="ln"></i></span><span>Datum: <i class="ln s"></i></span><span>Start: Vertrauen ${ST.standingStart}, Projekt 0, Ziel ${ST.projectTarget}</span></div>
    <div class="lcols">${Array.from({length:ST.rounds},(_,i)=>col(i+1)).join('')}</div>
    <div class="lfoot"><b>Am Wochenende:</b> jede liegen gebliebene Karte ${pill('v',sgn(-PEN))} und Hürde +1 (bei ${xg('phone',11)} Betrieb ${pill('v',sgn(-(PEN+1)))}) ·
      niemand am Projekt ${pill('p','−1')} (bei ${xg('phone',11)} Projekt ${pill('p','−2')}, ohne Fortschritt zusätzlich ${pill('v','−1')}) · niemand im Betrieb ${pill('v','−1')} ·
      Meilenstein ${MILESTONES.join(' und ')} ${pill('v','+1')} · übrige Chips: 2 = 1 Puffer-Chip · Chancen verfallen. Jede Bewegung eine Zeile mit Grund.</div></div>`;
}

// ---------- Übersicht ----------
function overviewHtml(){
  return `<div class="ovw">
    <h1>Druckbogen · Brett- und Kartenfassung</h1>
    <p class="lead">Alle Spielmaterialien für einen Papier-Prototyp, erzeugt aus denselben Daten wie der Simulator (Regelstand v3.0). Ändert sich eine Karte in <code>js/daten.js</code>, ändert sie sich hier mit.</p>
    <h2>Inhalt</h2>
    <table><tr><th>Material</th><th>Stück</th><th>Format</th></tr>
      <tr><td>Ereigniskarten (Grundstapel)</td><td>${EVENTS.length}</td><td>90 × 128 mm, 4 je Bogen</td></tr>
      <tr><td>Folgekarten, eigene Rückseite</td><td>${FOLLOW.length}</td><td>90 × 128 mm</td></tr>
      <tr><td>Eigenart-Karten</td><td>${EIGENARTEN.length}</td><td>63 × 88 mm, 9 je Bogen</td></tr>
      <tr><td>Rollenkarten und verdeckte Zielkarten</td><td>${ROLES.length} + ${ROLES.length}</td><td>63 × 88 mm</td></tr>
      <tr><td>Projekt-Aktionskarten</td><td>${PROJECT_OPTS.length}</td><td>63 × 88 mm</td></tr>
      <tr><td>Ansagekarten Betrieb und Projekt (Rückseite: Mond)</td><td>${ROLES.length*2}</td><td>63 × 88 mm</td></tr>
      <tr><td>Fragekarten Vorstands-Call</td><td>${CALL_QUESTIONS.length}</td><td>63 × 88 mm</td></tr>
      <tr><td>Blanko-Lernkarten</td><td>füllen den letzten Bogen</td><td>63 × 88 mm</td></tr>
      <tr><td>Spielhilfe (Eine Woche / Dein Zug)</td><td>4</td><td>95 × 135 mm, 4 je Bogen</td></tr>
      <tr><td>Tableaus</td><td>${ROLES.length}</td><td>A5 quer, 2 je Bogen</td></tr>
      <tr><td>Spielbrett</td><td>1</td><td>A3 quer (oder verkleinert A4 quer)</td></tr>
      <tr><td>Plättchen, Chips, Spielfiguren</td><td>2 Bögen</td><td>Ø 20 mm</td></tr>
      <tr><td>Abrechnungsblock</td><td>1 Blatt je Partie</td><td>A4 quer</td></tr>
      <tr><td>Würfel zum Basteln: 2 × W6, Prioritätswürfel, W12</td><td>1 Bogen</td><td>A4, Karton</td></tr>
      <tr><td>Schachtel: Deckel-Etikett und Inventar</td><td>2</td><td>A4 quer, A4 hoch</td></tr></table>
    <p>Dazu kaufen: eine 60-Sekunden-Sanduhr und Stifte. Die Würfel (ein W12, zwei W6) gibt es als Bastelbogen oder gekauft.</p>
    <h2>So druckst du</h2>
    <ul>
      <li>Im Druckdialog: Ränder „Keine“, Skalierung 100 %, Hintergrundgrafiken an.</li>
      <li>Karten beidseitig drucken, Wenden an der langen Kante. Auf jeden Vorderseiten-Bogen folgt sein Rückseiten-Bogen, gespiegelt. Ohne Duplex: Rückseiten oben abschalten.</li>
      <li>Vorher einen Bogen auf Normalpapier testen und gegen das Licht halten. Die Rückseiten tolerieren 2–3 mm Versatz, weil die Farbe bis an die Schnittkante geht.</li>
      <li>Schneiden an den Schneidemarken außen, Karten liegen ohne Steg nebeneinander. Karten auf 160–250 g/m² oder in Kartenhüllen mit einer Spielkarte als Rücken.</li>
      <li>Das Brett ist für A3 quer gebaut: Die Felder der Wochenleiste sind so groß wie eine Folgekarte. A4 quer verkleinert es auf 71 %; dann ragen die Folgekarten über ihre Felder. Ereignisstapel und Ablage liegen neben dem Brett bei der Spielleitung, auf A3 ist dafür kein Platz.</li>
      <li>Druckt euer Drucker kein A3: Brett als PDF speichern und im Copyshop drucken lassen.</li>
    </ul>
    <h2>Wer bekommt was</h2>
    <p>Jede Person: Tableau, Rollenkarte, Eigenart-Karte (wählen oder W12), verdeckte Zielkarte, zwei Ansagekarten, drei Chips. Die Spielleitung: Ereignisstapel gemischt, Folgekarten getrennt, Spielleitungsheft, Abrechnungsblock, W6 für die Priorität.</p>
  </div>`;
}

// ---------- Zusammenbau ----------
function build(){
  const evCards=[...EVENTS,...FOLLOW].map(e=>({front:evFront(e),back:evBack(e.id>=100)}));
  const small=[
    ...EIGENARTEN.map(g=>({front:eigFront(g),back:eigBack()})),
    ...ROLES.map(r=>({front:roleFront(r),back:roleBack(r)})),
    ...ROLES.map(r=>({front:goalFront(r),back:goalBack(r)})),
    ...PROJECT_OPTS.map(x=>({front:projFront(x),back:projBack()})),
    ...ROLES.flatMap(r=>[{front:callFront(r,'standing'),back:callBack(r)},{front:callFront(r,'project'),back:callBack(r)}]),
    ...CALL_QUESTIONS.map((q,i)=>({front:kessFront(q,i),back:kessBack()})),
  ];
  while(small.length%9)small.push({front:lernFront(),back:lernBack()});
  const tabs=[];for(let i=0;i<ROLES.length;i+=2)tabs.push(sheet('tab','a4p',`<div class="tabpair">${tableau(ROLES[i])}<div class="cutline"><span>✂</span></div>${ROLES[i+1]?tableau(ROLES[i+1]):''}</div>`,`Tableaus · Bogen ${i/2+1}/${Math.ceil(ROLES.length/2)}`));
  $('sheets').innerHTML=
    sheet('ov','a4p',overviewHtml(),'Übersicht')+
    cardSheets('ev',evCards,2,2,90,128,'Ereignis- und Folgekarten')+
    cardSheets('kc',small,3,3,63,88,'Eigenart, Rolle, Ziel, Projekt, Ansage, Lernkarten')+
    cardSheets('sh',Array.from({length:4},()=>({front:hilfeFront(),back:hilfeBack()})),2,2,95,135,'Spielhilfe')+
    tabs.join('')+
    sheet('brett','a3l',`<div class="bwrap">${boardHtml()}</div>`,'Spielbrett · A3 quer','brett')+
    tokensHtml().map((t,i,all)=>sheet('pl','a4p',t,`Plättchen, Chips, Spielfiguren · Bogen ${i+1}/${all.length} · auf Karton drucken, an den gestrichelten Linien ausschneiden`)).join('')+
    sheet('ab','a4l',ledgerHtml(),'Abrechnungsblock · ein Blatt je Partie')+
    sheet('wu','a4p',diceHtml(),'Würfel zum Basteln · auf Karton drucken')+
    sheet('box','a4l',coverHtml(),'Schachtel · Deckel-Etikett oder Titelblatt')+
    sheet('box','a4p',inventoryHtml(),'Schachtel · Inventar');
  bindToolbar();
}

// ---------- Werkzeugleiste (nur am Bildschirm) ----------
const SECS=[['ov','Übersicht'],['ev','Ereignis- und Folgekarten'],['kc','Kleine Karten'],['sh','Spielhilfe'],['tab','Tableaus'],['brett','Spielbrett'],['pl','Plättchen'],['ab','Abrechnungsblock'],['wu','Würfel'],['box','Schachtel']];
function bindToolbar(){
  const box=$('secs');
  box.innerHTML=SECS.map(([k,l])=>`<label><input type="checkbox" data-sec="${k}" checked> ${l}</label>`).join('');
  const apply=()=>{
    box.querySelectorAll('input').forEach(i=>document.querySelectorAll(`.sheet[data-sec="${i.dataset.sec}"]`).forEach(s=>s.classList.toggle('skip',!i.checked)));
    document.body.classList.toggle('no-backs',!$('opt-backs').checked);
    document.body.classList.toggle('no-marks',!$('opt-marks').checked);
    const a4=$('opt-brett').value==='a4';const b=document.querySelector('.sheet.brett');
    b.classList.toggle('a3l',!a4);b.classList.toggle('a4l',a4);
    b.querySelector('.slabel').textContent=`Planspiel BVG · Regelstand v3.0 · Spielbrett · ${a4?'A4 quer, verkleinert auf 71 %':'A3 quer'}`;
    const n=[...document.querySelectorAll('.sheet')].filter(s=>getComputedStyle(s).display!=='none').length;
    $('count').textContent=`${n} Seiten`;
  };
  // Voreinstellungen per Adresse, z. B. druckbogen.html?brett=a4&rueck=0&nur=brett,pl
  const q=new URLSearchParams(location.search);
  if(q.get('brett')==='a4')$('opt-brett').value='a4';
  if(q.get('rueck')==='0')$('opt-backs').checked=false;
  if(q.get('marken')==='0')$('opt-marks').checked=false;
  if(q.get('nur')){const keep=q.get('nur').split(',');box.querySelectorAll('input').forEach(i=>i.checked=keep.includes(i.dataset.sec))}
  document.querySelectorAll('.tb input,.tb select').forEach(i=>i.addEventListener('change',apply));
  $('btn-print').addEventListener('click',()=>window.print());
  apply();
}
build();
