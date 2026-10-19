// Inhalte der Vorstellungsseite: Szenarien, Bausteine, Spielkreis, Lernziele, Preise.
// Die Szenarien liest auch js/brett3d.js, um Karten und Beschriftungen auf dem 3D-Brett zu tauschen.

const SZENARIEN=[
  {key:'verkehr',kurz:'Verkehrsbetrieb',name:'Verkehrsbetrieb',standard:true,runde:'Woche',
   bereich:'Fachgebiet Nord-Ost',projekt:'Vorstudie „Depot der Zukunft“',vorstand:'Dr. Kessler',nachbar:'Fachgebiet Süd',
   rollen:['Bereichsleitung','Teamleitung Betrieb','Teamleitung Projekt','Mitarbeitende:r'],
   karten:[{type:'Störung',title:'Oberleitungsschaden'},{type:'Team',title:'Konflikt in der Schicht'},{type:'Politik',title:'Zahlen in der Presse'},{type:'Chance',title:'Freie Kapazität in Süd'}],
   caption:'Zwei Straßenbahnlinien, ein Betriebshof, 140 Leute. Die Vorstudie muss in vier Wochen fertig sein, während Oberleitungen reißen und die Presse anruft. Das Standardszenario, sofort spielbar.',
   akzent:'#2f6f6a',brett:'#f3eadb',rahmen:'#8a5a2d',tisch:'#cdb68a',hintergrund:'#d9c9a8'},
  {key:'versicherung',kurz:'Versicherung',name:'Versicherung',runde:'Monat',
   bereich:'Schadenabteilung Kfz',projekt:'Einführung „Digitale Schadenmeldung“',vorstand:'Frau Dr. Lindner',nachbar:'Abteilung Sach',
   rollen:['Abteilungsleitung','Teamleitung Regulierung','Projektleitung Digital','Sachbearbeiter:in'],
   karten:[{type:'Störung',title:'Unwetter: 400 Schäden in drei Tagen'},{type:'Team',title:'Kündigung im Innendienst'},{type:'Politik',title:'Beschwerde beim Ombudsmann'},{type:'Chance',title:'Sach bietet zwei Leute an'}],
   caption:'Die Schadenabteilung muss die Regulierungsquote halten und gleichzeitig die digitale Schadenmeldung einführen. Jede Runde ist ein Monat, jeden Monat fragt der Vorstand nach der Quote.',
   akzent:'#4a5f8a',brett:'#e9eef5',rahmen:'#3b4b6b',tisch:'#a9b7cc',hintergrund:'#b7c6dc'},
  {key:'energie',kurz:'Energieversorger',name:'Energieversorger',runde:'Quartal',
   bereich:'Netzregion West',projekt:'Netzausbau-Konzept „Netz 2035“',vorstand:'Herr Baumann',nachbar:'Netzregion Ost',
   rollen:['Regionalleitung','Leitung Netzbetrieb','Projektleitung Netzausbau','Netzmeister:in'],
   karten:[{type:'Störung',title:'Mittelspannungsausfall nach Sturm'},{type:'Team',title:'Leitstelle unterbesetzt'},{type:'Politik',title:'Bürgerinitiative gegen die Trasse'},{type:'Chance',title:'Fördermittel ausgeschrieben'}],
   caption:'Das Netz muss stabil bleiben, der Ausbau muss vorankommen. Jede Runde ist ein Quartal, die Regulierungsbehörde will Kennzahlen, und die Nachbarregion hätte den Ausbau gern selbst.',
   akzent:'#b8762b',brett:'#f6ead3',rahmen:'#a3521c',tisch:'#dfb181',hintergrund:'#e6b384'},
  {key:'kommune',kurz:'Stadtverwaltung',name:'Stadtverwaltung',runde:'Monat',
   bereich:'Bürgeramt Mitte',projekt:'Einführung „Digitales Rathaus“',vorstand:'die Dezernentin',nachbar:'Bürgeramt Nord',
   rollen:['Amtsleitung','Sachgebietsleitung Service','Projektleitung Digital','Sachbearbeiter:in'],
   karten:[{type:'Störung',title:'Fachverfahren ausgefallen'},{type:'Team',title:'Warteschlange bis auf die Straße'},{type:'Politik',title:'Anfrage aus dem Stadtrat'},{type:'Chance',title:'Bürgeramt Nord hat Luft'}],
   caption:'Das Bürgeramt muss Termine abarbeiten und parallel das digitale Rathaus einführen. Jede Runde ist ein Monat, der Stadtrat fragt nach, und die Lokalpresse zählt die Wartenden.',
   akzent:'#6a4c93',brett:'#f0eaf5',rahmen:'#54406f',tisch:'#bfb0cf',hintergrund:'#cdbbdf'},
];
const SZ=k=>SZENARIEN.find(s=>s.key===k)||SZENARIEN[0];

