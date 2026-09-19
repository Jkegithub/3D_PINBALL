# Prüfwerkzeuge

Zwei Node-Skripte ohne Abhängigkeiten. Beide lesen die Geometrie **aus
`dist/app.js`** statt sie zu duplizieren — sie können deshalb nicht veralten,
wenn das Layout sich ändert.

```bash
node tools/clearance.js      # passt der Ball geometrisch durch?
node tools/physics-test.js   # kommt er auch tatsächlich durch?
```

Beide geben bei Beanstandungen den Exitcode 1 zurück.

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

## Wann laufen lassen

Nach **jeder** Änderung an `R`, an den Flipperachsen, an Wänden, Slingshots,
Pfosten, Bumpern oder Rampeneinläufen. Diese Werte hängen enger zusammen, als
sie aussehen: bei der Umstellung auf `R = 24` am 19.09.2026 schlossen vier
Stellen gleichzeitig, von denen nur eine vorher aufgefallen war.
