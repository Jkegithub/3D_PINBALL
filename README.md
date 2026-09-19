# Pinball Layout Lab

Spielbarer Flipper-Prototyp im Browser. Drei Layoutentwürfe im Vergleich, einer
davon ausgespielt: **Double Helix** — zwei gegensinnig geführte Loop-Rampen, ein
mittiger Saucer, zwei Ball-Locks, anschließend 3-Ball-Multiball.

Statisches HTML, Canvas 2D, Web Audio. **Keine Abhängigkeiten, kein Buildschritt.**

**→ [Spielen](https://jkegithub.github.io/3D_PINBALL/)**

## Lokal starten

```bash
npx serve dist
```

Oder `dist/index.html` über einen beliebigen statischen Server ausliefern.
Direkt aus dem Dateisystem geöffnet funktioniert es ebenfalls, nur der
Download-Link für `layout-data.json` braucht dann einen Server.

**Steuerung am Rechner:** `←`/`A` und `→`/`D` Flipper, Leertaste Plunger, `F2` Diagnose.

**Am Telefon** ist die Spielfläche selbst das Bedienelement: linke Bildhälfte linker
Flipper, rechte Hälfte rechter Flipper, beide gleichzeitig haltbar. Hängt die Kugel
am Plunger, spannt jede Berührung stattdessen den Plunger.

## Darstellung

Die Physik rechnet in der Ebene (`x`, `y`) mit einer Höhe `z` für die Rampen.
Gezeichnet wird über eine eigene perspektivische Projektion: das um 6,5° geneigte
Spielfeld aus 50° Blickwinkel, Wände, Pfosten, Bumper und Flipper als extrudierte
Körper mit nach Tiefe sortierten Seitenflächen, Rampen als schwebende Bänder mit
Stützen und Bodenschatten.

Kein WebGL, kein Framework — nur `CanvasRenderingContext2D`.

## Maße

Tisch 460 × 808 mm, Neigung 6,5°, Kugel Ø 28,3 mm, Rampen auf +38 und +76 mm.
Maßstab **1,6957 px/mm** auf beiden Achsen, Kugelradius 24 px.

Maßgeblich ist die **Pixelgeometrie in `dist/app.js`**, die Millimeterangaben sind
daraus abgeleitet und an der Tischbreite verankert. Das Layout ist auf Spielbarkeit
getunt; die ursprünglich angegebenen 760 mm Länge stammten aus dem Entwurfspapier
und waren nie gemessen — nachgerechnet sind es 808.

`dist/layout-data.json` hält Maße, Geometrie, Regeln und Rampenpfade maschinenlesbar
vor. **Die Datei wird erzeugt, nicht gepflegt** — siehe `tools/export-layout.js`.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `dist/index.html` | Seite, HUD, Layoutvergleich, Portierungsnotizen |
| `dist/app.js` | Physik, Regelwerk, Audio, 3D-Renderer |
| `dist/styles.css` | Seitenlayout |
| `dist/layout-data.json` | Maße, Regeln, Rampenpfade |
| `tools/` | Prüfwerkzeuge, siehe [tools/README.md](tools/README.md) |

## Prüfen

```bash
node tools/clearance.js      # passt der Ball geometrisch durch?
node tools/physics-test.js   # kommt er auch tatsächlich durch?
```

Beide lesen die Geometrie aus `dist/app.js` und laufen kopflos. **Nach jeder
Änderung an Ballradius, Flipperachsen, Wänden, Slingshots, Pfosten, Bumpern oder
Rampeneinläufen laufen lassen** — diese Werte hängen enger zusammen, als sie
aussehen.

## Weiterführung

Das Layout ist auf einen Godot-Port hin entworfen: Wände als `StaticBody3D`,
Kugeln als `RigidBody3D`, Flipper als `AnimatableBody3D`, Rampenpfade als
`Curve3D`, Saucer und Gates als `Area3D`. Die Ballzustände
`ground` / `ramp` / `saucer` / `locked` sind engine-unabhängig gehalten.
