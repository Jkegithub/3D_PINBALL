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

function melde(ok, zeile) {
  console.log((ok ? '  ok      ' : '  FEHLER  ') + zeile);
  if (!ok) fehler++;
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
melde(minAbstand >= 2 * g.R - 1,
  `Multiball-Abstand${' '.repeat(11)}kleinster ${minAbstand.toFixed(1)} px (Soll ${2 * g.R})`);

// Der Saucer nimmt genau eine Kugel auf, und er nimmt dieselbe Kugel spaeter
// wieder auf. Beides war bis 20.09.2026 kaputt: es passten zwei hinein, und
// b.saucer blieb nach dem Auswurf dauerhaft negativ, womit der Waechter !b.saucer
// die Kugel fuer immer aussperrte - sie konnte danach weder locken noch Multiball
// ausloesen. Beide Faelle stehen hier, damit das nicht zurueckkehrt.
console.log('\nSaucer:');
api.resetGame(); api.ballSaveUntil = -1;
const s1 = api.makeBall(PF - 20, 900, false), s2 = api.makeBall(PF + 20, 900, false);
s1.vy = -700; s2.vy = -700; api.balls = [s1, s2];
let gleichzeitig = 0;
for (let i = 0; i < 120 * 3; i++) {
  api.step(DT);
  gleichzeitig = Math.max(gleichzeitig, api.balls.filter(v => v.saucer > 0).length);
}
melde(gleichzeitig <= 1, `nimmt hoechstens eine Kugel${' '.repeat(2)}gleichzeitig drin: ${gleichzeitig}`);

api.resetGame(); api.ballSaveUntil = -1;
const s3 = api.makeBall(PF, 900, false); s3.vy = -700; api.balls = [s3];
let erste = null, zweite = null, frei = false;
for (let i = 0; i < 120 * 12; i++) {
  api.step(DT);
  const c = api.balls[0];
  if (!c || c.held) break;
  if (c.saucer > 0) { if (erste === null) erste = i; else if (frei) { zweite = i; break; } }
  if (erste !== null && c.saucer <= 0) {
    frei = true;
    if (i % 240 === 0) { c.x = PF; c.y = 900; c.vx = 0; c.vy = -700; }
  }
}
melde(zweite !== null,
  `dieselbe Kugel erneut${' '.repeat(7)}${zweite !== null ? 'wird nach ' + (zweite * DT).toFixed(2) + ' s wieder aufgenommen' : 'wird NIE wieder aufgenommen'}`);

// Die eigentliche Nutzlast: eine Kugel nimmt erst einen Feed (Loops dunkel),
// faehrt dann beide Loops und muss danach locken koennen. Vor dem 20.09.2026
// scheiterte genau das - die Kugel war nach dem Feed dauerhaft vom Saucer
// ausgesperrt. Zwischen den Abschnitten wird sie geparkt, damit sie nicht
// selbst Loops anzuendet; b.saucer bleibt dabei absichtlich unangetastet.
const kugel = () => api.balls[0];
function parken() { const b = kugel(); b.ramp = null; b.z = 0; b.x = PF; b.y = 1240; b.vx = 0; b.vy = 0; }
function inDenSaucer() {
  const b = kugel(); b.ramp = null; b.z = 0; b.x = PF; b.y = 900; b.vx = 0; b.vy = -700;
  let modus = 'nicht aufgenommen';
  for (let i = 0; i < 120 * 3; i++) {
    api.step(DT);
    if (!kugel()) return 'Kugel weg';
    if (kugel().saucer > 0) { modus = kugel().saucerMode; break; }
  }
  if (modus !== 'nicht aufgenommen')
    for (let i = 0; i < 120 * 2 && kugel() && kugel().saucer > 0; i++) api.step(DT);
  api.step(DT);
  if (kugel()) parken();
  return modus;
}
function ueberDenLoop(seite) {
  const b = kugel(); b.ramp = null; b.z = 0;
  b.x = g.rampPaths[seite][0][0]; b.y = 1100; b.vx = 0; b.vy = -900;
  for (let i = 0, drauf = false; i < 120 * 8; i++) {
    api.step(DT);
    if (!kugel()) break;
    if (kugel().ramp) drauf = true; else if (drauf) break;
  }
  if (kugel()) parken();
}
api.resetGame(); api.ballSaveUntil = -1;
api.balls = [api.makeBall(PF, 1240, false)];
const ersterModus = inDenSaucer();
ueberDenLoop('left');
ueberDenLoop('right');
const zweiterModus = inDenSaucer();
melde(ersterModus === 'feed', `Saucer bei dunklen Loops${' '.repeat(4)}${ersterModus} (erwartet feed)`);
melde(zweiterModus === 'lock' && api.locks === 1,
  `Lock nach vorherigem Feed${' '.repeat(3)}${zweiterModus}, locks=${api.locks} (erwartet lock, 1)`);

console.log(fehler ? `\n${fehler} Beanstandung(en)` : '\nAlle Pruefungen bestanden');
process.exit(fehler ? 1 : 0);
