// ---------- Stammdaten ----------
const SCENARIO={
  bereich:'Fachgebiet Nord-Ost', vorstand:'Dr. Kessler', nachbar:'Fachgebiet Süd (Leitung Brandt)',
  intro:'Ihr seid das Fachgebiet Nord-Ost: zwei Straßenbahnlinien, ein Betriebshof, 140 Leute. Seit Montag liegt die Vorstudie „Depot der Zukunft“ auf eurem Tisch, Abgabe in vier Wochen, Dr. Kessler aus dem Vorstand hat sie persönlich bestellt. Gleichzeitig läuft der Betrieb weiter: Frühschicht, Störungen, Dienstpläne, Presse. Fachgebiet Süd unter Frau Brandt hat Kapazität übrig und ein Auge auf euer Thema. Euer Vertrauen beim Vorstand ist solide, nicht mehr. Jede Woche ist eine Runde. Jede Runde ruft Dr. Kessler an.',
};
const ROLES = [
  {key:'BL', role:'Bereichsleitung', focus:'Politik', color:'--p1', ability:'Hilfe von außen: 1 Chip, ein Wagnis wird um 1 leichter (1×/Runde)', abilityKey:'help',
   goal:'Das Vertrauen des Vorstands darf nie unter 4 fallen', info:'Dr. Kessler plant eine Umstrukturierung, falls die Vorstudie kippt. Nord-Ost würde unter Süd aufgehen'},
  {key:'TB', role:'Teamleitung Betrieb', focus:'Betrieb', color:'--p2', ability:'Störung durchziehen: 2 Chips, ohne Wurf und ohne Nebenwirkung (1×/Spiel)', abilityKey:'solve',
   goal:'Jede Störung in der Runde lösen, in der sie kommt', info:'{MA} hat ein Angebot von Frau Brandt aus Süd und hat es dir im Vertrauen gesagt'},
  {key:'TP', role:'Teamleitung Projekt', focus:'Projekt', color:'--p3', ability:'Projektschub: 2 Chips für +3 Projekt, ohne Nebenwirkung (1×/Spiel)', abilityKey:'push',
   goal:'Das Projekt darf nie zwei Runden in Folge stehen bleiben', info:'Frau Brandt will die Vorstudie nach Süd holen. Es gab schon ein Gespräch mit Dr. Kessler'},
  {key:'MA', role:'Mitarbeitende:r', focus:'Team', color:'--p4', ability:'Störungsbereitschaft: +2 auf Wagnisse bei Störungen (passiv)', abilityKey:'standby',
   goal:'Du hast ein Angebot aus Süd. Du bleibst, wenn du bis Ende Runde 3 zweimal „zu zweit“ gespielt hast. Sonst: Runde 4 nur ein Chip', info:'Flurfunk: Süd hat gerade Kapazität übrig und sucht Aufgaben'},
];
const FOCUS_MATCH = {Politik:['Politik'], Betrieb:['Störung'], Projekt:['Chance'], Team:['Team']};
// Portraits: zehn Figuren, jede aus denselben Bausteinen. Spieler wählen eine.
const PORTRAITS=[
  {id:'p1',name:'Ilka',line:'Leitstand, Nachtschicht, kennt jeden Zug',skin:'#d9b995',hair:'bun',hairc:'#4a3326',cloth:'headset',clothc:'#4f6a73',bg:'#3a5f63',acc:'#d8a93e'},
  {id:'p2',name:'Bernd',line:'Dreißig Dienstjahre, misstraut Folien',skin:'#c9a07e',hair:'cap',hairc:'#2a3a44',cloth:'jacket',clothc:'#3b4b56',bg:'#55533f',acc:'#c0392b'},
  {id:'p3',name:'Selin',line:'Hat die Vorstudie im Kopf und im Ordner',skin:'#e2c3a3',hair:'long',hairc:'#2f2420',cloth:'blazer',clothc:'#6f7a5a',bg:'#4a4f66',glasses:true,acc:'#d8a93e'},
  {id:'p4',name:'Tomasz',line:'Fahrer, Betriebsrat, laut und herzlich',skin:'#d4a98a',hair:'short',hairc:'#5b4a3a',cloth:'vest',clothc:'#d8a93e',bg:'#5a4a3a',acc:'#2f6f6a'},
  {id:'p5',name:'Grete',line:'Werkstatt, repariert alles, auch Stimmungen',skin:'#e6c9ae',hair:'curly',hairc:'#9a9a9a',cloth:'overall',clothc:'#4a5f72',bg:'#3f5a52',acc:'#c0392b'},
  {id:'p6',name:'Amir',line:'Neu im Haus, stellt die richtigen Fragen',skin:'#b98c68',hair:'short',hairc:'#1f1a16',cloth:'shirt',clothc:'#d9d2c0',bg:'#52606b',glasses:true,acc:'#2f6f6a'},
  {id:'p7',name:'Hanne',line:'Assistenz, weiß vor allen, was der Vorstand will',skin:'#dfb9a0',hair:'bob',hairc:'#7a3f2a',cloth:'blazer',clothc:'#8a5a5a',bg:'#5d4a60',acc:'#d8a93e'},
  {id:'p8',name:'Kemal',line:'Disponent, ruhig, bis die Oberleitung fällt',skin:'#c99a78',hair:'beanie',hairc:'#2f6f6a',cloth:'sweater',clothc:'#5a5a4a',bg:'#3a4a5a',acc:'#c0392b'},
  {id:'p9',name:'Ruth',line:'Zahlen, Berichte, trockener Humor',skin:'#efd6bf',hair:'short',hairc:'#d6cfc0',cloth:'cardigan',clothc:'#7a6a5a',bg:'#4f5a4a',glasses:true,acc:'#d8a93e'},
  {id:'p10',name:'Jonah',line:'Azubi, schnell, will alles auf einmal',skin:'#d1a88a',hair:'curly',hairc:'#3a2a1e',cloth:'vest',clothc:'#d8a93e',bg:'#5a5a3a',acc:'#2f6f6a'},
];
// Optionen: chips, payer, resolve, standing, project, later{card,delay}, nachbar, noPair, endRound, nextChips, pair, chipsAll, roll{diff,fail}
// Kein sauberer Weg: jede Option hat einen Malus. Nur Fähigkeiten sind sauber.
// read = Vorlesetext der Spielleitung, qa = Rückfrage und Antwort, out = Ausgangssatz je Option
const EVENTS = [
  {id:1,type:'Störung',title:'Oberleitungsschaden',diff:5,to:'TB',icon:'wire',text:'Auf dem Hauptabschnitt hängt die Oberleitung durch, zwei Linien stehen.',esc:'Der Ersatzverkehr läuft chaotisch, die Presse ruft an.',
   read:'Dienstag, 6:40 Uhr. Die Leitstelle meldet: Auf dem Hauptabschnitt hängt die Oberleitung durch, ein Pantograph hat sie erwischt. Zwei Linien stehen, auf den Bahnsteigen wird es voll. Die Werkstatt braucht mindestens den Vormittag.',qa:'„Wie lange dauert die Reparatur?“ Bis mittags, wenn nichts dazwischenkommt. „Haben wir Busse?“ Drei, alle anderen sind im Umlauf.',opts:[
    {id:'a',label:'Ersatzverkehr aus eigener Kraft',text:'Alle verfügbaren Busse, die Schicht bleibt länger.',chips:2,resolve:true,later:{card:101,delay:2},out:'Bis mittags fahren eure Busse im Pendel. Die Frühschicht geht um 15 Uhr nach Hause, nicht um 13. Niemand beschwert sich. Noch nicht.'},
    {id:'b',label:'Süd um Busse bitten',text:'Ein Anruf bei Frau Brandt, zwanzig Minuten später rollen fremde Busse.',chips:1,resolve:true,nachbar:true,out:'Frau Brandt sagt sofort zu. „Gern. Wir helfen uns doch.“ Sie sagt es so, dass du es dir merkst.'},
    {id:'w',label:'Provisorium',text:'Der Werkstattmeister sagt, er kriegt das mit Draht und Klemmen hin.',chips:1,roll:{diff:5,fail:{escalateNow:true}},resolve:true,out:'Der Meister steht auf der Leiter und flucht leise.'}]},
  {id:2,type:'Störung',title:'Krankheitswelle Frühschicht',diff:4,to:'TB',icon:'bed',text:'Drei Kolleg:innen fallen aus, der Dienstplan hat Löcher.',esc:'Überstunden häufen sich, der Betriebsrat beschwert sich.',
   read:'Montagmorgen, drei Krankmeldungen in der Frühschicht, alle echt, alle gleichzeitig. Der Dienstplan hat Löcher, die nächste Woche zu groß sind, um sie zu übersehen.',qa:'„Können wir Fahrten streichen?“ Könnt ihr, das merkt der Vorstand. „Wer hat frei?“ Niemand, der nicht schon letzte Woche eingesprungen ist.',opts:[
    {id:'a',label:'{MA} springt ein',text:'Doppelschicht, ohne Diskussion.',chips:1,payer:'MA',resolve:true,noPair:'MA',out:'{MA} nickt, holt den Kaffee und fährt. Für Hilfe bei anderen Dingen ist {MA} diese Woche nicht mehr da.'},
    {id:'b',label:'Dienstplan neu schneiden',text:'Zwei Stunden am Plan, dann passt es, und du bist den Tag los.',chips:2,resolve:true,endRound:true,out:'Um 11 Uhr steht der Plan. Du hast den Rest der Woche keine Zeit mehr für anderes.'},
    {id:'w',label:'Leiharbeit anfordern',text:'Die Agentur verspricht Leute bis mittags.',chips:1,roll:{diff:4,fail:{standing:-1}},resolve:true,out:'Die Agentur schickt zwei Leute, die den Betriebshof noch nie gesehen haben.'}]},
  {id:3,type:'Störung',title:'Hindernis auf der Strecke',diff:4,to:'MA',icon:'truck',text:'Ein Lkw blockiert die Trasse am Depotausgang.',esc:'Verspätungen summieren sich über den ganzen Tag.',
   read:'Ein Sattelzug hat sich beim Rangieren auf die Trasse am Depotausgang gestellt und kommt nicht mehr vor und nicht zurück. Der Fahrer telefoniert, die erste Bahn wartet, die zweite auch.',qa:'„Können wir ihn abschleppen?“ Nicht ohne Polizei. „Wie lange steht er?“ Bis jemand entscheidet.',opts:[
    {id:'a',label:'Selbst hinfahren',text:'Du regelst das vor Ort, bist dafür den Rest des Tages weg.',chips:1,resolve:true,endRound:true,out:'Du stehst eine Stunde neben dem Lkw und redest. Es funktioniert. Der Tag ist trotzdem weg.'},
    {id:'b',label:'Polizei und Abschleppdienst',text:'Offizieller Weg, dauert, und der Vorstand liest den Bericht.',chips:2,resolve:true,standing:-1,out:'Nach neunzig Minuten ist die Trasse frei. Der Vorfall steht im Tagesbericht, mit eurem Namen.'},
    {id:'w',label:'Durchwinken lassen',text:'Der Fahrer meint, er kommt da noch vorbei.',chips:1,roll:{diff:4,fail:{standing:-1}},resolve:true,out:'Die Bahn schiebt sich Zentimeter für Zentimeter am Lkw vorbei.'}]},
  {id:4,type:'Team',title:'Zuständigkeit unklar',diff:5,to:'TP',icon:'twoq',text:'Zwei Teams halten sich für zuständig für die Vorstudie, keines arbeitet.',esc:'Beide Teams warten jetzt demonstrativ aufeinander.',
   read:'Das Planungsteam und die Werkstatt halten sich beide für die Vorstudie zuständig, seit Dr. Kessler sie „an euch“ gegeben hat. Beide warten auf eine Ansage. Bis dahin arbeitet keiner.',qa:'„Wer hat recht?“ Beide ein bisschen. „Was passiert, wenn wir nichts sagen?“ Sie warten weiter.',opts:[
    {id:'a',label:'Machtwort: Planung übernimmt',text:'Entschieden. Die Werkstatt hat es gehört.',chips:1,resolve:true,later:{card:102,delay:1},out:'Die Planung freut sich. Die Werkstatt sagt nichts, und das ist das Problem.'},
    {id:'b',label:'Beide an einen Tisch',text:'Ein Nachmittag Moderation, danach ziehen sie gemeinsam.',chips:2,resolve:true,project:1,nextChips:-1,out:'Nach vier Stunden gibt es eine Aufgabenliste und einen Kuchen. Das Projekt macht einen Schritt. Deine nächste Woche ist schon halb verplant.'},
    {id:'w',label:'Laufen lassen',text:'Das klärt sich von selbst, sagst du.',chips:1,roll:{diff:5,fail:{}},resolve:true,out:'Du schaust in zwei Tagen wieder nach.'}]},
  {id:5,type:'Team',title:'Spezialwissen überlastet',diff:4,to:'MA',icon:'folders',text:'Die Person mit dem Spezialwissen ist in drei Projekten gleichzeitig verplant.',esc:'Sie meldet sich für die nächste Woche ab.',
   read:'Es gibt genau eine Person, die das alte Stellwerk versteht, und sie ist diese Woche in drei Projekten gleichzeitig verplant, zwei davon nicht eure. Ihre Mails werden kürzer.',qa:'„Können wir sie freistellen?“ Nur gegen Widerstand der anderen Bereiche. „Was, wenn sie ausfällt?“ Dann steht das Stellwerk.',opts:[
    {id:'a',label:'Aus den anderen Projekten rausziehen',text:'Die anderen Bereiche sind nicht begeistert.',chips:1,resolve:true,standing:-1,out:'Zwei Bereichsleiter rufen bei Dr. Kessler an. Er ruft bei dir an.'},
    {id:'b',label:'Tandem bilden, Wissen übergeben',text:'Dauert, aber danach hängt nichts mehr an einer Person.',chips:2,resolve:true,pair:'MA',nextChips:-1,out:'{MA} sitzt zwei Tage daneben und schreibt mit. Das kostet dich nächste Woche Zeit, aber das Wissen hat jetzt zwei Köpfe.'},
    {id:'w',label:'Sie schafft das schon',text:'Sie hat es bisher immer geschafft.',chips:1,roll:{diff:5,fail:{later:{card:103,delay:1}}},resolve:true,out:'Sie sagt: „Geht schon.“ Du glaubst ihr.'}]},
  {id:6,type:'Team',title:'Konflikt in der Schicht',diff:5,to:'TB',icon:'quarrel',text:'Zwei Fahrer:innen weigern sich, gemeinsam Dienst zu tun.',esc:'Der Streit ist jetzt Thema im ganzen Depot.',
   read:'Zwei Fahrer:innen der Spätschicht reden nicht mehr miteinander, seit einem Streit um einen Dienstwechsel. Jetzt weigern sich beide, am selben Tag Dienst zu tun. Der Plan hält das nicht aus.',qa:'„Worum ging es?“ Offiziell um einen Dienstwechsel. „Und inoffiziell?“ Das weiß das ganze Depot, nur du nicht.',opts:[
    {id:'a',label:'Trennen: andere Dienste',text:'Schnell gelöst, aber alle reden darüber.',chips:1,resolve:true,later:{card:104,delay:1},out:'Die beiden sehen sich nicht mehr. Der Rest redet umso mehr.'},
    {id:'b',label:'Klärungsgespräch zu dritt',text:'Eine Stunde, in der niemand gern sitzt, und die dich den Tag kostet.',chips:2,resolve:true,endRound:true,out:'Nach einer Stunde Schweigen sagt einer von beiden den ersten ganzen Satz. Dein Tag ist danach vorbei.'},
    {id:'w',label:'Anweisung: Ihr fahrt zusammen',text:'Dienst ist Dienst.',chips:1,roll:{diff:5,fail:{standing:-1}},resolve:true,out:'Du schickst die Anweisung per Mail.'}]},
  {id:7,type:'Politik',title:'Prioritätenverschiebung',diff:6,to:'BL',icon:'warn',text:'Dr. Kessler will bis Freitag einen Zwischenstand zur Vorstudie, der nicht eingeplant war.',esc:'Die Nachfrage kommt jetzt direkt aus dem Vorstandsbüro.',
   read:'Eine Mail von Dr. Kessler, zwei Zeilen: „Ich brauche bis Freitag einen Zwischenstand zur Vorstudie für die Vorstandssitzung. Zehn Folien reichen.“ Der Zwischenstand war nie eingeplant.',qa:'„Was will er sehen?“ Fortschritt. „Können wir absagen?“ Könnt ihr. Einmal.',opts:[
    {id:'a',label:'Zwischenstand liefern',text:'Ihr nehmt die Zeit aus der Vorstudie selbst.',chips:1,resolve:true,project:-1,out:'Die Folien sind am Freitag fertig. Die Vorstudie ist eine Woche zurück.'},
    {id:'b',label:'Termin verhandeln',text:'Zwei Telefonate, ein Kompromiss, und ein Gefallen, den du schuldest.',chips:2,resolve:true,nextChips:-1,out:'Dr. Kessler gibt dir eine Woche mehr. Dafür sitzt du nächste Woche in seinem Lenkungskreis.'},
    {id:'w',label:'Schöner Foliensatz',text:'Viel Form, wenig Inhalt.',chips:1,roll:{diff:6,fail:{standing:-1}},resolve:true,out:'Die Folien sind bunt.'}]},
  {id:8,type:'Politik',title:'Süd greift zu',diff:5,to:'BL',icon:'grab',text:'Frau Brandt beansprucht das Thema der Vorstudie für Süd.',esc:'Es gibt ein Meeting dazu, ohne euch.',
   read:'Frau Brandt aus Süd hat Dr. Kessler ein Papier geschickt: „Depot der Zukunft, ein Vorschlag aus Süd.“ Es liest sich wie eure Vorstudie, nur schneller. Sie hat es dir in Kopie geschickt, mit freundlichen Grüßen.',qa:'„Darf sie das?“ Ja. „Weiß der Vorstand, dass das unser Thema ist?“ Er weiß, wer zuerst liefert.',opts:[
    {id:'a',label:'Thema teilen',text:'Gemeinsame Vorstudie, halbe Kontrolle.',chips:1,resolve:true,project:-1,out:'Frau Brandt ist sehr freundlich. Ein Kapitel der Vorstudie gehört jetzt Süd.'},
    {id:'b',label:'Vorstand einschalten',text:'Man merkt sich, wer eskaliert.',chips:2,resolve:true,standing:-1,out:'Dr. Kessler entscheidet für euch. Beim Rausgehen sagt er: „Das hätte ich gern nicht entscheiden müssen.“'},
    {id:'w',label:'Direkt konfrontieren',text:'Ein Gespräch unter vier Augen.',chips:1,roll:{diff:5,fail:{standing:-2}},resolve:true,out:'Du gehst rüber nach Süd. Frau Brandt hat Kaffee gekocht.'}]},
  {id:9,type:'Politik',title:'Zahlen in der Presse',diff:5,to:'BL',icon:'paper',text:'Ein Artikel über Pünktlichkeitswerte nennt euer Fachgebiet.',esc:'Die Kommunikation will bis heute Abend eine Stellungnahme.',
   read:'Die Lokalzeitung hat die Pünktlichkeitswerte des Quartals, Linie für Linie. Eure beiden Linien stehen unten. Die Überschrift nennt euren Betriebshof beim Namen. Die Unternehmenskommunikation hat schon angerufen.',qa:'„Stimmen die Zahlen?“ Ja. „Gibt es Gründe?“ Gute sogar. Sie stehen nicht im Artikel.',opts:[
    {id:'a',label:'Fehler eingestehen',text:'Kurze, ehrliche Stellungnahme.',chips:1,resolve:true,standing:-1,out:'Die Zeitung druckt deinen Satz. Dr. Kessler liest ihn beim Frühstück.'},
    {id:'b',label:'Zahlen aufbereiten und erklären',text:'Der Kontext stimmt die Geschichte, und kostet dich die Nacht.',chips:2,resolve:true,endRound:true,out:'Um zwei Uhr nachts ist die Stellungnahme fertig. Sie ist gut. Du bist es nicht mehr.'},
    {id:'w',label:'Aussitzen',text:'Morgen ist es eine alte Zeitung.',chips:1,roll:{diff:5,fail:{standing:-2}},resolve:true,out:'Du antwortest nicht.'}]},
  {id:10,type:'Chance',title:'Freie Kapazität in Süd',diff:4,to:'MA',icon:'bridge',text:'Süd hat diese Woche Luft und bietet Unterstützung an.',win:'Die Kapazität aus Süd bringt das Projekt voran!',esc:'Das Angebot verfällt.',
   read:'Frau Brandt lässt ausrichten, Süd habe diese Woche zwei Leute frei, und ob ihr Hilfe bei der Vorstudie brauchen könnt. Das Angebot ist echt. Es ist auch nicht umsonst.',qa:'„Was will sie dafür?“ Nichts, sagt sie. „Und wirklich?“ Mitreden, irgendwann.',opts:[
    {id:'a',label:'Sauber einbinden',text:'Briefing, Aufgabenpaket, Ansprechpartner. Und Süd hat einen Fuß in der Tür.',chips:2,resolve:true,project:1,nachbar:true,out:'Die beiden aus Süd arbeiten gut. Sie berichten auch nach Süd.'},
    {id:'w',label:'Einfach machen lassen',text:'Die werden schon wissen, was zu tun ist.',chips:1,roll:{diff:4,fail:{}},resolve:true,project:1,out:'Ihr schickt ihnen den Ordner.'}]},
  {id:11,type:'Chance',title:'Besuch aus dem Vorstand',diff:5,to:'BL',icon:'visitor',text:'Dr. Kessler will sich die Vorstudie zeigen lassen.',win:'Dr. Kessler ist beeindruckt!',esc:'Der Termin wird abgesagt.',
   read:'Dr. Kessler kommt Donnerstag persönlich auf den Betriebshof. Er will die Vorstudie sehen und, wie er sagt, „ein Gefühl für den Ort bekommen“. Er bringt seine Assistentin mit.',qa:'„Wie lange bleibt er?“ Eine Stunde. „Was erwartet er?“ Dass ihr wisst, was ihr tut.',opts:[
    {id:'a',label:'Vorbereiten wie eine Prüfung',text:'Probelauf, Zahlen, Rundgang. Die Woche ist damit durch.',chips:2,resolve:true,standing:2,endRound:true,out:'Dr. Kessler bleibt zwei Stunden statt einer. Beim Gehen sagt er: „Weiter so.“'},
    {id:'w',label:'Spontan zeigen',text:'Authentisch, sagst du.',chips:1,roll:{diff:5,fail:{standing:-1}},resolve:true,standing:2,out:'Ihr geht einfach los.'}]},
  {id:12,type:'Chance',title:'Erfahrene Kollegin zurück',diff:4,to:'TP',icon:'door',text:'Eine Kollegin kommt früher aus der Elternzeit zurück und kennt das Thema.',win:'Verstärkung! Alle bekommen einen Chip.',esc:'Sie wird einem anderen Projekt zugeteilt.',
   read:'Die Kollegin, die vor zwei Jahren das Depot-Konzept geschrieben hat, kommt drei Monate früher aus der Elternzeit zurück. Die Personalabteilung hat noch keine Stelle für sie. Süd hat schon gefragt.',qa:'„Kann sie sofort anfangen?“ Wenn ihr schnell seid. „Will sie zu uns?“ Sie will arbeiten.',opts:[
    {id:'a',label:'Stelle sichern',text:'Du gehst durch die Personalabteilung, bevor Süd es tut. Das kostet dich den Tag.',chips:2,resolve:true,chipsAll:1,endRound:true,out:'Drei Unterschriften, ein Telefonat mit Süd, das kurz war. Sie fängt Montag an.'},
    {id:'w',label:'Mündlich zusagen',text:'Formalien später.',chips:1,roll:{diff:4,fail:{}},resolve:true,chipsAll:1,out:'Ihr gebt euch die Hand.'}]},
  {id:13,type:'Störung',title:'Signalstörung im Berufsverkehr',diff:5,to:'TB',icon:'signal',text:'Die Stellwerkstechnik meldet Fehler, auf zwei Abschnitten fahren die Züge auf Sicht.',esc:'Der Rückstau reicht bis in die Innenstadt.',
   read:'7:50 Uhr, Berufsverkehr. Das Stellwerk meldet Fehler auf zwei Abschnitten, die Signale fallen auf Rot. Die Züge fahren auf Sicht, Schrittgeschwindigkeit, und hinter jedem Zug wird die Lücke größer.',qa:'„Was sagt die Technik?“ Vielleicht ein Reset, vielleicht eine Platine. „Wie lange?“ Bei einem Reset zehn Minuten. Sonst der Tag.',opts:[
    {id:'a',label:'Betriebsleitung übernimmt den Funk',text:'Du sitzt den Vormittag in der Leitstelle.',chips:2,resolve:true,endRound:true,out:'Vier Stunden Funk. Die Züge kommen durch. Du nicht mehr zu viel anderem.'},
    {id:'b',label:'Takt ausdünnen und ankündigen',text:'Weniger Züge, aber verlässlich.',chips:1,resolve:true,standing:-1,out:'Jede zweite Fahrt fällt aus, angekündigt. Die Fahrgäste sind sauer, aber informiert. Dr. Kessler liest es in der Zeitung.'},
    {id:'w',label:'Reset vom Tisch aus',text:'Die Technik sagt, ein Neustart reicht meistens.',chips:1,roll:{diff:5,fail:{escalateNow:true}},resolve:true,out:'Jemand drückt den Knopf.'}]},
  {id:14,type:'Störung',title:'Unwetterwarnung',diff:4,to:'MA',icon:'storm',text:'Für die Nacht ist Sturm angesagt, Äste auf den Gleisen sind sicher.',esc:'Drei Linien stehen bis in den Vormittag.',
   read:'Der Wetterdienst warnt für die Nacht vor Sturm, Stufe drei. Entlang der Nordstrecke stehen alte Pappeln. Beim letzten Sturm lagen drei davon auf den Gleisen, bis mittags.',qa:'„Wie sicher ist die Warnung?“ So sicher wie Wetter. „Was kostet Bereitschaft?“ Leute, die nachts wach sind.',opts:[
    {id:'a',label:'Bereitschaft aufstocken',text:'Zwei Trupps mehr, Material vorgelagert, und morgen fehlen sie.',chips:2,resolve:true,nextChips:-1,out:'Um drei Uhr nachts fällt die erste Pappel. Um vier ist die Strecke frei. Die Trupps schlafen den Tag.'},
    {id:'b',label:'{MA} übernimmt die Nacht',text:'Freiwillig, sagt {MA}.',chips:1,payer:'MA',resolve:true,noPair:'MA',out:'{MA} sitzt mit Thermoskanne im Bereitschaftswagen. Es wird eine lange Nacht.'},
    {id:'w',label:'Wird schon nicht so schlimm',text:'Die Warnungen sind oft übertrieben.',chips:1,roll:{diff:4,fail:{standing:-2}},resolve:true,out:'Ihr geht schlafen.'}]},
  {id:15,type:'Team',title:'Kündigung im Leitstand',diff:5,to:'TB',icon:'chair',text:'Ein erfahrener Disponent geht zum Monatsende.',esc:'Die Nachtschichten sind nicht mehr besetzt.',
   read:'Der Disponent mit den meisten Nachtschichten kündigt zum Monatsende, ein privater Grund, kein Streit. Die Nachtschichten im Leitstand hängen an ihm. Eine Nachbesetzung dauert normalerweise vier Monate.',qa:'„Kann man ihn halten?“ Nein, er zieht weg. „Wer kann Nacht?“ Zwei Leute, beide schon am Limit.',opts:[
    {id:'a',label:'Nachbesetzung aus Süd',text:'Frau Brandt leiht jemanden aus, nicht umsonst.',chips:1,resolve:true,nachbar:true,out:'Ab Montag sitzt ein Disponent aus Süd im Leitstand. Er ist gut. Er grüßt von Frau Brandt.'},
    {id:'b',label:'Intern ausbilden',text:'Jemand aus dem Team wächst rein, langsam.',chips:2,resolve:true,later:{card:105,delay:1},out:'Ein Fahrer will in den Leitstand. Er kann es lernen. Es wird dauern.'},
    {id:'w',label:'Ausschreiben und warten',text:'Vielleicht meldet sich schnell jemand.',chips:1,roll:{diff:5,fail:{}},resolve:true,out:'Die Anzeige ist online.'}]},
  {id:16,type:'Team',title:'Betriebsrat fragt nach Überstunden',diff:5,to:'BL',icon:'scales',text:'Der Betriebsrat will die Überstundenliste des Quartals sehen.',esc:'Es gibt eine förmliche Beschwerde.',
   read:'Der Betriebsratsvorsitzende steht mit einem Zettel in deiner Tür. Er will die Überstundenliste des Quartals, bis Freitag, schriftlich. Er lächelt dabei. Die Liste ist nicht schön.',qa:'„Ist das sein Recht?“ Ja. „Wie schlimm ist die Liste?“ Zwei Leute über dem Limit, seit Monaten.',opts:[
    {id:'a',label:'Zahlen offenlegen',text:'Die Liste ist nicht schön.',chips:1,resolve:true,standing:-1,out:'Der Betriebsrat bedankt sich. Die Liste geht an die Personalabteilung, und von dort weiter nach oben.'},
    {id:'b',label:'Gespräch mit Betriebsrat und Team',text:'Ursachen statt Zahlen, und eine Zusage, die dich bindet.',chips:2,resolve:true,nextChips:-1,out:'Nach dem Gespräch gibt es einen Plan für weniger Überstunden. Du hast versprochen, ihn selbst zu überwachen.'},
    {id:'w',label:'Formal korrekt antworten',text:'Alles im Rahmen, steht im Brief.',chips:1,roll:{diff:5,fail:{later:{card:104,delay:1}}},resolve:true,out:'Der Brief ist juristisch einwandfrei.'}]},
  {id:17,type:'Team',title:'Die Neue wird ausgegrenzt',diff:5,to:'MA',icon:'alone',text:'Die neue Kollegin in der Schicht sitzt in der Pause allein.',esc:'Sie hat sich krankgemeldet.',
   read:'Seit sechs Wochen ist eine neue Fahrerin in der Spätschicht. Sie fährt gut. In der Pause sitzt sie allein, im Gruppenchat wird sie nicht erwähnt, beim Dienstwechsel bekommt sie die schlechten Touren. Niemand hat etwas gegen sie, sagen alle.',qa:'„Hat sie sich beschwert?“ Nein. „Woher weißt du es dann?“ Du hast hingeschaut.',opts:[
    {id:'a',label:'{MA} nimmt sie unter die Fittiche',text:'Pausen, Fahrten, Fragen: {MA} ist dran.',chips:1,payer:'MA',resolve:true,noPair:'MA',out:'{MA} setzt sich in der Pause zu ihr. Beim dritten Mal setzen sich andere dazu.'},
    {id:'b',label:'Teamrunde: Rollen klären',text:'Unangenehm, wirksam, und du bist den Nachmittag los.',chips:2,resolve:true,endRound:true,out:'Eine Stunde Schweigen, dann sagt jemand, was alle denken. Danach ist es besser. Der Nachmittag ist weg.'},
    {id:'w',label:'Das renkt sich ein',text:'Jeder war mal neu.',chips:1,roll:{diff:5,fail:{later:{card:106,delay:1}}},resolve:true,out:'Du wartest.'}]},
  {id:18,type:'Politik',title:'Zentrale will Kennzahlen täglich',diff:5,to:'BL',icon:'chart',text:'Ab sofort täglich ein Report, Vorlage anbei.',esc:'Die Zentrale fragt, warum nichts kommt.',
   read:'Eine Mail aus der Konzernzentrale, an alle Fachgebiete: Ab sofort täglich bis 9 Uhr ein Kennzahlenreport, Vorlage anbei, vierzehn Felder. Die Vorlage ist für Busbetriebe gemacht.',qa:'„Wer liest das?“ Ein Controller. „Was passiert, wenn wir nicht liefern?“ Eine Erinnerung. Dann eine zweite.',opts:[
    {id:'a',label:'Liefern, Assistenz abstellen',text:'Jemand tippt ab jetzt jeden Morgen Zahlen.',chips:1,resolve:true,nextChips:-1,out:'Jeden Morgen um halb neun sitzt jemand an der Vorlage. Die Zahlen stimmen. Die Zeit fehlt woanders.'},
    {id:'b',label:'Auf wöchentlich hochverhandeln',text:'Zwei Termine, gute Argumente, und die Zentrale merkt sich den Namen.',chips:2,resolve:true,standing:-1,out:'Wöchentlich reicht, sagt die Zentrale schließlich. Dr. Kessler hört, dass Nord-Ost „Diskussionsbedarf“ hatte.'},
    {id:'w',label:'Ignorieren',text:'Das versandet, denkst du.',chips:1,roll:{diff:6,fail:{standing:-2}},resolve:true,out:'Die Mail bleibt ungelesen.'}]},
  {id:19,type:'Chance',title:'Interview-Anfrage Fachzeitschrift',diff:5,to:'BL',icon:'mic',text:'Eine Fachzeitschrift will über euer Fachgebiet berichten.',win:'Der Artikel erscheint, und die Vorstudie steht drin.',esc:'Die Redaktion nimmt einen anderen Bereich.',
   read:'„Der Nahverkehr“ plant ein Heft über Betriebshöfe im Umbruch. Die Redakteurin hat von eurer Vorstudie gehört und will ein Interview, nächste Woche, mit Fotos. Dr. Kessler liest das Heft.',qa:'„Dürfen wir das?“ Mit Freigabe der Kommunikation. „Was, wenn es schiefgeht?“ Dann steht es gedruckt.',opts:[
    {id:'a',label:'Vorbereitet antworten',text:'Kernbotschaften, Freigabe, Fotos. Die Woche ist voll damit.',chips:2,resolve:true,standing:1,project:1,endRound:true,out:'Das Interview ist gut. Die Vorstudie steht auf Seite 12, mit Foto. Die Woche ist trotzdem vorbei.'},
    {id:'w',label:'Spontan zusagen',text:'Du redest gern.',chips:1,roll:{diff:5,fail:{standing:-1}},resolve:true,standing:1,project:1,out:'Die Redakteurin kommt am Mittwoch.'}]},
  {id:20,type:'Chance',title:'Innovationsfonds ausgeschrieben',diff:5,to:'TP',icon:'fund',text:'Die Konzernzentrale fördert Vorstudien, Frist in zwei Wochen.',win:'Der Antrag ist durch, das Projekt hat Rückenwind.',esc:'Frist verpasst.',
   read:'Die Zentrale schreibt einen Innovationsfonds aus: Vorstudien zur Depot-Modernisierung werden gefördert. Frist in zwei Wochen, zwölf Seiten Antrag. Süd hat sich schon beworben, hört man.',qa:'„Wie groß ist die Chance?“ Gut, wenn der Antrag gut ist. „Wer schreibt ihn?“ Das ist die Frage.',opts:[
    {id:'a',label:'Antrag schreiben',text:'Zwei Abende, eine gute Chance, und zwei Abende weniger für alles andere.',chips:2,resolve:true,project:2,nextChips:-1,out:'Der Antrag geht um 23:58 Uhr raus. Drei Wochen später kommt die Zusage.'},
    {id:'w',label:'Kurzantrag',text:'Eine Seite, Daumen drücken.',chips:1,roll:{diff:5,fail:{}},resolve:true,project:1,out:'Eine Seite, ein Klick.'}]},
  {id:21,type:'Störung',title:'Drei Züge in der Werkstatt',diff:5,to:'TB',icon:'wrench',text:'Fahrzeugmangel: Die Reserve ist aufgebraucht.',esc:'Im Berufsverkehr fallen Fahrten aus.',
   read:'Drei Züge stehen gleichzeitig in der Werkstatt, zwei mit Radschäden, einer mit einem Kurzschluss. Die Reserve ist aufgebraucht. Ab morgen fehlen im Berufsverkehr zwei Umläufe.',qa:'„Wann sind die Züge zurück?“ Einer Donnerstag, die anderen nächste Woche. „Hat Süd Reserve?“ Süd hat immer Reserve.',opts:[
    {id:'a',label:'Reserve aus Süd',text:'Zwei Züge geliehen, Rückgabe unklar.',chips:1,resolve:true,nachbar:true,out:'Zwei Züge mit dem Logo von Süd fahren auf euren Linien. Alle sehen es.'},
    {id:'b',label:'Umlauf neu planen',text:'Mit weniger Fahrzeugen den vollen Takt halten. Die Planer sind danach durch.',chips:2,resolve:true,nextChips:-1,out:'Der neue Umlauf hält. Die Planung hat zwei Nächte durchgearbeitet und nimmt nächste Woche frei.'},
    {id:'w',label:'Fahren, bis es knallt',text:'Die Werkstatt wird schon fertig.',chips:1,roll:{diff:4,fail:{later:{card:107,delay:1}}},resolve:true,out:'Ihr fahrt mit dem, was da ist.'}]},
  {id:22,type:'Team',title:'Zwei wollen in die Vorstudie',diff:5,to:'TP',icon:'arrows',text:'Zwei Teammitglieder wollen raus aus dem Betrieb und rein ins Projekt.',esc:'Beide fahren Dienst nach Vorschrift.',
   read:'Zwei aus der Planung stehen in der Tür: Sie wollen in die Vorstudie, Vollzeit, ab sofort. Beide sind gut. Beide fehlen dann im Betrieb. Und beide haben gehört, dass die andere auch gefragt hat.',qa:'„Brauchen wir sie im Projekt?“ Mindestens eine. „Und im Betrieb?“ Beide.',opts:[
    {id:'a',label:'Beide reinholen',text:'Das Projekt freut sich, der Betrieb wird dünn.',chips:1,resolve:true,project:1,standing:-1,out:'Die Vorstudie bekommt zwei kluge Köpfe. Die Planung im Betrieb arbeitet ab jetzt zu zweit statt zu viert.'},
    {id:'b',label:'Eine Person, klar begründet',text:'Ein Gespräch, in dem jemand enttäuscht wird, und das dich Kraft kostet.',chips:2,resolve:true,nextChips:-1,out:'Eine geht ins Projekt, eine bleibt. Die, die bleibt, sagt: „Verstehe ich.“ Sie meint es nicht so.'},
    {id:'w',label:'Entscheidung vertagen',text:'Nächste Woche, versprochen.',chips:1,roll:{diff:5,fail:{}},resolve:true,out:'Ihr vertagt.'}]},
];
const FOLLOW = [
  {id:101,type:'Störung',title:'Erschöpfte Schicht',diff:5,to:'TB',icon:'tired',text:'Die Überstunden vom Oberleitungsschaden fordern ihren Preis.',esc:'Zwei Fahrer:innen fallen länger aus.',
   read:'Die Überstunden vom Oberleitungsschaden sind nicht vergessen. Drei Krankmeldungen in der Frühschicht, kurze Zündschnüre im Pausenraum, ein Fahrer hat am Steuer geweint. Das Team ist leer.',qa:'„Ist das unsere Schuld?“ Ja. „Was hilft?“ Zeit, die ihr nicht habt.',opts:[
    {id:'a',label:'Freizeitausgleich',text:'Alle bekommen ihre Stunden zurück, jetzt, und der Plan wird dünn.',chips:2,resolve:true,nextChips:-1,out:'Eine Woche lang fährt die Frühschicht mit Mindestbesetzung. Es geht gerade so.'},
    {id:'b',label:'Durchhalten',text:'Noch zwei Wochen, dann wird es ruhiger.',chips:1,resolve:true,standing:-1,out:'Die Schicht hält durch. Der Betriebsrat schreibt an Dr. Kessler.'},
    {id:'w',label:'Motivationsrede',text:'Kaffee und Kuchen im Pausenraum.',chips:1,roll:{diff:5,fail:{standing:-1}},resolve:true,out:'Du stellst dich in den Pausenraum.'}]},
  {id:102,type:'Team',title:'Werkstatt zieht sich zurück',diff:5,to:'TP',icon:'doorclose',text:'Nach dem Machtwort liefert die Werkstatt nur noch das Nötigste.',esc:'Die Werkstatt hat die Mitarbeit an der Vorstudie offiziell beendet.',
   read:'Seit dem Machtwort liefert die Werkstatt nur noch, was im Auftrag steht. Mails werden kurz, Termine werden abgesagt, das Wissen über die Hallen bleibt in der Halle.',qa:'„Sind sie beleidigt?“ Sie sind übergangen worden. „Brauchen wir sie?“ Für das Depot-Kapitel: ja.',opts:[
    {id:'a',label:'Zurückholen',text:'Du gehst hin und hörst dir alles an. Das dauert.',chips:2,resolve:true,endRound:true,out:'Zwei Stunden in der Halle, der Meister redet, du hörst zu. Am Ende sagt er: „Na gut.“'},
    {id:'b',label:'Ohne sie weiter',text:'Das Projekt verliert Wissen.',chips:1,resolve:true,project:-1,out:'Das Depot-Kapitel wird vom Schreibtisch aus geschrieben. Man merkt es.'},
    {id:'w',label:'Mail an alle',text:'Appell an den Teamgeist.',chips:1,roll:{diff:5,fail:{project:-1}},resolve:true,out:'Die Mail hat drei Absätze.'}]},
  {id:103,type:'Störung',title:'Ausfall Spezialwissen',diff:6,to:'MA',icon:'puzzle',text:'Die Person mit dem Spezialwissen ist ausgefallen, niemand kennt das Stellwerk.',esc:'Ein Teilsystem steht still.',
   read:'Sie hat es nicht geschafft. Krankmeldung, sechs Wochen, Diagnose nicht euer Thema. Das alte Stellwerk meldet einen Fehler, und niemand im Haus weiß, was die Meldung bedeutet.',qa:'„Gibt es eine Doku?“ Eine, von 2019, unvollständig. „Der Hersteller?“ Existiert nicht mehr.',opts:[
    {id:'a',label:'Externe holen',text:'Teuer, schnell, fremd, und der Vorstand fragt, warum ihr das nicht selbst könnt.',chips:2,resolve:true,standing:-1,out:'Ein Ingenieurbüro kommt am Dienstag. Die Rechnung geht nach oben.'},
    {id:'b',label:'Projekt pausieren',text:'Die Vorstudie wartet, bis jemand sich eingearbeitet hat.',chips:1,resolve:true,project:-1,out:'Zwei Leute aus dem Projekt lesen die Doku von 2019.'},
    {id:'w',label:'Handbuch und Hoffnung',text:'Es gibt eine Doku von 2019.',chips:1,roll:{diff:6,fail:{standing:-1}},resolve:true,out:'Ihr blättert.'}]},
  {id:104,type:'Politik',title:'Gerücht im Depot',diff:5,to:'BL',icon:'bubbles',text:'Im Depot heißt es, die Bereichsleitung habe die Kontrolle verloren.',esc:'Das Gerücht hat Dr. Kessler erreicht.',
   read:'Im Depot wird geredet: Die Bereichsleitung wisse nicht, was in den Schichten los ist, die Vorstudie sei wichtiger als die Leute. Niemand sagt es dir ins Gesicht. Die Assistentin von Dr. Kessler hat es schon gehört.',qa:'„Wer streut das?“ Niemand streut. Es wächst. „Stimmt es?“ Ein bisschen.',opts:[
    {id:'a',label:'Offen ansprechen',text:'Du stellst dich in die Kantine.',chips:1,resolve:true,standing:-1,out:'Du sagst, was du gehört hast, und fragst, was dran ist. Es wird still. Dann redet jemand. Dr. Kessler hört von der „Krisensitzung“.'},
    {id:'b',label:'Rundgang und Gespräche',text:'Drei Tage, viele Einzelgespräche, kaum Schreibtisch.',chips:2,resolve:true,endRound:true,out:'Drei Tage Pausenräume, Werkstatt, Leitstand. Am Ende weißt du mehr als vorher. Der Schreibtisch ist voll.'},
    {id:'w',label:'Aussitzen',text:'Gerüchte sterben von allein.',chips:1,roll:{diff:5,fail:{standing:-1}},resolve:true,out:'Du sagst nichts.'}]},
  {id:105,type:'Team',title:'Einarbeitung frisst Zeit',diff:4,to:'TB',icon:'clockman',text:'Der neue Disponent braucht jemanden an seiner Seite.',esc:'Fehler in der Disposition, zwei Ausfälle.',
   read:'Der Fahrer, der in den Leitstand wechselt, lernt schnell, aber der Leitstand verzeiht keine Fehler. Er braucht jemanden neben sich, drei Wochen lang, in jeder Schicht.',qa:'„Wer kann das?“ Die, die schon zu viel machen. „Was, wenn niemand?“ Dann lernt er an echten Fehlern.',opts:[
    {id:'a',label:'{MA} wird Pate',text:'{MA} erklärt, wie der Laden läuft.',chips:1,payer:'MA',resolve:true,noPair:'MA',out:'{MA} sitzt neben ihm, drei Wochen, und erklärt jede Entscheidung zweimal.'},
    {id:'b',label:'Selbst einarbeiten',text:'Du sitzt daneben, und sonst nirgends.',chips:2,resolve:true,endRound:true,out:'Du bist im Leitstand. Alles andere wartet.'},
    {id:'w',label:'Learning by doing',text:'Er wird es schon merken.',chips:1,roll:{diff:4,fail:{standing:-1}},resolve:true,out:'Er sitzt allein am Pult.'}]},
  {id:106,type:'Team',title:'Die Neue kündigt',diff:6,to:'MA',icon:'letter',text:'Die neue Kollegin hat die Kündigung auf dem Tisch.',esc:'Sie ist weg, die Schicht ist unterbesetzt.',
   read:'Die neue Fahrerin hat gekündigt, Probezeit, zwei Wochen Frist. In der Begründung steht nichts. Sie fährt weiter gut, bis zum letzten Tag, und sitzt in der Pause allein.',qa:'„Kann man sie umstimmen?“ Vielleicht. „Will sie das?“ Sie will gefragt werden.',opts:[
    {id:'a',label:'Halten: Gespräch und Zusage',text:'Du versprichst, dass sich etwas ändert, und meinst es. Das bindet dich.',chips:2,resolve:true,nextChips:-1,out:'Sie zieht die Kündigung zurück. Du hast versprochen, selbst hinzuschauen. Das wirst du jetzt müssen.'},
    {id:'b',label:'Gehen lassen',text:'Manche passen nicht.',chips:1,resolve:true,standing:-1,out:'Sie geht. Die Schicht fährt mit einer Person weniger, und Dr. Kessler fragt nach der Fluktuation.'},
    {id:'w',label:'Prämie anbieten',text:'Geld hilft, manchmal.',chips:1,roll:{diff:6,fail:{standing:-1}},resolve:true,out:'Du nennst eine Zahl.'}]},
  {id:107,type:'Störung',title:'Zug mit Fahrgästen im Tunnel',diff:6,to:'TB',icon:'tunnel',text:'Ein Zug ist liegen geblieben, 200 Fahrgäste, kein Licht.',esc:'Bilder aus dem Tunnel sind in den Nachrichten.',
   read:'Es hat geknallt. Ein Zug, der nicht in die Werkstatt durfte, steht im Tunnel unter dem Fluss, 200 Fahrgäste, Notlicht, kein Handyempfang. Die ersten Fotos sind trotzdem schon draußen.',qa:'„Gefahr für die Leute?“ Nein, nur Dunkelheit und Wut. „Wie lange bis zum Schleppzug?“ Vierzig Minuten.',opts:[
    {id:'a',label:'Evakuierung, alle Mann',text:'Alles, was Beine hat, in den Tunnel.',chips:3,resolve:true,endRound:true,out:'Nach zwanzig Minuten gehen die Fahrgäste zu Fuß mit Taschenlampen zur Station. Sie klatschen sogar. Das Fachgebiet ist den Tag über leer.'},
    {id:'b',label:'Warten auf den Schleppzug',text:'Vierzig Minuten im Dunkeln.',chips:1,resolve:true,standing:-2,out:'Vierzig Minuten. Die Fotos aus dem Tunnel laufen am Abend in den Nachrichten.'},
    {id:'w',label:'Fahrer versucht Neustart',text:'Manchmal geht es wieder.',chips:1,roll:{diff:6,fail:{standing:-2}},resolve:true,out:'Der Fahrer dreht den Schlüssel.'}]},
  {id:108,type:'Team',title:'Nacharbeit an der Vorstudie',diff:5,to:'TP',icon:'eraser',text:'Der schnelle Abschnitt von neulich hält der Prüfung nicht stand.',esc:'Der Fehler ist Dr. Kessler aufgefallen.',
   read:'Das Kapitel, das ihr schnell geschrieben habt, ist durch die Fachprüfung gefallen: falsche Annahmen bei den Hallenmaßen, eine Tabelle aus dem alten Konzept. Es muss neu, bevor es jemand im Vorstand liest.',qa:'„Wie viel ist falsch?“ Genug. „Hat es schon jemand gesehen?“ Noch nicht.',opts:[
    {id:'a',label:'Nacharbeiten',text:'Diesmal gründlich, und diese Woche nichts anderes.',chips:2,resolve:true,endRound:true,out:'Das Kapitel wird neu geschrieben. Es ist jetzt gut. Die Woche ist vorbei.'},
    {id:'b',label:'So lassen',text:'Ein Kapitel fliegt raus.',chips:1,resolve:true,project:-1,out:'Das Kapitel wird gestrichen. Die Vorstudie ist dünner.'},
    {id:'w',label:'Fußnote',text:'Eine Einschränkung im Kleingedruckten.',chips:1,roll:{diff:5,fail:{project:-1}},resolve:true,out:'Ihr setzt eine Fußnote.'}]},
  {id:109,type:'Politik',title:'Süd will mitreden',diff:5,to:'TP',icon:'point',text:'Frau Brandt erinnert an ihre Hilfe und will jetzt in der Vorstudie mitentscheiden.',esc:'Süd präsentiert eure Vorstudie als gemeinsame.',
   read:'Frau Brandt ruft an, freundlich wie immer. Süd habe ja geholfen, und jetzt wolle man gern „die Perspektive von Süd“ in der Vorstudie sehen. Ein Kapitel, ein Logo, ein Name auf dem Deckblatt.',qa:'„Hat sie ein Recht darauf?“ Kein formales. „Kann sie uns schaden?“ Sie kann bei Dr. Kessler anrufen.',opts:[
    {id:'a',label:'Mitreden lassen',text:'Ein Kapitel geht in fremde Hände.',chips:1,resolve:true,project:-1,out:'Das Deckblatt hat jetzt zwei Logos.'},
    {id:'b',label:'Freundlich abgrenzen',text:'Dank ja, Mitsprache nein.',chips:2,resolve:true,standing:-1,out:'Frau Brandt sagt: „Natürlich.“ Am Abend telefoniert sie mit Dr. Kessler.'},
    {id:'w',label:'Gegenangebot',text:'Ihr helft Süd beim nächsten Mal.',chips:1,roll:{diff:5,fail:{project:-1}},resolve:true,out:'Du bietest einen Tausch an.'}]},
];
const ALL_CARDS=[...EVENTS,...FOLLOW];
const CARD=id=>ALL_CARDS.find(c=>c.id===id);
const SEEDED_EVENTS=[8,10];
const PROJECT_OPTS=[
  {id:'g',label:'Gründlich',text:'Sauber recherchiert, sauber geschrieben, und sonst diese Woche nichts.',chips:2,project:1,endRound:true,out:'Ein Kapitel steht. Du hast es ganz geschrieben, und sonst nichts.'},
  {id:'s',label:'Schnell',text:'Erst mal etwas Vorzeigbares.',chips:1,project:1,later:{card:108,delay:2},out:'Zehn Seiten in zwei Tagen. Sie sehen gut aus.'},
  {id:'n',label:'Süd einbinden',text:'Die haben Leute und Interesse.',chips:1,project:1,nachbar:true,out:'Zwei Leute aus Süd schreiben mit. Frau Brandt bekommt den Entwurf in Kopie.'},
  {id:'w',label:'Wagnis',text:'Du setzt auf eine Idee, die entweder trägt oder nicht.',chips:1,project:1,roll:{project:true,fail:{}},out:'Du schreibst die Idee auf und zeigst sie herum.'},
];
const CALL_QUESTIONS=['Warum stehen noch Karten offen, obwohl Sie vier Leute haben?','Wer hat entschieden, die Störung liegen zu lassen?','Wie weit ist die Vorstudie, in einem Satz?','Was wusste Ihr Team, das Sie mir nicht gesagt haben?','Warum habe ich das von Frau Brandt erfahren?','Was ist Ihr Plan, falls das nächste Woche wieder passiert?','Wen in Ihrem Team haben Sie diese Woche überfordert?','Was hätten Sie anders gemacht?','Warum sehe ich keinen Fortschritt bei der Vorstudie?','Ich höre, bei Ihnen fahren Züge aus Süd. Stimmt das?'];