const BAUSTEINE=[
  {icon:'twoq',titel:'Rollen',text:'Vier Personen übernehmen vier Funktionen: eine Leitung, zwei Teamleitungen mit unterschiedlichem Schwerpunkt, eine Person aus dem Team. Jede Rolle hat eine offene Seite mit einer Fähigkeit und eine verdeckte Seite mit einem eigenen Ziel und einer Information, die die anderen nicht haben.'},
  {icon:'scales',titel:'Betrieb und Projekt',text:'Das Tagesgeschäft muss laufen, und gleichzeitig soll ein Projekt fertig werden. Zwei Leisten auf dem Brett zeigen beides: das Vertrauen der Leitung und den Projektfortschritt. Die Leisten hängen zusammen. Wer eine Seite vernachlässigt, zahlt auf der anderen.'},
  {icon:'storm',titel:'Ereignisse und Störungen',text:'Jede Runde legt die Spielleitung neue Karten auf den Tisch: Störungen im Betrieb, Konflikte im Team, Politik von oben, Chancen von außen. Jede Karte bietet zwei bis drei Wege. Keiner ist sauber. Der teure kostet Zeit, der billige hat Nebenwirkungen, das Wagnis entscheidet der Würfel.'},
  {icon:'puzzle',titel:'Eigenarten',text:'Jede Person spielt mit einer Eigenart: einer Stärke, die zu weit geht. Wer nie Nein sagt, hilft besser und brennt schneller aus. Bonus und Malus kommen aus derselben Eigenschaft. In der Reflexion ist das die interessanteste Frage: Wo hat sie dir geholfen, wo geschadet?'},
  {icon:'chart',titel:'Abrechnung am Rundenende',text:'Eine Runde steht für eine Woche, einen Monat oder ein Quartal, je nach Rhythmus Ihres Betriebs. Am Ende wird abgerechnet: Was blieb liegen und was kostet das? Wo stehen die Figuren? Welche Folgekarte kommt nächste Runde? Jede Bewegung hat einen sichtbaren Grund.'},
];

const KREIS=[
  {k:'Priorität',t:'Die Leitung ruft an und sagt, was diese Runde zählt: Betrieb oder Projekt. Die Regeln verschieben sich ein wenig.'},
  {k:'Ereignisse',t:'Neue Karten kommen auf den Tisch, jede an eine Person adressiert. Folgekarten aus früheren Runden werden umgedreht.'},
  {k:'Ansage',t:'Jede Person legt sich fest: Betrieb oder Projekt. Die Ansage gilt die ganze Runde. Nur wer auf derselben Seite steht, kann helfen.'},
  {k:'Spielphase',t:'Drei Chips Führungszeit pro Person. Karten bearbeiten, am Projekt arbeiten, helfen, Fähigkeiten einsetzen, Wagnisse würfeln.'},
  {k:'Eskalation',t:'Was liegen bleibt, wird schwerer und kostet Vertrauen. Chancen verfallen. Stillstand auf einer Seite kostet ebenfalls.'},
  {k:'Abrechnung',t:'Die Spielleitung liest vor, was sich auf den Leisten bewegt hat und warum. Übrige Chips werden zum Puffer.'},
  {k:'Reflexion',t:'Kurz innehalten: Wer hat entschieden, was blieb liegen? Das Team schreibt eine Lernkarte, die in der nächsten Runde wirkt.'},
];

