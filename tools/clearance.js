// Prueft, ob der Ball ueberhaupt noch durch das Spielfeld passt.
//
// Kein Katalog von Hand gepflegter Engstellen - der wuerde beim naechsten
// Layoutwechsel veralten. Stattdessen wird der Freiraum fuer den BALLMITTELPUNKT
// gerastert und dann gefragt, welche Bereiche miteinander verbunden sind und wie
// schmal die breiteste Verbindung dazwischen ist.
//
// Mindestabstaende wie in app.js: Wand und Sling R+10, Flipper R+18, Kreis R+r.
// Die Flipper stehen in Ruhelage - das ist der enge Fall fuer den Drain.
//
// Aufruf: node tools/clearance.js [Rasterweite]

const { load } = require('./harness');

const STEP = Number(process.argv[2]) || 2;
const g = load().geometry;
const { R, PF_CENTER } = g;

const X0 = 60, X1 = 860, Y0 = 90, Y1 = 1510;
const cols = Math.floor((X1 - X0) / STEP) + 1;
const rows = Math.floor((Y1 - Y0) / STEP) + 1;

function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Hindernisse als {typ, Geometrie, Mindestabstand}
const obstacles = [];
for (const w of g.walls) obstacles.push({ seg: w, min: R + 10 });
for (const s of g.slings)
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = s[(i + 1) % s.length];
    obstacles.push({ seg: [a[0], a[1], b[0], b[1]], min: R + 10 });
  }
for (const p of g.posts.concat(g.bumpers)) obstacles.push({ circle: p, min: R + p.r });
for (const f of [g.flippers.left, g.flippers.right])
  obstacles.push({
    seg: [f.x, f.y, f.x + Math.cos(f.a) * f.len, f.y + Math.sin(f.a) * f.len],
    min: R + 18
  });

// slack[i] = wie viel Luft der Ballmittelpunkt an dieser Stelle noch hat (px).
const slack = new Float32Array(cols * rows);
for (let r = 0; r < rows; r++) {
  const y = Y0 + r * STEP;
  for (let c = 0; c < cols; c++) {
    const x = X0 + c * STEP;
    let best = Infinity;
    for (const o of obstacles) {
      const d = o.seg ? segDist(x, y, o.seg[0], o.seg[1], o.seg[2], o.seg[3])
                      : Math.hypot(x - o.circle.x, y - o.circle.y);
      const s = d - o.min;
      if (s < best) best = s;
    }
    slack[r * cols + c] = best;
  }
}

const idx = (x, y) => Math.round((y - Y0) / STEP) * cols + Math.round((x - X0) / STEP);

// Erreichbarkeit unter der Bedingung slack >= t (Flutfuellung, 4er-Nachbarschaft).
function connected(fromXY, toXY, t) {
  const start = idx(fromXY[0], fromXY[1]), goal = idx(toXY[0], toXY[1]);
  if (slack[start] < t || slack[goal] < t) return false;
  const seen = new Uint8Array(cols * rows);
  const stack = [start];
  seen[start] = 1;
  while (stack.length) {
    const i = stack.pop();
    if (i === goal) return true;
    const c = i % cols, r = (i - c) / cols;
    if (c > 0) push(i - 1);
    if (c < cols - 1) push(i + 1);
    if (r > 0) push(i - cols);
    if (r < rows - 1) push(i + cols);
  }
  return false;
  function push(j) { if (!seen[j] && slack[j] >= t) { seen[j] = 1; stack.push(j); } }
}

// Breiteste Verbindung: groesstes t, bei dem beide Punkte noch verbunden sind.
function widest(fromXY, toXY) {
  if (!connected(fromXY, toXY, 0)) return null;
  let lo = 0, hi = 200;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (connected(fromXY, toXY, mid)) lo = mid; else hi = mid;
  }
  return lo;
}

const ORTE = {
  'Schussrinne':      [812, 1200],
  'Oberfeld':         [PF_CENTER, 300],
  'ueber den Pops':   [PF_CENTER, 400],
  'Saucer':           [PF_CENTER, 770],
  'linker Flipper':   [PF_CENTER - 110, 1290],
  'rechter Flipper':  [PF_CENTER + 110, 1290],
  'Ruecklauf links':  [110, 1050],
  'Ruecklauf rechts': [714, 1050],
  'Drain':            [PF_CENTER, 1500]
};
const ROUTEN = [
  ['Oberfeld', 'linker Flipper'],
  ['Oberfeld', 'rechter Flipper'],
  ['Oberfeld', 'Ruecklauf links'],
  ['Oberfeld', 'Ruecklauf rechts'],
  ['Ruecklauf links', 'linker Flipper'],
  ['Ruecklauf rechts', 'rechter Flipper'],
  ['linker Flipper', 'Drain'],
  ['Oberfeld', 'ueber den Pops'],
  ['Oberfeld', 'Saucer']
];

console.log(`Ballradius R = ${R}  (Durchmesser ${2 * R} px)`);
console.log(`Flipperachsen ${g.flippers.left.x} / ${g.flippers.right.x}, Ruhestellung`);
console.log(`Raster ${STEP} px, ${cols} x ${rows} Zellen\n`);

let fehler = 0;
for (const [name, xy] of Object.entries(ORTE)) {
  if (slack[idx(xy[0], xy[1])] < 0) {
    console.log(`  FEHLER  Messpunkt "${name}" liegt selbst im Hindernis`);
    fehler++;
  }
}

// Entwurfsziel seit 19.09.2026: mindestens 12 px freie Breite auf jeder Route.
// Die Toleranz faengt nur die Rasterquantisierung ab, nicht die Anforderung selbst.
const ZIEL = 12, TOLERANZ = STEP / 2;

console.log('Breiteste Verbindung je Route (freie Breite fuer den Ballmittelpunkt):');
let engste = Infinity;
for (const [a, b] of ROUTEN) {
  const t = widest(ORTE[a], ORTE[b]);
  if (t === null) {
    console.log(`  ZU      ${(a + ' -> ' + b).padEnd(42)} keine Verbindung`);
    fehler++;
    continue;
  }
  const breite = 2 * t;
  engste = Math.min(engste, breite);
  const ok = breite >= ZIEL - TOLERANZ;
  console.log(`  ${ok ? 'ok    ' : 'ENG   '}  ${(a + ' -> ' + b).padEnd(42)} ${breite.toFixed(1)} px`);
  if (!ok) fehler++;
}

console.log(fehler
  ? `\n${fehler} Beanstandung(en) - Ziel sind ${ZIEL} px`
  : `\nAlle Routen offen, engste ${engste.toFixed(1)} px (Ziel ${ZIEL} px, Rastertoleranz ${TOLERANZ})`);
process.exit(fehler ? 1 : 0);
