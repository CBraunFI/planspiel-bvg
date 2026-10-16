# Planspiel BVG – Hinweise für Claude Code

Statischer Prototyp, keine Build-Schritte. Alles liegt in `index.html` (Simulator), `stilprobe.html` (Stilprobe) und `docs/`.

## Veröffentlichen (einmalig)

1. `git init -b main && git add -A && git commit -m "Planspiel Hot-Seat Prototyp v2.5"`
2. Repository anlegen und pushen: `gh repo create CBraunFI/planspiel-bvg --public --source . --push`
3. GitHub Pages einschalten, Quelle „Deploy from a branch“, Branch `main`, Ordner `/ (root)`:
   `gh api -X POST repos/CBraunFI/planspiel-bvg/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"`
4. Nach ein bis zwei Minuten: https://cbraunfi.github.io/planspiel-bvg/

`.nojekyll` liegt bei, damit Pages die Dateien unverändert ausliefert. Ein Actions-Workflow ist nicht nötig.

## Danach

Jede Änderung an `index.html` auf `main` ist nach dem Push live. Der Simulator speichert Spielstände nur im Browser (localStorage), es gibt kein Backend.