const LERNZIELE=[
  {titel:'Prioritäten setzen, wenn die Zeit nicht reicht',text:'Drei Chips pro Runde sind absichtlich zu wenig. Die Frage ist nie „Wie schaffen wir alles?“, sondern „Was lassen wir liegen, und wer entscheidet das?“'},
  {titel:'Betrieb und Veränderung gleichzeitig führen',text:'Zwei gekoppelte Leisten machen das Dilemma messbar: Wer nur Störungen löscht, verliert das Projekt. Wer nur am Projekt baut, verliert den Betrieb und das Vertrauen.'},
  {titel:'Zusammenarbeit kostet, und sie lohnt sich',text:'Helfen ist der stärkste Bonus im Spiel, und es kostet die helfende Person einen eigenen Chip. Unterstützung ist nie gratis. Wer allein ins Wagnis geht, scheitert oft.'},
  {titel:'Nebenwirkungen und Spätfolgen sehen',text:'Der schnelle Weg bringt eine Folgekarte, die sichtbar auf der Rundenleiste liegt. Das Team sieht die Rechnung kommen und entscheidet, ob es sich vorbereitet oder verdrängt.'},
  {titel:'Eigene Muster erkennen',text:'Die Eigenart-Karten machen Verhaltensmuster spielbar: Perfektionismus, Delegieren, Bauchentscheidungen, „Feierabend ist heilig“. Jede ist eine Stärke, die zu weit geht.'},
  {titel:'Informationen teilen oder zurückhalten',text:'Jede Rolle weiß etwas, das die anderen nicht wissen. Ob und wann das auf den Tisch kommt, ist eine der stillen Entscheidungen des Spiels, und ein Thema für die Reflexion.'},
  {titel:'Nach oben kommunizieren',text:'Jede Runde ruft die Leitung an und stellt eine unbequeme Frage. Wer begründet, bekommt einen Bonus. Wer eskaliert, zahlt dafür. Beides kennt man aus dem Alltag.'},
  {titel:'Aus der Reflexion in die Handlung',text:'Lernkarten werden vom Team selbst geschrieben und wirken danach mechanisch. Lernen zahlt sich im Spiel aus, nicht erst im Nachgespräch.'},
];

const LERNKARTEN_BEISPIELE=['Erst fragen, wer was vorhat, dann ansagen.','Der schnelle Weg kostet nächste Woche.','Wer hilft, sagt es vorher.','Eine Störung liegen lassen ist auch eine Entscheidung.'];

const ANPASSUNG=[
  {t:'Kick-off (halber Tag)',d:'Wir hören zu: Welche Situationen bringen Ihre Führungskräfte an die Grenze? Welche Störungen sind typisch, welches Projekt steht gerade an, in welchem Rhythmus wird abgerechnet?'},
  {t:'Szenario und Rollen',d:'Wir schreiben Ihr Szenario: Bereich, Leitung, Nachbarbereich, Figuren der Welt. Die vier Rollen bekommen Namen und Fähigkeiten aus Ihrer Organisation.'},
  {t:'Karten und Vorlesetexte',d:'Rund 30 Ereignis- und Folgekarten in Ihrer Sprache: Störung, Team, Politik, Chance. Mit Vorlesetexten, Rückfragen und Wegen, deren Preis zu Ihrem Haus passt.'},
  {t:'Testspiel und Feinschliff',d:'Wir spielen mit einer Pilotgruppe aus Ihrem Haus, balancieren Hürden und Kosten nach und liefern das fertige Spiel: Brett, Karten, Tableaus, Spielleitungsheft.'},
];

const SESSION=[
  {z:'0:00',t:'Ankommen und Szenario',d:'Die Spielleitung liest das Szenario vor. Rollen wählen, Eigenart wählen oder auswürfeln, Tableaus aufbauen.'},
  {z:'0:30',t:'Runde 1 und 2',d:'Zwei Runden zum Ankommen. Die Spielleitung erklärt lieber einmal zu viel. Nach jeder Runde eine kurze Reflexion und eine Lernkarte.'},
  {z:'1:45',t:'Pause',d:''},
  {z:'2:00',t:'Runde 3 und 4',d:'Der Druck steigt: mehr Karten, Folgekarten aus den ersten Runden, der Vorstand fragt schärfer. Dann die Endabrechnung.'},
  {z:'3:15',t:'Reflexion und Transfer',d:'Was ist am Tisch passiert, und wo kennen wir das aus dem Alltag? Die Lernkarten des Teams als Brücke in die eigene Praxis.'},
  {z:'4:00',t:'Ende',d:''},
];

