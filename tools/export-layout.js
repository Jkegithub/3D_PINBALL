// Erzeugt dist/layout-data.json aus dist/app.js.
//
// Bis zum 20.09.2026 standen die Spielfeldmasse an zwei Stellen: die echten Werte
// in app.js, ein Ausschnitt davon in layout-data.json - von Hand nachgezogen und
// schon einmal auseinandergelaufen. Seitdem ist app.js die einzige Quelle und die
// JSON ein Erzeugnis.
//
//   node tools/export-layout.js            schreibt die Datei
//   node tools/export-layout.js --check    prueft nur, Exitcode 1 bei Abweichung
//
// Die Datei enthaelt die Geometrie absichtlich NUR in Pixeln, dazu Massstab und
// Ursprung. Zwei Darstellungen derselben Sache nebeneinander waeren genau die
// Doppelpflege, die dieses Skript abschafft.

const fs = require('fs');
const path = require('path');
const { load } = require('./harness');

const ZIEL = path.join(__dirname, '..', 'dist', 'layout-data.json');

// ---------------------------------------------------------------------------
// Massstab. Entscheidung vom 20.09.2026: die Pixelgeometrie gilt, die
// Massangaben werden daran nachgezogen - nicht umgekehrt. Das Layout ist ueber
// Wochen auf Spielbarkeit getunt worden, die Millimeterangaben stammen aus dem
// Entwurfspapier und wurden nie gemessen.
//
// Verankert wird an der KUGEL: Flipperkugeln sind mit 27,0 mm genormt, das ist
// eine physikalische Groesse und keine Entwurfsentscheidung. Die Tischmasse folgen
// daraus (438,8 x 770,6 mm) - ein Kompakttisch ist ohnehin kein Normmass.
// Wer stattdessen die Tischbreite auf 460 mm festnageln will, setzt ANKER auf
// 'breite'; die Kugel wird dann 28,3 mm. Das ist die einzige Stellschraube.
const ANKER = 'ball';
const ANKERMASS = { breite: 460, ball: 27 };
// ---------------------------------------------------------------------------

// Redaktioneller Teil: Angaben, die sich nicht aus dem Code ableiten lassen.
const REDAKTION = {
  levels_mm: { PF0: 0, R1: 38, R2: 76 },
  selected_layout: 'double-helix',
  mechanisms: ['two_flippers', 'three_bumpers', 'central_saucer', 'two_loop_ramps',
               'two_ball_locks', 'three_ball_multiball'],
  rules: {
    lock_qualification: ['complete_left_loop', 'complete_right_loop', 'hit_central_saucer'],
    multiball_start: 'hit_qualified_saucer_after_two_locks',
    ball_save_seconds: 8,
    multiball_save_seconds: 10
  },
  audio: { engine: 'web-audio-synthesis', default_volume: 0.55 },
  godot_mapping: { wall: 'StaticBody3D', ball: 'RigidBody3D', flipper: 'AnimatableBody3D',
                   ramp: 'Curve3D', trigger: 'Area3D' }
};

function rund(v, n = 4) { return Math.round(v * 10 ** n) / 10 ** n; }