// Eigenart-Karten: jede Eigenart ist eine Stärke, die zu weit geht. Bonus und Malus kommen aus derselben Eigenschaft.
// nr = Augenzahl auf dem W12. aktiv = hat einen eigenen Knopf im Zug.
const EIGENARTEN = [
  {key:'neinsagen',nr:1,name:'Kann nicht Nein sagen',quote:'„Klar mach ich das noch.“',staerke:'Hilfsbereitschaft',
   bonus:'Wenn du hilfst, zählst du +3 statt +2.',malus:'Jedes zweite Helfen in einer Woche: ein Strich auf deinem Erschöpfungsmarker.'},
  {key:'perfekt',nr:2,name:'Perfektionist:in',quote:'„Das geht noch besser.“',staerke:'Qualitätsbewusstsein',
   bonus:'„Gründlich“ bringt dir Projekt +2, kostet dich aber einen Chip mehr.',malus:'„Schnell“ ist für dich gesperrt, und deine Wagnisse sind −1.'},
  {key:'bauch',nr:3,name:'Bauchmensch',quote:'„Wird schon.“',staerke:'Mut',aktiv:true,
   bonus:'Nach einem misslungenen Wagnis darfst du nachlegen: 1 Chip, Nachwurf mit denselben Boni (1× pro Woche).',malus:'Deine erste Handlung jeder Woche muss ein Wagnis sein. Und Begründen bringt dir nichts, du entscheidest ja aus dem Bauch.'},
  {key:'flurfunk',nr:4,name:'Flurfunk-Antenne',quote:'„Ich hab da was gehört …“',staerke:'Neugier',aktiv:true,
   bonus:'Du darfst die oberste Ereigniskarte ansehen (1× pro Woche, kostet keinen Zug).',malus:'Kommt genau diese Karte und bleibt liegen, kostet sie 1 Vertrauen extra: „Sie wussten es doch!“'},
  {key:'ruhe',nr:5,name:'Die Ruhe selbst',quote:'„Abwarten und Tee trinken.“',staerke:'Gelassenheit',aktiv:true,
   bonus:'Eine Karte darf liegen bleiben, ohne Vertrauen zu kosten (1× pro Woche, kostet keinen Zug).',malus:'Diese Karte wird dafür doppelt schwerer: Hürde +2 statt +1.'},
  {key:'folien',nr:6,name:'Folienkönig:in',quote:'„Ich hab da mal was vorbereitet.“',staerke:'Begeisterung',
   bonus:'Im Vorstands-Call darfst du statt der Bereichsleitung antworten, mit +2.',malus:'Bei Störungen sind deine Wagnisse −1. Im Leitstand helfen keine Folien.'},
  {key:'delegier',nr:7,name:'Delegier-Weltmeister:in',quote:'„Kannst du das mal eben übernehmen?“',staerke:'Führungsvermögen',aktiv:true,
   bonus:'Du darfst einen Chip an jemanden weitergeben (1× pro Woche, ist ein Zug).',malus:'Sichere Wege auf Karten, die an dich adressiert sind, kosten dich 1 Chip mehr.'},
  {key:'feierabend',nr:8,name:'Feierabend ist heilig',quote:'„Um vier ist Schluss.“',staerke:'Besonnenheit',
   bonus:'Bleibt dir am Wochenende ein Chip übrig, nimmst du ihn mit in die nächste Woche.',malus:'Keine Überstunden, und aus dem Puffer nimmst du nichts.'},
  {key:'sinn',nr:9,name:'Sinnsucher:in',quote:'„Aber wozu machen wir das eigentlich?“',staerke:'Sinnstiftung',
   bonus:'In der Reflexion schreibt ihr zwei Lernkarten statt einer.',malus:'Bei Störungen sind deine Wagnisse −1. Im Notfall ist keine Zeit für das Warum.'},
  {key:'hase',nr:10,name:'Alter Hase',quote:'„Hab ich alles schon gesehen.“',staerke:'Erfahrung',
   bonus:'Bei Folgekarten, den Rechnungen von früher, sind deine Wagnisse +2.',malus:'Lernkarten wirken bei dir nicht, und bei Chancen sind deine Wagnisse −1. „Haben wir immer so gemacht.“'},
  {key:'zahlen',nr:11,name:'Zahlenmensch',quote:'„Haben Sie dafür eine Quelle?“',staerke:'Klarsicht',
   bonus:'Bei Politik-Karten sind deine Wagnisse +1.',malus:'Bei Team-Karten sind deine Wagnisse −2. Menschen sind keine Zellen.'},
  {key:'kaffee',nr:12,name:'Kaffeeküchen-Diplomat:in',quote:'„Erst mal einen Kaffee.“',staerke:'Menschengespür',
   bonus:'Bei Team-Karten sind deine Wagnisse +2.',malus:'Bei Politik-Karten sind deine Wagnisse −1. Zu nett für die Vorstandsetage.'},
];
const EIG=k=>EIGENARTEN.find(x=>x.key===k);

// Die Erzählerin der Making-of-Kommentare
const ENTWICKLERIN={id:'dev',name:'Die Entwicklerin',line:'hat das Spiel gebaut und erklärt es euch',skin:'#e0bfa0',hair:'bun',hairc:'#6a3a22',cloth:'sweater',clothc:'#b8452b',bg:'#4a4f66',glasses:true,acc:'#d0a033'};

// Kopplung der Leisten: Projekt-Meilensteine bringen Vertrauen, wenig Vertrauen bremst das Projekt.
const MILESTONES=[3,6];
const SKEPSIS=3;

const DEFAULT_SETTINGS={dice:'d6',chips:3,standingStart:6,standingMax:10,projectTarget:8,rounds:4,diffMin:4,diffMax:6,eigenarten:true,turnTimer:true,turnSec:60,timeoutMode:'hard',
  events:'2,3,3,4',escPen:2,callFail:true,critOnce:true,helpB:2,bereit:5,pd:'4,5,7',wagnisPlus:1,
  puffer:true,overtime:true,stillstand:true,prio:true,kopplung:true,makingOf:'jeder'};