const PREISE=[
  {name:'Standardszenario',tag:'Sofort spielbar',preis:'6.498 €',einheit:'pro Session, netto',
   intro:'Eine Session mit dem Szenario „Verkehrsbetrieb“, ein halber Tag, 4 bis 6 Personen an einem Tisch.',
   posten:[['Spiel-Session, ½ Tag, 4–6 Personen','3.999 €'],['Trainer:in als Spielleitung','2.499 €']],
   fuer:'Für Teams, die das Format kennenlernen wollen, und für Häuser, in denen ein branchenfremdes Szenario den Blick sogar freier macht.'},
  {name:'Ihr Szenario',tag:'Angepasst auf Ihr Unternehmen',preis:'14.999 €',einheit:'einmalig, netto',hervor:true,
   intro:'Wir entwickeln das Spiel in der Sprache Ihres Hauses: Rollen, Ereignisse, Projekt, Rhythmus. Danach spielen Sie es so oft Sie wollen.',
   posten:[['Anpassung: Szenario, Rollen, ~30 Karten, Testspiel, Material','14.999 €'],['Jede Session danach, ½ Tag, 4–6 Personen','3.999 €'],['Trainer:in als Spielleitung, je Session','2.499 €']],
   fuer:'Für Führungskräfteprogramme, Teamentwicklung über mehrere Bereiche und alle, die wollen, dass die Störungen auf den Karten ihre eigenen sind.'},
];
const PREIS_HINWEISE=[
  'Alle Preise netto zuzüglich Umsatzsteuer. Reisekosten der Spielleitung kommen hinzu.',
  'Ein Tisch ist für 4 bis 6 Personen ausgelegt. Für größere Gruppen spielen mehrere Tische parallel, jeder mit eigenem Spiel und eigener Spielleitung.',
  'Eine Session ist als ganzer Tag möglich: mit zweitem Durchgang, gewechselten Rollen und vertieftem Transfer. Preis auf Anfrage.',
  'Die Spielleitung durch eine:n unserer Trainer:innen gehört zu jeder Session. Wenn Sie eigene Trainer:innen als Spielleitung ausbilden möchten, bieten wir das als eigenes Modul an. Preis auf Anfrage.',
];

// ---------- Rendern ----------
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function renderBausteine(){
  $('block-grid').innerHTML=BAUSTEINE.map((b,i)=>`<article class="block"><div class="block-ico">${iconSVG(b.icon,64)}</div><div class="block-n">${i+1}</div><h3>${esc(b.titel)}</h3><p>${esc(b.text)}</p></article>`).join('');
}

function renderKreis(){
  const n=KREIS.length,R=150,cx=200,cy=200;
  const pts=KREIS.map((s,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return {x:cx+R*Math.cos(a),y:cy+R*Math.sin(a),a}});
  let svg=`<svg viewBox="0 0 400 400" role="img" aria-label="Spielkreis mit sieben Schritten">`;
  svg+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="4 6"/>`;
  // Pfeile zwischen den Schritten
  pts.forEach((p,i)=>{const q=pts[(i+1)%n];const am=(p.a+q.a)/2+(i===n-1?Math.PI:0);const mx=cx+R*Math.cos(am),my=cy+R*Math.sin(am);const dx=-Math.sin(am),dy=Math.cos(am);
    svg+=`<path d="M${mx-dx*6-dy*5} ${my-dy*6+dx*5} L${mx+dx*6} ${my+dy*6} L${mx-dx*6+dy*5} ${my-dy*6-dx*5}" fill="none" stroke="var(--ink-soft)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`});
  pts.forEach((p,i)=>{svg+=`<g class="kreis-step" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r="34" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/><text x="${p.x}" y="${p.y-4}" text-anchor="middle" font-size="22" font-weight="700" fill="var(--accent)">${i+1}</text><text x="${p.x}" y="${p.y+14}" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--ink)">${esc(KREIS[i].k)}</text></g>`});
  svg+=`<text x="${cx}" y="${cy-8}" text-anchor="middle" font-size="13" fill="var(--ink-soft)">eine Runde</text><text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">Woche · Monat · Quartal</text></svg>`;
  $('loop-diagram').innerHTML=svg;
  $('loop-steps').innerHTML=KREIS.map((s,i)=>`<li><b>${esc(s.k)}</b><span>${esc(s.t)}</span></li>`).join('');
}