function baue() {
  const api = load();
  const g = api.geometry;
  const t = api.tuning;

  // Spielfeldgrenzen aus den Wandsegmenten, nicht aus Konstanten von Hand.
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  for (const w of g.walls) {
    xMin = Math.min(xMin, w[0], w[2]); xMax = Math.max(xMax, w[0], w[2]);
    yMin = Math.min(yMin, w[1], w[3]); yMax = Math.max(yMax, w[1], w[3]);
  }
  for (const a of g.aprons) for (const p of a) {
    xMin = Math.min(xMin, p[0]); xMax = Math.max(xMax, p[0]);
    yMin = Math.min(yMin, p[1]); yMax = Math.max(yMax, p[1]);
  }

  const breitePx = xMax - xMin, laengePx = yMax - yMin;
  const pxProMm = ANKER === 'breite'
    ? breitePx / ANKERMASS.breite
    : (2 * g.R) / ANKERMASS.ball;

  const mm = px => rund(px / pxProMm, 1);

  return {
    schema: 'pinball-layout/2',
    generated_by: 'tools/export-layout.js aus dist/app.js',
    warning: 'ERZEUGTE DATEI - nicht von Hand bearbeiten. Aenderungen gehoeren in dist/app.js.',

    source_units: 'Canvas-Pixel, Ursprung oben links, y zeigt hangabwaerts zum Spieler',
    scale: {
      anchor: ANKER === 'breite' ? 'Tischbreite 460 mm' : 'Kugeldurchmesser 27 mm',
      px_per_mm: rund(pxProMm),
      origin_px: [xMin, yMin],
      conversion: 'mm = (px - origin_px) / px_per_mm',
      note: 'Ein einziger Massstab fuer beide Achsen. Die Pixelgeometrie gilt, '
          + 'die Millimeterangaben sind daraus abgeleitet.'
    },

    table: {
      width_mm: mm(breitePx),
      length_mm: mm(laengePx),
      slope_degrees: 6.5,
      ball_diameter_mm: mm(2 * g.R)
    },
    levels_mm: REDAKTION.levels_mm,

    canvas_px: { width: g.W, height: g.H },
    playfield_px: { x_min: xMin, x_max: xMax, y_min: yMin, y_max: yMax, center_x: g.PF_CENTER },
    ball_px: { radius: g.R, diameter: 2 * g.R },

    // Mindestabstand des Ballmittelpunkts: min = R + margin. Steht so in
    // collideSegment/collideCircle und ist die Grundlage von tools/clearance.js.
    collision_margins_px: { wall: 10, sling: 10, flipper: 18,
                            post_bumper: 'jeweils r des Bauteils',
                            formula: 'min = ball_px.radius + margin' },

    geometry_px: {
      walls: g.walls,
      slings: g.slings,
      posts: g.posts,
      bumpers: g.bumpers,
      aprons: g.aprons,
      flippers: {
        left:  { pivot: [g.flippers.left.x,  g.flippers.left.y],
                 length: g.flippers.left.len,  rest_angle_rad: rund(g.flippers.left.a, 5) },
        right: { pivot: [g.flippers.right.x, g.flippers.right.y],
                 length: g.flippers.right.len, rest_angle_rad: rund(g.flippers.right.a, 5) }
      },
      ramp_paths: g.rampPaths,
      ramp_height_profile: 'z = sin(pi * u) * 76, u von 0 bis 1 entlang des Catmull-Rom-Pfades',
      plunger_path: g.plungerPath,
      one_way_gate: g.oneWayGate,
      saucer: { center: [g.PF_CENTER, 770], trigger_radius: 62 }
    },

    // Achtung beim Portieren: diese Werte sind Pixel und fuer den eigenen
    // 2D-Integrator bei fester 120-Hz-Schrittweite abgestimmt. Umgerechnet
    // entspricht der Hangabtrieb nur etwa 41 % eines echten 6,5-Grad-Tischs.
    // Uebernommen werden sollten Verhaeltnisse, nicht Betraege.
    physics_px: {
      fixed_step_hz: 120,
      gravity: t.gravity,
      wall_restitution: t.bounce,
      ramp_minimum_speed: t.rampMin,
      speed_cap: 1850,
      gravity_m_per_s2: rund(t.gravity / pxProMm / 1000, 3),
      real_table_gravity_m_per_s2: rund(9.81 * Math.sin(6.5 * Math.PI / 180), 3),
      note: 'Nicht physikalisch. Vor einer Portierung neu abstimmen.'
    },

    selected_layout: REDAKTION.selected_layout,
    mechanisms: REDAKTION.mechanisms,
    rules: REDAKTION.rules,
    audio: REDAKTION.audio,
    godot_mapping: REDAKTION.godot_mapping
  };
}

const text = JSON.stringify(baue(), null, 2) + '\n';

if (process.argv.includes('--check')) {
  const vorhanden = fs.existsSync(ZIEL) ? fs.readFileSync(ZIEL, 'utf8') : '';
  if (vorhanden === text) {
    console.log('layout-data.json ist auf dem Stand von app.js');
    process.exit(0);
  }
  console.error('layout-data.json weicht von dist/app.js ab.');
  console.error('Bitte "node tools/export-layout.js" laufen lassen und das Ergebnis einchecken.');
  process.exit(1);
}

fs.writeFileSync(ZIEL, text);
console.log('dist/layout-data.json geschrieben (' + text.length.toLocaleString('de-DE') + ' Zeichen)');
