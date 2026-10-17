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
- `stilprobe.html` – Stilprobe für Oberfläche, Portraits und Piktogramme.
- `docs/Spielleitungsheft_v1.md` – Szenario, Rollen, Eigenarten, Regeln, Spielmaterial, alle 31 Karten mit Vorlesetexten, Designnotizen.

Zum Review: Seite öffnen, Figuren wählen, Eigenarten wählen oder auswürfeln, „Spiel starten“. Der Timer pro Zug (60 s) lässt sich unter „Regeln anpassen“ abschalten. Lokal braucht der Simulator einen kleinen Webserver (z. B. `python -m http.server`), weil er mehrere Dateien lädt.

Alles in dieser Fassung ist Arbeitsstand, kein Kundenmaterial.