// Spielmaterial im Spiel-Look, aus den Daten des Simulators
function artCard(e){
  const pen=2;
  return `<div class="gcard t-${e.type}">
    <div class="gc-head"><span class="gc-type">${e.type}</span><span class="gc-h">${hurdleSVG(e.diff+1,28)}</span></div>
    <div class="gc-art">${iconSVG(e.icon,54)}</div>
    <div class="gc-title">${esc(e.title)}</div>
    <div class="gc-text">${esc(e.text.replace('{MA}','Jonah'))}</div>
    <div class="gc-foot">${e.type==='Chance'?'<span>verfällt am Wochenende</span>':`<span>liegen lassen</span> ${pill('v','−'+pen,'Vertrauen am Wochenende')}`}</div>
  </div>`;
}
function artOptionen(e){
  return `<div class="art-opts"><div class="art-opts-h">${esc(e.title)}: drei Wege, keiner sauber</div>${e.opts.map(o=>`<div class="art-opt ${o.roll?'wag':''}"><div><b>${esc(o.label.replace('{MA}','Jonah'))}</b><span>${esc(o.text)}</span></div><div class="art-cost">${o.chips} Chip${o.chips>1?'s':''}${o.roll?' · Wagnis':''}</div></div>`).join('')}</div>`;
}
function artEigenart(g){
  return `<div class="kcard eig"><div class="kh">Eigenart ${g.nr}</div><div class="kt">${esc(g.name)}</div><div class="kq">${esc(g.quote)}</div><div class="kb"><b>Bonus</b> ${esc(g.bonus)}</div><div class="km"><b>Malus</b> ${esc(g.malus)}</div><div class="ks">Stärke dahinter: ${esc(g.staerke)}</div></div>`;
}
function artRolle(r,p){
  return `<div class="kcard role" style="--pc:var(${r.color})"><div class="role-head"><div class="pf">${portraitSVG(p,56)}</div><div><div class="kh">Rolle</div><div class="kt">${esc(r.role)}</div></div></div><div class="kb"><b>Fähigkeit</b> ${esc(r.ability)}</div><div class="ksec"><div class="kh">Verdeckte Seite</div><div><b>Ziel</b> ${esc(r.goal)}</div></div></div>`;
}
function renderArt(){
  const ev=EVENTS.find(e=>e.id===1),ev2=EVENTS.find(e=>e.id===8),ev3=EVENTS.find(e=>e.id===6);
  $('art').innerHTML=`
    <div class="art-row cards">${artCard(ev)}${artCard(ev3)}${artCard(ev2)}</div>
    <div class="art-row">${artOptionen(ev)}</div>
    <div class="art-row three">${artEigenart(EIG('neinsagen'))}${artEigenart(EIG('perfekt'))}${artEigenart(EIG('feierabend'))}</div>
    <div class="art-row three">${artRolle(ROLES[0],PORTRAITS[6])}${artRolle(ROLES[1],PORTRAITS[7])}${artRolle(ROLES[3],PORTRAITS[9])}</div>
    <div class="art-row dice"><div class="art-dice">${dieSVG(6,54)}${dieSVG(3,54)}${d12SVG(7,60)}</div><div class="art-chips">${Array.from({length:6},()=>'<span class="tok"></span>').join('')}</div><div class="art-pawns">${pawnSVG(TEAL,40)}${pawnSVG(OLIVE,40)}</div><div class="art-back">${cardBackSVG(44)}${cardBackSVG(44,'Folge')}</div></div>`;
}

