# Prüfwerkzeuge

Zwei Node-Skripte ohne Abhängigkeiten. Beide lesen die Geometrie **aus
`dist/app.js`** statt sie zu duplizieren — sie können deshalb nicht veralten,
wenn das Layout sich ändert.

```bash
node tools/clearance.js              # passt der Ball geometrisch durch?
node tools/physics-test.js           # kommt er auch tatsächlich durch?
node tools/export-layout.js          # layout-data.json neu erzeugen
node tools/export-layout.js --check  # nur prüfen, ob sie noch stimmt
```

Alle geben bei Beanstandungen den Exitcode 1 zurück.

## Warum kopflos

`requestAnimationFrame` steht still, sobald das Browserfenster verdeckt ist. Eine
Prüfung im Browser meldet dann fälschlich, dass sich nichts bewegt. `harness.js`
lädt `dist/app.js` deshalb mit DOM-Attrappen in einen `vm`-Kontext und treibt
`step(1/120)` direkt — deterministisch und ohne Bildschirm.

## `clearance.js`

Rastert den Freiraum für den **Ballmittelpunkt** über das ganze Spielfeld
(Mindestabstände wie in `app.js`: Wand und Sling `R+10`, Flipper `R+18`,
Pfosten und Bumper `R+r`; Flipper in Ruhelage, das ist der enge Fall für den
Drain). Dann Flutfüllung zwischen festen Messpunkten und Binärsuche nach der
**breitesten Verbindung** — also der engsten Stelle auf der günstigsten Route.

Kein von Hand gepflegter Katalog von Engstellen; der würde beim nächsten
Layoutwechsel veralten.

Entwurfsziel seit 19.09.2026: **mindestens 12 px freie Breite auf jeder Route.**
Der Rücklauf links liegt genau darauf. Rasterweite als Argument, Vorgabe 2 px.

## `physics-test.js`

Neun Startlagen, beide Rampeneinläufe, Saucer, Plunger-Abschuss, Multiball,
Mittelloch zwischen den Flippern und die Saucer-Regelkette.
Eine Kugel gilt als festgefahren, wenn sie sich 2 s lang um weniger als 0,4 px
je Schritt bewegt. Derzeit sind alle Prüfungen hart — keine offenen Mängel.

Das **Mittelloch** wird gemessen, indem Kugeln senkrecht fallen gelassen werden
und gezählt wird, welche unten ankommen, ohne je nach oben abgelenkt worden zu
sein. Messlatte ist der Stand vor der 3D-Umstellung: 15 px. Zu weit heißt „fällt
ständig durch", zu eng heißt „die Partie endet nie".

Die **Saucer-Regelkette** prüft, dass eine Kugel nach einem Feed später noch
locken kann. Genau das war bis zum 20.09.2026 unmöglich, ohne dass irgendetwas
sich gemeldet hätte.

## `export-layout.js`

Erzeugt `dist/layout-data.json` aus `dist/app.js`. Bis zum 20.09.2026 standen die
Spielfeldmaße an zwei Stellen und waren schon einmal auseinandergelaufen; seitdem
ist `app.js` die einzige Quelle und die JSON ein Erzeugnis. **Die Datei nicht von
Hand bearbeiten** — Änderungen gehören in `app.js`, danach neu exportieren.

Die Geometrie steht darin absichtlich **nur in Pixeln**, dazu Maßstab und Ursprung.
Zwei Darstellungen derselben Sache nebeneinander wären genau die Doppelpflege, die
das Skript abschafft.

Maßstab: **1,6957 px/mm auf beiden Achsen**, verankert an der Tischbreite von
460 mm. Wer die Kugel stattdessen auf genormte 27,0 mm festnageln will, setzt im
Skript `ANKER` auf `'ball'` — dann verschieben sich Breite und Länge entsprechend.
Das ist die einzige Stellschraube.

`--check` läuft im Pages-Workflow mit und fängt einen vergessenen Export sofort ab.

## Wann laufen lassen

Nach **jeder** Änderung an `R`, an den Flipperachsen, an Wänden, Slingshots,
Pfosten, Bumpern oder Rampeneinläufen: erst `clearance.js` und `physics-test.js`,
dann `export-layout.js`. Diese Werte hängen enger zusammen, als sie aussehen:
bei der Umstellung auf `R = 24` am 19.09.2026 schlossen vier Stellen gleichzeitig,
von denen nur eine vorher aufgefallen war.
