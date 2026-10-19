# Planspiel BVG – Hot-Seat-Prototyp

Entwicklungsstand des Planspiels für das JUMP-Programm (SYNK / Leada). Die digitale Fassung ist der Prototyp für die spätere Brett- und Kartenfassung. Dieses Repository enthält den spielbaren Simulator, die Stilprobe und das Spielleitungs-Heft.

- `index.html` – Simulator (Regelstand v3.0): eine Person spielt alle vier Rollen und die Spielleitung. Spielbrett mit Vertrauens- und Projektleiste, Ereigniskarten, Tableaus, Würfel. Making-of-Kommentare erklären jeden Zug aus Sicht der Entwicklerin (Schalter oben rechts, „?“ zum Nachlesen). Protokoll, Auto-Sim zum Balancing und alle Regelschalter sind hinter dem Zahnrad.
  - `css/spiel.css` – Gestaltung
  - `js/daten.js` – Szenario, Rollen, 12 Eigenart-Karten, alle Ereignis- und Folgekarten, Grundeinstellungen
  - `js/makingof.js` – Making-of-Texte und Kommentarfenster
  - `js/spiel.js` – Regeln und Spielablauf
  - `js/ansicht.js` – Brett, Karten, Bühne, Aufbau und Einstellungen
  - `js/sim.js` – Auto-Sim
  - `js/grafik.js` – Portraits, Piktogramme, Würfel, Symbole
- `druckbogen.html` – Druckbogen für den Papier-Prototyp der Brett- und Kartenfassung, erzeugt aus denselben Daten wie der Simulator: alle 31 Ereignis- und Folgekarten mit Optionen, Kosten und Wirkungs-Symbolen, Rückseiten (gespiegelt für beidseitigen Druck), 12 Eigenart-Karten, Rollen- und verdeckte Zielkarten, Projekt-Aktionskarten, Ansagekarten, Blanko-Lernkarten, Fragekarten für den Vorstands-Call, Spielhilfen, Tableaus, Spielbrett (A3 quer oder verkleinert A4 quer), Plättchen und Spielfiguren, Abrechnungsblock, Würfel zum Basteln (2 × W6, Prioritätswürfel, W12), Schachtel-Etikett und Inventar. Im Simulator führt der Button „Druckvorlagen“ in der Kopfleiste und auf dem Startbildschirm dorthin. A4 mit Schneidemarken. Oben lassen sich Bereiche, Rückseiten und Brettformat wählen, dann „Drucken“ (Ränder „Keine“, Skalierung 100 %, Hintergrundgrafiken an). Voreinstellung per Adresse, z. B. `druckbogen.html?brett=a4&rueck=0&nur=ev,kc`.
  - `css/druckbogen.css` – Druckmaße und `@media print`
  - `js/druckbogen.js` – baut alle Bögen aus `js/daten.js` und `js/grafik.js`
- `stilprobe.html` – Stilprobe für Oberfläche, Portraits und Piktogramme.
- `docs/Spielleitungsheft_v1.md` – Szenario, Rollen, Eigenarten, Regeln, Spielmaterial, alle 31 Karten mit Vorlesetexten, Designnotizen.

Zum Review: Seite öffnen, Figuren wählen, Eigenarten wählen oder auswürfeln, „Spiel starten“. Der Timer pro Zug (60 s) lässt sich unter „Regeln anpassen“ abschalten. Lokal braucht der Simulator einen kleinen Webserver (z. B. `python -m http.server`), weil er mehrere Dateien lädt.

Alles in dieser Fassung ist Arbeitsstand, kein Kundenmaterial.