function renderSzenarien(){
  $('scenario-grid').innerHTML=SZENARIEN.filter(s=>!s.standard).map(s=>`<article class="scenario" style="--akzent:${s.akzent}">
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.caption)}</p>
    <dl>
      <div><dt>Bereich</dt><dd>${esc(s.bereich)}</dd></div>
      <div><dt>Projekt</dt><dd>${esc(s.projekt)}</dd></div>
      <div><dt>Eine Runde ist</dt><dd>ein ${esc(s.runde)}</dd></div>
      <div><dt>Rollen</dt><dd>${s.rollen.map(esc).join(' · ')}</dd></div>
      <div><dt>Karten, zum Beispiel</dt><dd>${s.karten.map(k=>`<span class="ktag t-${k.type}">${esc(k.title)}</span>`).join('')}</dd></div>
    </dl>
    <button type="button" class="link-btn" data-scene="${s.key}">Auf dem Brett zeigen</button>
  </article>`).join('');
  $('adapt-steps').innerHTML=ANPASSUNG.map(a=>`<li><b>${esc(a.t)}</b><span>${esc(a.d)}</span></li>`).join('');
  document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>{setScene(b.dataset.scene);document.getElementById('start').scrollIntoView({behavior:'smooth'})}));
}

function renderLernen(){
  $('learn-grid').innerHTML=LERNZIELE.map((l,i)=>`<article class="learn"><div class="learn-n">${String(i+1).padStart(2,'0')}</div><h3>${esc(l.titel)}</h3><p>${esc(l.text)}</p></article>`).join('');
  $('lernkarten').innerHTML=LERNKARTEN_BEISPIELE.map((t,i)=>`<div class="lernkarte rot${i%3}"><div class="kh">Lernkarte · Runde ${i+1}</div><div class="lk-text">${esc(t)}</div></div>`).join('');
}

function renderSession(){
  $('timeline').innerHTML=SESSION.map(s=>`<div class="tl-item ${s.d?'':'tl-mark'}"><div class="tl-time">${s.z}</div><div class="tl-body"><b>${esc(s.t)}</b>${s.d?`<p>${esc(s.d)}</p>`:''}</div></div>`).join('');
}

function renderPreise(){
  $('price-grid').innerHTML=PREISE.map(p=>`<article class="price ${p.hervor?'hervor':''}">
    <div class="price-tag">${esc(p.tag)}</div>
    <h3>${esc(p.name)}</h3>
    <div class="price-big">${esc(p.preis)}<span>${esc(p.einheit)}</span></div>
    <p>${esc(p.intro)}</p>
    <table><tbody>${p.posten.map(([a,b])=>`<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody></table>
    <p class="price-for">${esc(p.fuer)}</p>
    <a class="cta ${p.hervor?'':'ghost'}" href="#kontakt">Erstgespräch anfragen</a>
  </article>`).join('');
  $('price-notes').innerHTML=`<ul>${PREIS_HINWEISE.map(h=>`<li>${esc(h)}</li>`).join('')}</ul>`;
}

// ---------- Szenario-Wechsel (Buttons, Bildunterschrift, 3D-Brett) ----------
let currentScene='verkehr';
function setScene(key){
  currentScene=key;const s=SZ(key);
  document.querySelectorAll('#scene-buttons button').forEach(b=>{const on=b.dataset.key===key;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  $('scene-caption').innerHTML=`<b>${esc(s.bereich)}</b> · ${esc(s.projekt)} · eine Runde ist ein ${esc(s.runde)}<br><span class="muted">${esc(s.caption)}</span>`;
  document.querySelector('.scene-wrap').style.setProperty('--szene-bg',s.hintergrund);
  if(window.Brett3D)Brett3D.setScene(s);
}
function renderSceneButtons(){
  $('scene-buttons').innerHTML=SZENARIEN.map(s=>`<button type="button" data-key="${s.key}" aria-pressed="false">${esc(s.kurz)}</button>`).join('');
  document.querySelectorAll('#scene-buttons button').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.key)));
}

function initMail(){
  const subj=encodeURIComponent('Erstgespräch SYNK Run & Build');
  const body=encodeURIComponent('Guten Tag Herr Krauß,\n\nich interessiere mich für SYNK Run & Build, das Planspiel zu Führung und Kollaboration, und hätte gern ein Erstgespräch.\n\nUnternehmen:\nBranche:\nGruppengröße:\nInteresse an: Standardszenario / eigenes Szenario\n\nMit freundlichen Grüßen\n');
  document.querySelectorAll('a[href^="mailto:udo.krauss"]').forEach(a=>a.href=`mailto:udo.krauss@synk-group.com?subject=${subj}&body=${body}`);
}

renderBausteine();renderKreis();renderArt();renderSzenarien();renderLernen();renderSession();renderPreise();renderSceneButtons();initMail();
setScene('verkehr');
